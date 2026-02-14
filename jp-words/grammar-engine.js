// ==========================================
// 1. Core Matching Engine
// ==========================================
/**
Represents a single constraint on a specific token.
e.g., "Must be a Verb" or "Surface form must be 'いる'"
*/
class TokenConstraint {
  constructor({
    surface,
    surfaceEndsWith,
    pos,
    posDetail,
    conjugation,
    baseForm,
  }) {
    this.surface = surface; // Exact text match
    this.surfaceEndsWith = surfaceEndsWith; // Suffix text match
    this.pos = pos; // Main POS
    this.posDetail = posDetail; // Sub POS
    this.conjugation = conjugation; // Inflection type
    this.baseForm = baseForm; // Dictionary form
    // Check if this is a wildcard (empty constraint)
    this.isWildcard =
      !surface &&
      !surfaceEndsWith &&
      !pos &&
      !posDetail &&
      !conjugation &&
      !baseForm;
  }
  check(token) {
    if (!token) return false;
    if (this.isWildcard) return true;
    // Sudachi-wasm output structure keys
    const posArray = token.poses; // [POS, Sub1, Sub2, Sub3, ConjType, ConjForm]

    // 1. Surface Check
    if (this.surface && token.surface !== this.surface) return false;
    if (this.surfaceEndsWith && !token.surface.endsWith(this.surfaceEndsWith))
      return false;

    // 2. Base Form Check
    if (this.baseForm && token.dictionary_form !== this.baseForm) return false;

    // 3. POS Check (Index 0 - Main Category)
    if (this.pos && posArray[0] !== this.pos) return false;

    // 4. POS Detail Check (Index 1 - Sub Category)
    if (this.posDetail && posArray[1] !== this.posDetail) return false;

    // 5. Conjugation Form Check
    if (this.conjugation) {
      if (
        !posArray[5].includes(this.conjugation) &&
        !posArray[4].includes(this.conjugation)
      )
        return false;
    }

    return true;
  }
}
/**
Represents a sequence of constraints (a grammar pattern).
*/
class Pattern {
  constructor(constraints) {
    this.constraints = constraints.map((c) => new TokenConstraint(c));
  }
  matchesAt(tokens, startIndex) {
    let currentTokenIndex = startIndex;

    for (let i = 0; i < this.constraints.length; i++) {
      // If we ran out of tokens before satisfying constraints
      if (currentTokenIndex >= tokens.length) return false;

      let matched = false;

      // Try to match the current constraint, skipping punctuation if necessary
      // NOTE: We do not skip punctuation for the very first constraint to ensure
      // the match index returned by 'scan' is accurate to the start of the phrase.
      if (i === 0) {
        if (this.constraints[i].check(tokens[currentTokenIndex])) {
          matched = true;
          currentTokenIndex++;
        }
      } else {
        // For subsequent constraints, allow skipping "Auxiliary Symbols" (Punctuation)
        while (currentTokenIndex < tokens.length) {
          if (this.constraints[i].check(tokens[currentTokenIndex])) {
            matched = true;
            currentTokenIndex++;
            break;
          } else if (tokens[currentTokenIndex].poses[0] === "補助記号") {
            // Skip punctuation/symbols (comma, quotes, etc)
            currentTokenIndex++;
          } else {
            // Token is not punctuation and does not match constraint
            break;
          }
        }
      }

      if (!matched) return false;
    }
    return true;
  }
}
/**
The high-level Grammar Rule object.
*/
class GrammarRule {
  constructor(ruleJson) {
    this.id = ruleJson.id;
    this.patterns = ruleJson.patterns.map((p) => new Pattern(p));
    this.tests = ruleJson.tests;
    this.title = ruleJson.title;
    this.description = ruleJson.description;
    this.link = ruleJson.link;
  }
  scan(tokens) {
    const matches = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let pattern of this.patterns) {
        if (pattern.matchesAt(tokens, i)) {
          // Note: The length here represents the number of constraints matched,
          // not the number of tokens consumed (due to skipping).
          // For highlighting purposes, you might want to calculate the span,
          // but for checking presence, this is sufficient.
          const matchedTokens = tokens.slice(i, i + pattern.constraints.length);
          const text = matchedTokens.map((t) => t.surface).join("");
          matches.push({
            ruleId: this.id,
            index: i,
            length: pattern.constraints.length,
            text: text,
            title: this.title,
            description: this.description,
            link: this.link,
          });
          break; // Avoid overlapping matches for the same rule
        }
      }
    }
    return matches;
  }
}
async function runGrammarEngineCheck(sudachi, GRAMMAR_RULES) {
  console.log("Starting Grammar Engine Self-Test...\n");
  const successLogs = [];
  const failureLogs = [];
  let totalMatches = 0;
  for (const ruleJson of GRAMMAR_RULES) {
    const rule = new GrammarRule(ruleJson);
    for (const sentence of rule.tests) {
      const rawJson = sudachi.tokenize_stringified(sentence, 0); // Mode A
      const tokens = JSON.parse(rawJson);

      const results = rule.scan(tokens);
      if (results.length > 0) {
        totalMatches++;
        successLogs.push(`✅ [${rule.title}] MATCH: "${sentence}"`);
      } else {
        const tokenDump = tokens
          .map((t) => `${t.surface}(${t.poses[0]}:${t.poses[5]})`)
          .join(" | ");

        failureLogs.push(
          `❌ [${rule.title}] FAIL: Sentence: "${sentence}" -> No match found.\n   Tokens: ${tokenDump}`,
        );
      }
    }
  }

  // 2. Print all Successes
  console.log("\n------ SUCCESS REPORT ------");
  if (successLogs.length > 0) {
    successLogs.forEach((log) => console.log(log));
  } else {
    console.log("No successes recorded.");
  }

  // 2. Print all Failures
  console.log("\n------ FAILURE REPORT ------");
  if (failureLogs.length > 0) {
    failureLogs.forEach((log) => console.log(log));
  } else {
    console.log("No failures recorded.");
  }

  // 3. Final Summary
  console.log("\n------ SUMMARY ------");
  console.log(`Total Rules Checked: ${GRAMMAR_RULES.length}`);
  console.log(`Total Tests Passed:  ${totalMatches}`);
  console.log(`Total Tests Failed:  ${failureLogs.length}`);

  return totalMatches;
}

