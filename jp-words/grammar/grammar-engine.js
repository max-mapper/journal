// ==========================================
// 1. Core Matching Engine
// ==========================================

let DEFAULT_WILDCARD_MAX = 8;

/**
 * Determines if a token is part of a grammatical conjugation tail
 * (auxiliary verbs, conjunctive particles, suffixes, non-independent verbs).
 */
function _isConjugationTail(token) {
  if (!token) return false;
  const pos0 = token.poses[0];
  const pos1 = token.poses[1];

  if (pos0 === "助動詞") return true;
  if (pos0 === "接尾辞") return true;
  if (pos0 === "動詞" && pos1 === "非自立可能") return true;
  if (pos0 === "形容詞" && pos1 === "非自立可能") return true;
  if (pos0 === "形状詞" && pos1 === "助動詞語幹") return true;
  if (pos0 === "形状詞" && pos1 === "タリ") return true;
  if (pos0 === "助詞" && pos1 === "接続助詞") return true; // Fixed: Exclude sentence-enders

  return false;
}

/**
Represents a single constraint on a specific token.
e.g., "Must be a Verb" or "Surface form must be 'いる'"
*/
class TokenConstraint {
  constructor(config, matchAllConjugations = true) {
    this.surface = config.surface; // Exact text match
    this.surfaceEndsWith = config.surfaceEndsWith; // Suffix text match
    this.pos = config.pos; // Main POS
    this.posDetail = config.posDetail; // Sub POS
    this.conjugation = config.conjugation; // Inflection type
    this.baseForm = config.baseForm; // Dictionary form
    this.wildcard = config.wildcard; // Matches anything
    this.match = config.match; // Flags this token as part of the extracted target

    // Store rule-level setting to apply dynamically during matching
    this.matchAllConjugations = matchAllConjugations;
  }

  /**
   * Helper function to check if a token value matches a constraint.
   * Evaluates the pipe `|` operator for "OR" logic.
   */
  _checkValue(constraintValue, tokenValue, isEndsWith = false) {
    if (!constraintValue) return true;
    const options = constraintValue.split("|");
    if (isEndsWith) {
      return options.some((opt) => tokenValue.endsWith(opt));
    }
    return options.includes(tokenValue);
  }

  check(token) {
    if (!token) return false;
    if (this.wildcard) return true;

    // Sudachi-wasm output structure keys
    const posArray = token.poses; //[POS, Sub1, Sub2, Sub3, ConjType, ConjForm]

    // 1. Surface Check
    if (this.surface && !this._checkValue(this.surface, token.surface))
      return false;
    if (
      this.surfaceEndsWith &&
      !this._checkValue(this.surfaceEndsWith, token.surface, true)
    )
      return false;

    // 2. Base Form Check
    if (
      this.baseForm &&
      !this._checkValue(this.baseForm, token.dictionary_form)
    )
      return false;

    // 3. POS Check (Index 0 - Main Category)
    if (this.pos && !this._checkValue(this.pos, posArray[0])) return false;

    // 4. POS Detail Check (Index 1 - Sub Category)
    if (this.posDetail && !this._checkValue(this.posDetail, posArray[1]))
      return false;

    // 5. Conjugation Form Check
    // If conjugation is "any" (or bypasses due to being undefined), skip filtering.
    if (this.conjugation && this.conjugation !== "any") {
      const options = this.conjugation.split("|");
      const matched = options.some(
        (opt) => posArray[5].includes(opt) || posArray[4].includes(opt),
      );
      if (!matched) return false;
    }

    return true;
  }
}

/**
Represents a sequence of constraints (a grammar pattern).
*/
class Pattern {
  constructor(constraints, matchAllConjugations = true) {
    this.constraints = constraints.map(
      (c) => new TokenConstraint(c, matchAllConjugations),
    );
  }

