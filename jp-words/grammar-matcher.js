class GrammarMatcher {
  constructor(sudachiInstance) {
    this.sudachi = sudachiInstance;
    this.rules = [];
  }

  addRules(grammarList) {
    let indexCounter = 1;
    for (const item of grammarList) {
      let id = item.id || indexCounter;
      let text = item.rule;
      let meaning = item.meaning || "";
      indexCounter++;

      if (!text) continue;

      const variations = text.split(/／/);
      const ruleVariations = [];

      variations.forEach((variant) => {
        // Split by tilde to separate potential prefix requirements
        // e.g., "～ていく" -> ["", "ていく"]
        const parts = variant.split(/[～~]/);

        let combinedTokens = [];

        parts.forEach((part, pIndex) => {
          const cleanPart = part.trim();
          if (!cleanPart) return;

          // CONTEXTUALIZATION FIX:
          // Prepend a dummy noun "X" to force Sudachi to interpret
          // particles (like "から") correctly as particles, not conjunctions.
          const rawJson = this.sudachi.tokenize_stringified("X" + cleanPart, 0);
          const tokens = JSON.parse(rawJson);

          // Filter out the dummy "X" (usually the first token)
          let validTokens = tokens;
          if (tokens.length > 0 && tokens[0].surface === "X") {
            validTokens = tokens.slice(1);
          }

          if (validTokens.length > 0) {
            combinedTokens = combinedTokens.concat(validTokens);
          }
        });

        if (combinedTokens.length > 0) {
          // 1. Add the strict/base variation
          ruleVariations.push(combinedTokens);

          // 2. Add "Relaxed" variation for generic verb/aux patterns
          this._addRelaxedVariations(combinedTokens, ruleVariations);
        }
      });

      this.rules.push({
        id,
        originalText: text,
        meaning: meaning,
        variations: ruleVariations,
      });
    }
  }

  _addRelaxedVariations(tokens, variationList) {
    const firstToken = tokens[0];
    const skippableDictForms = ["する", "う", "よう", "る"];

    if (
      skippableDictForms.includes(firstToken.dictionary_form) ||
      skippableDictForms.includes(firstToken.normalized_form)
    ) {
      const relaxedSequence = tokens.slice(1);
      if (relaxedSequence.length > 0) {
        variationList.push(relaxedSequence);
      }
    }
  }

  matchSentence(sentenceTokens) {
    const foundMatches = [];

    for (const rule of this.rules) {
      for (const chunks of rule.variations) {
        const matchResult = this._checkChunksInOrder(sentenceTokens, chunks);
        if (matchResult.matched) {
          foundMatches.push({
            id: rule.id,
            rule: rule.originalText,
            meaning: rule.meaning,
            indices: matchResult.indices,
          });
          break;
        }
      }
    }
    return foundMatches;
  }

  _checkChunksInOrder(sentenceTokens, grammarTokens) {
    const result = this._findSubSequence(sentenceTokens, grammarTokens);

    if (result.index === -1) return { matched: false, indices: [] };

    // Calculate matched indices range based on the actual length consumed
    const range = [];
    for (let i = 0; i < result.length; i++) {
      range.push(result.index + i);
    }

    return { matched: true, indices: range };
  }

  _findSubSequence(sentenceTokens, grammarPattern, startIndex = 0) {
    if (grammarPattern.length === 0) return { index: startIndex, length: 0 };
    if (startIndex + grammarPattern.length > sentenceTokens.length)
      return { index: -1, length: 0 };

    for (
      let i = startIndex;
      i <= sentenceTokens.length; // Allow scanning to end
      i++
    ) {
      let match = true;
      let sIndex = i;
      let gIndex = 0;
      let matchLength = 0;

      while (gIndex < grammarPattern.length) {
        if (sIndex >= sentenceTokens.length) {
          match = false;
          break;
        }

        const sToken = sentenceTokens[sIndex];
        const gToken = grammarPattern[gIndex];
        const sPos = this._getPos(sToken);
        const gPos = this._getPos(gToken);

        // --- SPECIAL MATCHING LOGIC ---

        // 1. Placeholder Noun: "節" (Rule) matches Any Noun (Sentence)
        // If the rule specifically starts with "節" (Setsu) or other placeholders,
        // we allow it to match any noun (e.g. "本") to support "～節がある" matching "本がある".
        // This is a specific relaxation for the "Setsu" (Clause/Section) -> Generic Noun mapping.
        if (gIndex === 0 && gToken.surface === "節" && sPos[0] === "名詞") {
          sIndex++;
          gIndex++;
          matchLength++;
          continue;
        }

        // 2. Polite Negative: "ない" (Rule) matches "ませ" + "ん" (Sentence)
        if (
          gToken.dictionary_form === "ない" &&
          (gPos[0] === "助動詞" || gPos[0] === "形容詞") &&
          sToken.dictionary_form === "ます" && // "Mase" is form of "Masu"
          sPos[0] === "助動詞"
        ) {
          const nextSToken = sentenceTokens[sIndex + 1];
          if (
            nextSToken &&
            (nextSToken.reading_form === "ン" || nextSToken.surface === "ん")
          ) {
            // Matched "Nai" -> "Masen"
            sIndex += 2; // Consume "Mase" + "n"
            gIndex += 1; // Consume "Nai"
            matchLength += 2;
            continue;
          }
        }

        // 3. Polite Copula: "だ" (Rule) matches "です" (Sentence)
        if (
          gToken.dictionary_form === "だ" &&
          gPos[0] === "助動詞" &&
          sToken.dictionary_form === "です" &&
          sPos[0] === "助動詞"
        ) {
          sIndex += 1;
          gIndex += 1;
          matchLength += 1;
          continue;
        }

        // 4. Optional Particle "Ni": Rule "までに" matches "まで"
        if (
          gToken.surface === "に" &&
          gPos[0] === "助詞" &&
          gIndex > 0 &&
          grammarPattern[gIndex - 1].surface === "まで"
        ) {
          if (sToken.surface !== "に") {
            gIndex += 1; // Skip "ni" in rule
            // Do NOT advance sIndex
            continue;
          }
        }

        // --- END SPECIAL LOGIC ---

        if (this._isMatch(sToken, gToken)) {
          sIndex++;
          gIndex++;
          matchLength++;
        } else {
          match = false;
          break;
        }
      }

      if (match) return { index: i, length: matchLength };
    }
    return { index: -1, length: 0 };
  }

  _getPos(token) {
    return token.poses || token.pos || [];
  }

  _isMatch(sToken, gToken) {
    const sPos = this._getPos(sToken);
    const gPos = this._getPos(gToken);
    const isFuncWord = gPos[0] === "助詞" || gPos[0] === "助動詞";

    if (isFuncWord) {
      // 1. Strict Check for Inflected Rules
      // If the rule token is NOT the dictionary form (e.g. "ましょう"),
      // we enforce strict Surface matching to avoid it matching the base form ("ます").
      if (gToken.surface !== gToken.dictionary_form) {
        return sToken.surface === gToken.surface;
      }

      // 2. Relaxed Check for Base Form Rules
      // If the rule token IS the dictionary form (e.g. "ます", "ない"),
      // we allow it to match inflected forms in the sentence (e.g. "まし", "なく").
      // We check Normalized Form equality.
      if (sToken.normalized_form === gToken.normalized_form) return true;

      // Fallback: If normalized forms differ but surfaces match exactly
      if (sToken.surface === gToken.surface) return true;

      return false;
    }

    // Content Words (Verbs, Adjectives, Nouns)
    // Allow Dictionary Form matching to handle conjugations.
    return (
      sToken.normalized_form === gToken.normalized_form ||
      sToken.dictionary_form === gToken.dictionary_form ||
      sToken.reading_form === gToken.reading_form ||
      sToken.surface === gToken.surface
    );
  }
}

export default GrammarMatcher;