/**
 * Converts a single Kagome token object into a Sudachi-compatible token object.
 * @param {Object} k - The Kagome token object.
 * @returns {Object} - The Sudachi-formatted token object.
 */
function convertKagomeToSudachi(k) {
  // Na-Adjectives (丁寧):
  //   Kagome: pos: "名詞,形容動詞語幹,*,*"
  //   Mapped: poses[0] becomes "形状詞". This ensures your pos: "形状詞" grammar rules trigger.
  //   Conjugation (連用形, 未然形):
  // Kagome (IPADIC): Usually does not include the conjugation form ("連用形") in the 4-part pos string provided in your example. It is often a 7th or 9th field in full MeCab/Kagome output.
  //   Sudachi: Includes it at poses[5].
  //   Limitation: If your Kagome WASM dictionary only returns 4 POS parts (as shown in your JSON), the conjugation constraint in your schema will fail because the data isn't there. You may need to update your Kagome dictionary config to return Full features.
  // Token Splitting (話し方):
  //   Kagome: Sees 話し方 as one Noun.
  //   Sudachi: Sees 話し (Verb) + 方 (Suffix).
  //   Impact: Your kata-method example rule (which looks for a Verb + Suffix) will not trigger on Kagome output because Kagome didn't split the word. To fix this, you would need to write a specific Kagome-style rule for 話し方 as a single noun.
  // Char Offsets:
  //   Kagome provides word_position. Sudachi apps usually expect begin/end or charStart/charEnd. The function above calculates charEnd by adding the surface length to the start position.
  //   1. Split Kagome's comma-separated POS string
  const kPos = k.pos.split(",");

  /**
   * 2. Map POS Tags to align with your Reference Values.
   * Kagome (IPADIC) and Sudachi use different naming conventions.
   */
  let pos1 = kPos[0] || "*";
  let pos2 = kPos[1] || "*";

  // Example Mapping: Kagome's '形容動詞語幹' is Sudachi's '形状詞'
  if (pos2 === "形容動詞語幹") {
    pos1 = "形状詞";
    pos2 = "一般";
  }
  // Kagome's '代名詞' is often index 1 under '名詞'
  if (pos1 === "名詞" && pos2 === "代名詞") {
    pos1 = "代名詞";
    pos2 = "一般";
  }

  // 3. Construct the 6-part 'poses' array Sudachi expects
  // Index 4: Conjugation Type, Index 5: Conjugation Form
  // Note: Standard Kagome/IPADIC doesn't always provide these in the POS string.
  const poses = [
    pos1, // [0] Part of speech
    pos2, // [1] Sub-type 1
    kPos[2] || "*", // [2] Sub-type 2
    kPos[3] || "*", // [3] Sub-type 3
    "*", // [4] Conjugation Type (e.g. 五段-カ行)
    "*", // [5] Conjugation Form (e.g. 連用形)
  ];

  // 4. Return the Sudachi format
  return {
    surface: k.surface_form,
    poses: poses,
    normalized_form: k.base_form || k.surface_form,
    reading_form: k.reading || "",
    dictionary_form: k.base_form || k.surface_form,
    word_id: k.word_id,
    oov: k.word_type === "UNKNOWN",
    // Character offsets
    charStart: k.word_position,
    charEnd: k.word_position + k.surface_form.length,
  };
}

export { GrammarRule, runGrammarEngineCheck };
