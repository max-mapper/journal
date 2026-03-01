import { GrammarRule } from "./grammar-engine.js";
import { JMDICT_POS_MAP } from "./mappings.js";
import { VerbTenseDetector } from "./tense-detector.js";
import { SudachiStateless } from "./sudachi.js";

// =====================================================================
// CORE LOGIC: Data processing, Dictionary Matching, and Grammar Engine
// =====================================================================

export class IyakuMatcher {
  constructor() {
    this.tenseDetector = new VerbTenseDetector();
    this.sudachi = null;
    this.dictDB = null;
    this.COMPOUND_LOOKAHEAD_LIMIT = 2; // havent tested perf impact
  }

  /**
   * Loads dictionary and tokenization resources.
   */
  async initialize({ rules, sudachiDictBlob, jmdictBlob }) {
    this.sudachi = new SudachiStateless();
    await this.sudachi.initialize_from_bytes(
      new Uint8Array(await sudachiDictBlob.arrayBuffer()),
    );

    this.dictDB = JSON.parse(await jmdictBlob.text());

    this.rules = rules;
  }

  katakanaToHiragana(src) {
    return src.replace(/[\u30a1-\u30f6]/g, (m) =>
      String.fromCharCode(m.charCodeAt(0) - 0x60),
    );
  }

  getReading(text) {
    if (!this.sudachi || !text) return "";
    try {
      const raw = this.sudachi.tokenize_stringified(text, 0);
      const tokens = JSON.parse(raw);
      return tokens
        .map((t) => this.katakanaToHiragana(t.reading_form))
        .join("");
    } catch (e) {
      return "";
    }
  }

  getPos(token) {
    const p = token.poses || token.pos;
    return p && p.length > 0 ? p[0] : "Unk";
  }

  shouldGroup(token) {
    const p = token.poses || token.pos;
    if (!p || p.length === 0) return false;
    const pos0 = p[0];
    if (pos0 === "助動詞" || pos0 === "接尾辞") return true;
    if (pos0 === "助詞" && p.length > 1 && p[1] === "接続助詞") return true;
    return false;
  }

  searchDictionary(term, sudachiPos) {
    if (!this.dictDB) return null;
    let indices = this.dictDB.index[term];
    if (!indices && term.length > 1) {
      indices = this.dictDB.index[term.slice(0, -1)];
    }
    if (!indices) return null;

    const entries = indices.map((idx) => this.dictDB.defs[idx]);
    if (sudachiPos && JMDICT_POS_MAP[sudachiPos]) {
      const allowedCodes = new Set(JMDICT_POS_MAP[sudachiPos]);
      const filteredEntries = [];
      for (const entrySenses of entries) {
        const validSenses = entrySenses.filter((sense) => {
          if (!sense.partOfSpeech || sense.partOfSpeech.length === 0)
            return true;
          return sense.partOfSpeech.some((code) => allowedCodes.has(code));
        });
        if (validSenses.length > 0) filteredEntries.push(validSenses);
      }
      return filteredEntries.length > 0 ? filteredEntries : null;
    }
    return entries;
  }