  matchesAt(tokens, startIndex) {
    let currentTokenIndex = startIndex;
    let matchFlaggedIndices = [];

    for (let i = 0; i < this.constraints.length; i++) {
      // If we ran out of tokens before satisfying constraints
      if (currentTokenIndex >= tokens.length) return null;

      let matched = false;
      const constraint = this.constraints[i];

      if (constraint.wildcard) {
        let maxWildcard =
          typeof constraint.wildcard === "number"
            ? constraint.wildcard
            : DEFAULT_WILDCARD_MAX;
        let consumed = 0;
        const nextConstraint = this.constraints[i + 1];

        while (currentTokenIndex < tokens.length && consumed < maxWildcard) {
          if (constraint.match) {
            matchFlaggedIndices.push(currentTokenIndex);
          }
          currentTokenIndex++;
          consumed++;
          matched = true;

          // Non-greedy lookahead: stop consuming if the next valid token matches the next rule
          if (nextConstraint) {
            let peekIndex = currentTokenIndex;
            while (
              peekIndex < tokens.length &&
              tokens[peekIndex].poses[0] === "補助記号"
            ) {
              peekIndex++;
            }
            if (
              peekIndex < tokens.length &&
              nextConstraint.check(tokens[peekIndex])
            ) {
              break;
            }
          }
        }

        if (!matched) return null;
        continue;
      }

      // Try to match the current constraint, skipping punctuation if necessary
      // NOTE: We do not skip punctuation for the very first constraint to ensure
      // the match index returned by 'scan' is accurate to the start of the phrase.
      if (i === 0) {
        if (this.constraints[i].check(tokens[currentTokenIndex])) {
          if (this.constraints[i].match)
            matchFlaggedIndices.push(currentTokenIndex);
          matched = true;

          // Determine if we should greedily consume conjugation tails
          let consumeTail = false;
          if (this.constraints[i].conjugation === "any") {
            consumeTail = true;
          } else if (
            this.constraints[i].conjugation === undefined &&
            this.constraints[i].matchAllConjugations
          ) {
            // Apply by default ONLY to "relevant cases" (parts of speech that actually conjugate)
            const pos0 = tokens[currentTokenIndex].poses[0];
            if (
              pos0 === "動詞" ||
              pos0 === "形容詞" ||
              pos0 === "助動詞" ||
              pos0 === "形状詞" ||
              pos0 === "接尾辞"
            ) {
              consumeTail = true;
            }
          }

          if (consumeTail) {
            currentTokenIndex++;
            while (
              currentTokenIndex < tokens.length &&
              _isConjugationTail(tokens[currentTokenIndex])
            ) {
              // Non-greedy tail lookahead: stop eating the tail if the next token belongs to the next rule
              const nextConstraint = this.constraints[i + 1];
              if (nextConstraint && !nextConstraint.wildcard) {
                let peekIndex = currentTokenIndex;
                while (
                  peekIndex < tokens.length &&
                  tokens[peekIndex].poses[0] === "補助記号"
                ) {
                  peekIndex++;
                }
                if (
                  peekIndex < tokens.length &&
                  nextConstraint.check(tokens[peekIndex])
                ) {
                  break;
                }
              }

              if (this.constraints[i].match) {
                // Flag tail elements to be part of the match as well
                matchFlaggedIndices.push(currentTokenIndex);
              }
              currentTokenIndex++;
            }
          } else {
            currentTokenIndex++;
          }
        }
      } else {
        // For subsequent constraints, allow skipping "Auxiliary Symbols" (Punctuation)
        while (currentTokenIndex < tokens.length) {
          if (this.constraints[i].check(tokens[currentTokenIndex])) {
            if (this.constraints[i].match)
              matchFlaggedIndices.push(currentTokenIndex);
            matched = true;

            let consumeTail = false;
            if (this.constraints[i].conjugation === "any") {
              consumeTail = true;
            } else if (
              this.constraints[i].conjugation === undefined &&
              this.constraints[i].matchAllConjugations
            ) {
              const pos0 = tokens[currentTokenIndex].poses[0];
              if (
                pos0 === "動詞" ||
                pos0 === "形容詞" ||
                pos0 === "助動詞" ||
                pos0 === "形状詞" ||
                pos0 === "接尾辞"
              ) {
                consumeTail = true;
              }
            }

            if (consumeTail) {
              currentTokenIndex++;
              while (
                currentTokenIndex < tokens.length &&
                _isConjugationTail(tokens[currentTokenIndex])
              ) {
                const nextConstraint = this.constraints[i + 1];
                if (nextConstraint && !nextConstraint.wildcard) {
                  let peekIndex = currentTokenIndex;
                  while (
                    peekIndex < tokens.length &&
                    tokens[peekIndex].poses[0] === "補助記号"
                  ) {
                    peekIndex++;
                  }
                  if (
                    peekIndex < tokens.length &&
                    nextConstraint.check(tokens[peekIndex])
                  ) {
                    break;
                  }
                }

                if (this.constraints[i].match) {
                  matchFlaggedIndices.push(currentTokenIndex);
                }
                currentTokenIndex++;
              }
            } else {
              currentTokenIndex++;
            }
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

      if (!matched) return null;
    }

    return {
      fullStartIndex: startIndex,
      fullEndIndex: currentTokenIndex, // Exclusive end index
      matchFlaggedIndices: matchFlaggedIndices,
    };
  }
}

/**
The high-level Grammar Rule object.
*/
class GrammarRule {
  constructor(ruleJson) {
    this.id = ruleJson.id;
    // Enabled by default, can be disabled per-rule
    this.matchAllConjugations = ruleJson.matchAllConjugations !== false;
    this.patterns = ruleJson.patterns.map(
      (p) => new Pattern(p, this.matchAllConjugations),
    );
    this.tests = ruleJson.tests;
    this.title = ruleJson.title;
    this.description = ruleJson.description;
    this.link = ruleJson.link;
  }

  scan(tokens) {
    const matches = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let pattern of this.patterns) {
        const matchResult = pattern.matchesAt(tokens, i);

        if (matchResult) {
          const fullTokens = tokens.slice(
            matchResult.fullStartIndex,
            matchResult.fullEndIndex,
          );
          const fullText = fullTokens.map((t) => t.surface).join("");

          let targetTokens = [];
          let targetStartIndex = -1;

          if (matchResult.matchFlaggedIndices.length > 0) {
            // Extract tokens between the first and last `match: true` flags (inclusive)
            targetStartIndex = matchResult.matchFlaggedIndices[0];
            const targetEndIndex =
              matchResult.matchFlaggedIndices[
                matchResult.matchFlaggedIndices.length - 1
              ] + 1;
            targetTokens = tokens.slice(targetStartIndex, targetEndIndex);
          } else {
            // Fallback: If no match: true specified, treat the whole matched pattern as the target
            targetStartIndex = matchResult.fullStartIndex;
            targetTokens = fullTokens;
          }

          matches.push({
            ruleId: this.id,
            index: targetStartIndex, // Index of the specific targeted tokens
            length: targetTokens.length,
            text: targetTokens.map((t) => t.surface).join(""), // The specific targeted text

            // Full context of the entire pattern matched
            fullIndex: matchResult.fullStartIndex,
            fullLength: fullTokens.length,
            fullText: fullText,

            title: this.title,
            description: this.description,
            link: this.link,
          });
          break; // Avoid overlapping matches for the same rule at the same index
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
  const failureData = [];
  let totalMatches = 0;

  for (const ruleJson of GRAMMAR_RULES) {
    const rule = new GrammarRule(ruleJson);

    for (const sentenceRaw of rule.tests) {
      // Extract the expected target string inside curly braces {}
      const expectedTargetMatch = sentenceRaw.match(/\{(.*?)\}/);
      const expectedText = expectedTargetMatch ? expectedTargetMatch[1] : null;

      // Clean the sentence for Sudachi parsing
      const sentence = sentenceRaw.replaceAll(/\{|\}/g, "");
      const rawJson = sudachi.tokenize_stringified(sentence, 0); // Mode A
      const tokens = JSON.parse(rawJson);

      const results = rule.scan(tokens);
      const tokenDump = tokens
        .map((t) => `${t.surface}(${t.poses[0]}:${t.poses[5]})`)
        .join(" | ");
      if (results.length > 0) {
        const firstMatch = results[0];

        // Check if the extracted text accurately matches what was inside the {} brackets
        if (expectedText && firstMatch.text !== expectedText) {
          failureLogs.push(
            `❌ [${rule.title}] FAIL: "${sentence}" -> Matched text was "${firstMatch.text}" but expected "${expectedText}".\n   Tokens: ${tokenDump}\n   Patterns: ${JSON.stringify(ruleJson.patterns)}`,
          );

          failureData.push({
            failure: `"${sentence}" -> Matched text was "${firstMatch.text}" but expected "${expectedText}"`,
            sentence,
            tokenDump,
            ruleJson,
          });
        } else {
          totalMatches++;
          successLogs.push(
            `✅ [${rule.title}] MATCH: "${sentence}" -> Extracted: "${firstMatch.text}"`,
          );
        }
      } else {
        failureLogs.push(
          `❌[${rule.title}] FAIL: "${sentence}" -> No match found.\n   Tokens: ${tokenDump}\n   Patterns: ${JSON.stringify(ruleJson.patterns)}`,
        );

        failureData.push({
          failure: "No match found",
          sentence,
          tokenDump,
          ruleJson,
        });
      }
    }
  }

  // 1. Print all Successes
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

  console.log(failureData);

  return totalMatches;
}

export { GrammarRule, runGrammarEngineCheck, DEFAULT_WILDCARD_MAX };
