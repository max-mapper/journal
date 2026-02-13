// ==========================================
// 1. Core Matching Engine
// ==========================================

/**
 * Represents a single constraint on a specific token.
 * e.g., "Must be a Verb" or "Surface form must be 'いる'"
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
    this.surfaceEndsWith = surfaceEndsWith; // Suffix text match (New)
    this.pos = pos; // Main POS
    this.posDetail = posDetail; // Sub POS
    this.conjugation = conjugation; // Inflection type
    this.baseForm = baseForm; // Dictionary form
  }

  check(token) {
    if (!token) return false;

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

    // 5. Conjugation Form Check (Index 5 usually contains form info like "未然形-一般")
    if (this.conjugation) {
      // Checking both Index 5 (Form) and Index 4 (Type) just in case
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
 * Represents a sequence of constraints (a grammar pattern).
 */
class Pattern {
  constructor(constraints) {
    this.constraints = constraints.map((c) => new TokenConstraint(c));
  }

  matchesAt(tokens, startIndex) {
    if (startIndex + this.constraints.length > tokens.length) return false;

    for (let i = 0; i < this.constraints.length; i++) {
      if (!this.constraints[i].check(tokens[startIndex + i])) {
        return false;
      }
    }
    return true;
  }
}

/**
 * The high-level Grammar Rule object.
 */
class GrammarRule {
  constructor(ruleJson) {
    this.id = ruleJson.id;
    this.title = ruleJson.title;
    this.patterns = ruleJson.patterns.map((p) => new Pattern(p));
    this.tests = ruleJson.tests;
  }

  scan(tokens) {
    const matches = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let pattern of this.patterns) {
        if (pattern.matchesAt(tokens, i)) {
          const matchedTokens = tokens.slice(i, i + pattern.constraints.length);
          const text = matchedTokens.map((t) => t.surface).join("");
          matches.push({
            ruleId: this.id,
            title: this.title,
            index: i,
            length: pattern.constraints.length,
            text: text,
          });
          break; // Avoid overlapping matches for the same rule
        }
      }
    }
    return matches;
  }
}

// ==========================================
// 2. Rule Definitions (Revised)
// ==========================================

// ==========================================
// 3. Execution & Self-Test Module
// ==========================================
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
        const matchTexts = results.map((r) => `"${r.text}"`).join(", ");
        successLogs.push(
          `✅ [${rule.title}] MATCH: Sentence: "${sentence}" -> Found: ${matchTexts}`,
        );
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

  // 1. Print all Successes
  console.log("------ SUCCESS REPORT ------");
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

export { GrammarRule, runGrammarEngineCheck };