  /**
   * Accepts raw text and outputs an array of structured blocks (Pure JS Objects)
   * free of any UI/DOM logic.
   */
  match(text, options = {}) {
    const {
      activePOS = new Set([
        "動詞",
        "助動詞",
        "助詞",
        "名詞",
        "形容詞",
        "副詞",
        "形状詞",
        "代名詞",
        "接尾辞",
        "連体詞",
      ]),
      isGrammarEnabled = true,
    } = options;
    if (!this.sudachi || !this.dictDB || !text.trim()) return [];

    const rawTokens = JSON.parse(this.sudachi.tokenize_stringified(text, 0));
    let activeGrammar = [];

    if (isGrammarEnabled) {
      let grammarRanges = [];
      for (const ruleJson of this.rules) {
        const rule = new GrammarRule(ruleJson);
        const matches = rule.scan(rawTokens);
        matches.forEach((m) => {
          grammarRanges.push({
            start: m.index,
            end: m.index + m.length,
            data: ruleJson,
          });
        });
      }
      grammarRanges.sort(
        (a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start,
      );

      const usedTokens = new Set();
      for (const r of grammarRanges) {
        let conflict = false;
        for (let i = r.start; i < r.end; i++) {
          if (usedTokens.has(i)) conflict = true;
        }
        if (!conflict) {
          activeGrammar.push(r);
          for (let i = r.start; i < r.end; i++) usedTokens.add(i);
        }
      }

      // Extend grammar match to include trailing conjugations
      for (const match of activeGrammar) {
        let nextIdx = match.end;
        while (nextIdx < rawTokens.length) {
          if (activeGrammar.some((other) => other.start === nextIdx)) break;
          const nextToken = rawTokens[nextIdx];
          if (this.shouldGroup(nextToken)) {
            match.end++;
            nextIdx++;
          } else {
            break;
          }
        }
      }
    }

    const resultBlocks = [];
    let i = 0;

    while (i < rawTokens.length) {
      // 1. Check Grammar Matches
      const gMatch = activeGrammar.find((r) => r.start === i);
      if (gMatch) {
        let innerWords = [];
        let seenInner = new Set();
        let blockTokens = [];

        for (let j = gMatch.start; j < gMatch.end; j++) {
          const t = rawTokens[j];
          const tPos = this.getPos(t);

          blockTokens.push({
            surface: t.surface,
            reading: this.katakanaToHiragana(t.reading_form),
          });

          if (
            ["動詞", "形容詞", "形状詞", "名詞"].includes(tPos) &&
            t.dictionary_form
          ) {
            let compoundSurface = t.surface;
            for (let k = j + 1; k < gMatch.end; k++) {
              compoundSurface += rawTokens[k].surface;
            }

            let validForm = t.dictionary_form;
            if (!this.searchDictionary(validForm, tPos) && t.normalized_form) {
              if (this.searchDictionary(t.normalized_form, tPos)) {
                validForm = t.normalized_form;
              }
            }

            let tenseMatches = [];
            if (tPos === "動詞") {
              tenseMatches = this.tenseDetector.detect(
                validForm,
                compoundSurface,
              );
            }

            if (!seenInner.has(validForm)) {
              seenInner.add(validForm);
              innerWords.push({
                kanji: validForm,
                surface: compoundSurface,
                pos: tPos,
                tense: tenseMatches,
              });
            }
          }
        }

        resultBlocks.push({
          type: "grammar",
          ruleData: gMatch.data,
          tokens: blockTokens,
          innerWords: innerWords,
        });
        i = gMatch.end;
        continue;
      }

      // 2. Check Dictionary Compounds
      let bestCompound = null;
      let maxLen = 0;
      const startPos = this.getPos(rawTokens[i]);
      if (!["動詞", "形容詞", "形状詞", "助動詞", "助詞"].includes(startPos)) {
        for (
          let len = 2;
          len <= this.COMPOUND_LOOKAHEAD_LIMIT && i + len <= rawTokens.length;
          len++
        ) {
          let overlap = false;
          for (let k = 0; k < len; k++) {
            if (activeGrammar.some((r) => r.start === i + k)) {
              overlap = true;
              break;
            }
          }
          if (overlap) break;

          const slice = rawTokens.slice(i, i + len);
          const combinedSurface = slice.map((t) => t.surface).join("");

          if (this.dictDB.index[combinedSurface]) {
            bestCompound = { slice, surface: combinedSurface };
            maxLen = len;
          }
        }
      }

      if (bestCompound) {
        const groupObj = {
          isGroup: true,
          tokens: bestCompound.slice,
          baseToken: {
            ...bestCompound.slice[0],
            dictionary_form: bestCompound.surface,
            normalized_form: bestCompound.surface,
            poses: ["名詞", "一般", "*", "*", "*", "*"],
          },
          surface: bestCompound.surface,
        };
        resultBlocks.push(this._processTokenOrGroup(groupObj, activePOS));
        i += maxLen;
        continue;
      }

      // 3. Verb/Adj grouping
      const current = rawTokens[i];
      const pos = this.getPos(current);

      if (["動詞", "形容詞", "形状詞"].includes(pos)) {
        let groupTokens = [current];
        let nextIndex = i + 1;
        while (nextIndex < rawTokens.length) {
          if (activeGrammar.some((r) => r.start === nextIndex)) break;
          const nextToken = rawTokens[nextIndex];
          if (this.shouldGroup(nextToken)) {
            groupTokens.push(nextToken);
            nextIndex++;
          } else {
            break;
          }
        }
        const groupObj = {
          isGroup: true,
          tokens: groupTokens,
          baseToken: current,
          surface: groupTokens.map((t) => t.surface).join(""),
        };
        resultBlocks.push(this._processTokenOrGroup(groupObj, activePOS));
        i = nextIndex;
      } else {
        resultBlocks.push(this._processTokenOrGroup(current, activePOS));
        i++;
      }
    }

    return resultBlocks;
  }

  /**
   * Accepts raw text and outputs an array of ALL matching structured blocks
   * (Grammar rules, Dictionary compounds, and Base words), preserving overlaps.
   */
  matchAll(text, options = {}) {
    const {
      activePOS = new Set([
        "動詞",
        "助動詞",
        "助詞",
        "名詞",
        "形容詞",
        "副詞",
        "形状詞",
        "代名詞",
        "接尾辞",
        "連体詞",
      ]),
      isGrammarEnabled = true,
    } = options;
    if (!this.sudachi || !this.dictDB || !text.trim()) return [];

    const rawTokens = JSON.parse(this.sudachi.tokenize_stringified(text, 0));
    let allMatches = [];

    // 1. Process All Grammar Matches (No Conflict Filtering)
    if (isGrammarEnabled) {
      let grammarRanges = [];
      for (const ruleJson of this.rules) {
        const rule = new GrammarRule(ruleJson);
        const matches = rule.scan(rawTokens);
        matches.forEach((m) => {
          grammarRanges.push({
            start: m.index,
            end: m.index + m.length,
            data: ruleJson,
          });
        });
      }

      // Extend grammar matches to include trailing conjugations
      for (const match of grammarRanges) {
        let nextIdx = match.end;
        while (nextIdx < rawTokens.length) {
          const nextToken = rawTokens[nextIdx];
          if (this.shouldGroup(nextToken)) {
            match.end++;
            nextIdx++;
          } else {
            break;
          }
        }
      }

      // Build Grammar Blocks
      for (const gMatch of grammarRanges) {
        let innerWords = [];
        let seenInner = new Set();
        let blockTokens = [];

        for (let j = gMatch.start; j < gMatch.end; j++) {
          const t = rawTokens[j];
          const tPos = this.getPos(t);

          blockTokens.push({
            surface: t.surface,
            reading: this.katakanaToHiragana(t.reading_form),
          });

          if (
            ["動詞", "形容詞", "形状詞", "名詞"].includes(tPos) &&
            t.dictionary_form
          ) {
            let compoundSurface = t.surface;
            for (let k = j + 1; k < gMatch.end; k++) {
              compoundSurface += rawTokens[k].surface;
            }

            let validForm = t.dictionary_form;
            if (!this.searchDictionary(validForm, tPos) && t.normalized_form) {
              if (this.searchDictionary(t.normalized_form, tPos)) {
                validForm = t.normalized_form;
              }
            }

            let tenseMatches = [];
            if (tPos === "動詞") {
              tenseMatches = this.tenseDetector.detect(
                validForm,
                compoundSurface,
              );
            }

            if (!seenInner.has(validForm)) {
              seenInner.add(validForm);
              innerWords.push({
                kanji: validForm,
                surface: compoundSurface,
                pos: tPos,
                tense: tenseMatches,
              });
            }
          }
        }

        allMatches.push({
          type: "grammar",
          startIndex: gMatch.start,
          endIndex: gMatch.end,
          ruleData: gMatch.data,
          tokens: blockTokens,
          innerWords: innerWords,
        });
      }
    }

    // 2. Check Every Index for Dictionary Compounds and Words
    for (let i = 0; i < rawTokens.length; i++) {
      const startPos = this.getPos(rawTokens[i]);

      // Check for dictionary compounds starting at this index
      if (!["動詞", "形容詞", "形状詞", "助動詞", "助詞"].includes(startPos)) {
        for (
          let len = 2;
          len <= this.COMPOUND_LOOKAHEAD_LIMIT && i + len <= rawTokens.length;
          len++
        ) {
          const slice = rawTokens.slice(i, i + len);
          const combinedSurface = slice.map((t) => t.surface).join("");

          if (this.dictDB.index[combinedSurface]) {
            const groupObj = {
              isGroup: true,
              tokens: slice,
              baseToken: {
                ...slice[0],
                dictionary_form: combinedSurface,
                normalized_form: combinedSurface,
                poses: ["名詞", "一般", "*", "*", "*", "*"],
              },
              surface: combinedSurface,
            };
            const processed = this._processTokenOrGroup(groupObj, activePOS);
            processed.startIndex = i;
            processed.endIndex = i + len;
            allMatches.push(processed);
          }
        }
      }

      // Check for Verb/Adj grouping or Single token at this index
      const current = rawTokens[i];

      if (["動詞", "形容詞", "形状詞"].includes(startPos)) {
        let groupTokens = [current];
        let nextIndex = i + 1;
        while (nextIndex < rawTokens.length) {
          const nextToken = rawTokens[nextIndex];
          if (this.shouldGroup(nextToken)) {
            groupTokens.push(nextToken);
            nextIndex++;
          } else {
            break;
          }
        }
        const groupObj = {
          isGroup: true,
          tokens: groupTokens,
          baseToken: current,
          surface: groupTokens.map((t) => t.surface).join(""),
        };
        const processed = this._processTokenOrGroup(groupObj, activePOS);
        processed.startIndex = i;
        processed.endIndex = nextIndex;
        allMatches.push(processed);
      } else {
        const processed = this._processTokenOrGroup(current, activePOS);
        processed.startIndex = i;
        processed.endIndex = i + 1;
        allMatches.push(processed);
      }
    }

    // Sort by start index (asc), then by range length (desc)
    allMatches.sort(
      (a, b) =>
        a.startIndex - b.startIndex ||
        b.endIndex - b.startIndex - (a.endIndex - a.startIndex),
    );

    return allMatches;
  }

  _processTokenOrGroup(item, activePOS) {
    let tokensData = [];
    let pos = "";
    let dictForm = "";
    let normForm = "";
    let surface = "";
    let tenseData = null;

    if (item.isGroup) {
      tokensData = item.tokens.map((t) => ({
        surface: t.surface,
        reading: this.katakanaToHiragana(t.reading_form),
      }));
      const head = item.baseToken;
      pos = this.getPos(head);
      dictForm = head.dictionary_form;
      normForm = head.normalized_form;
      surface = item.surface;
    } else {
      tokensData = [
        {
          surface: item.surface,
          reading: this.katakanaToHiragana(item.reading_form),
        },
      ];
      pos = this.getPos(item);
      dictForm = item.dictionary_form;
      normForm = item.normalized_form;
      surface = item.surface;
    }

    if (pos === "動詞") {
      try {
        const matches = this.tenseDetector.detect(dictForm, surface);
        if (matches && matches.length > 0) tenseData = matches;
      } catch (e) {
        console.error("Could not detect tenses", e);
      }
    }

    let isMatch = false;
    let finalForm = dictForm;

    if (activePOS.has(pos)) {
      let compatibleEntries = this.searchDictionary(dictForm, pos);
      if (!compatibleEntries && normForm && normForm !== dictForm) {
        const normEntries = this.searchDictionary(normForm, pos);
        if (normEntries) {
          compatibleEntries = normEntries;
          finalForm = normForm;
        }
      }
      if (compatibleEntries) isMatch = true;
    }

    return {
      type: "word",
      isMatch,
      surface,
      tokens: tokensData,
      pos,
      dictForm: finalForm,
      tense: tenseData,
    };
  }
}
