// ==========================================
// 1. Core Matching Engine
// ==========================================

let DEFAULT_WILDCARD_MAX = 2;

/**
 * Determines if a token is part of a grammatical conjugation tail
 * (auxiliary verbs, conjunctive particles, suffixes, non-independent verbs).
 */
function _isConjugationTail(token) {
  if (!token) return false;
  const poses = token.poses;
  const pos0 = poses[0];

  if (pos0 === "助動詞" || pos0 === "接尾辞") return true;

  const pos1 = poses[1];
  if (pos1 === "非自立可能" && (pos0 === "動詞" || pos0 === "形容詞"))
    return true;
  if (pos0 === "形状詞" && (pos1 === "助動詞語幹" || pos1 === "タリ"))
    return true;
  if (pos0 === "助詞" && pos1 === "接続助詞") return true;

  return false;
}

/**
Represents a single constraint on a specific token.
Pre-compiles conditions to avoid expensive array allocations during matching.
*/
class TokenConstraint {
  constructor(config, matchAllConjugations = true) {
    this.wildcard = config.wildcard;
    this.match = config.match;
    this.matchAllConjugations = matchAllConjugations;

    // Pre-parse the constraints for rapid lookup
    this.surface = this._parseConstraint(config.surface);
    this.surfaceEndsWith = this._parseConstraint(config.surfaceEndsWith);
    this.pos = this._parseConstraint(config.pos);
    this.posDetail = this._parseConstraint(config.posDetail);
    this.baseForm = this._parseConstraint(config.baseForm);

    // Conjugation needs special handling
    this.conjugationRaw = config.conjugation;
    this.conjugation = this._parseConstraint(config.conjugation);
    this.isConjugationAny = config.conjugation === "any";

    // Cache boolean locally for rapid tail-consumption check
    this.canConsumeTail =
      this.isConjugationAny ||
      (this.conjugationRaw === undefined && this.matchAllConjugations);
  }

  _parseConstraint(value) {
    if (!value) return null;
    if (value === "any") return "any";
    const parts = value.split("|");
    if (parts.length === 1) return parts[0]; // Fast path for singular requirement
    return parts; // Returns array for multiple valid options
  }

  _checkValue(constraint, tokenValue, isEndsWith = false) {
    if (!constraint) return true;
    if (!tokenValue) return false;

    if (Array.isArray(constraint)) {
      if (isEndsWith) {
        for (let i = 0; i < constraint.length; i++) {
          if (tokenValue.endsWith(constraint[i])) return true;
        }
        return false;
      }
      return constraint.includes(tokenValue);
    } else {
      if (isEndsWith) {
        return tokenValue.endsWith(constraint);
      }
      return constraint === tokenValue;
    }
  }

  check(token) {
    if (!token) return false;
    if (this.wildcard) return true;

    const posArray = token.poses;

    // Ordered by likely failure rate to short-circuit faster
    if (this.pos && !this._checkValue(this.pos, posArray[0])) return false;
    if (this.posDetail && !this._checkValue(this.posDetail, posArray[1]))
      return false;
    if (this.surface && !this._checkValue(this.surface, token.surface))
      return false;
    if (
      this.baseForm &&
      !this._checkValue(this.baseForm, token.dictionary_form)
    )
      return false;
    if (
      this.surfaceEndsWith &&
      !this._checkValue(this.surfaceEndsWith, token.surface, true)
    )
      return false;

    // Conjugation check (only evaluates if explicitly required)
    if (this.conjugationRaw && !this.isConjugationAny) {
      const pos4 = posArray[4] || "";
      const pos5 = posArray[5] || "";
      if (Array.isArray(this.conjugation)) {
        let matched = false;
        for (let i = 0; i < this.conjugation.length; i++) {
          const opt = this.conjugation[i];
          if (pos5.includes(opt) || pos4.includes(opt)) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      } else {
        if (
          !pos5.includes(this.conjugation) &&
          !pos4.includes(this.conjugation)
        ) {
          return false;
        }
      }
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
    let matchFlaggedStart = -1;
    let matchFlaggedEnd = -1;

    // Zero-allocation flag recording
    const recordMatch = (idx) => {
      if (matchFlaggedStart === -1) matchFlaggedStart = idx;
      matchFlaggedEnd = idx;
    };

    for (let i = 0; i < this.constraints.length; i++) {
      if (currentTokenIndex >= tokens.length) return null;

      const constraint = this.constraints[i];

      // WILDCARD LOGIC
      if (constraint.wildcard) {
        let maxWildcard =
          typeof constraint.wildcard === "number"
            ? constraint.wildcard
            : DEFAULT_WILDCARD_MAX;
        let consumed = 0;
        let matched = false;
        const nextConstraint = this.constraints[i + 1];

        while (currentTokenIndex < tokens.length && consumed < maxWildcard) {
          if (constraint.match) {
            recordMatch(currentTokenIndex);
          }
          currentTokenIndex++;
          consumed++;
          matched = true;

          // Non-greedy lookahead
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

      // STANDARD TOKEN LOGIC
      let constraintMatched = false;

      // Handle Punctuation bypass safely evaluating exactly 1 check per token.
      if (i > 0) {
        while (currentTokenIndex < tokens.length) {
          constraintMatched = constraint.check(tokens[currentTokenIndex]);
          if (constraintMatched) break;
          if (tokens[currentTokenIndex].poses[0] === "補助記号") {
            currentTokenIndex++;
          } else {
            break;
          }
        }
      } else {
        if (currentTokenIndex < tokens.length) {
          constraintMatched = constraint.check(tokens[currentTokenIndex]);
        }
      }

      if (!constraintMatched) return null;

      if (constraint.match) {
        recordMatch(currentTokenIndex);
      }

      // Determine Tail logic requirement
      let consumeTail = false;
      if (constraint.canConsumeTail) {
        if (constraint.isConjugationAny) {
          consumeTail = true;
        } else {
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
      }

      currentTokenIndex++;

      // TAIL CONSUMPTION
      if (consumeTail) {
        while (
          currentTokenIndex < tokens.length &&
          _isConjugationTail(tokens[currentTokenIndex])
        ) {
          // Non-greedy tail lookahead
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

          if (constraint.match) {
            recordMatch(currentTokenIndex);
          }
          currentTokenIndex++;
        }
      }
    }

    return {
      fullStartIndex: startIndex,
      fullEndIndex: currentTokenIndex, // Exclusive end index
      matchFlaggedStart,
      matchFlaggedEnd,
    };
  }
}

/**
The high-level Grammar Rule object.
*/
class GrammarRule {
  constructor(ruleJson) {
    this.id = ruleJson.id;
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
    const tokensLen = tokens.length;
    const patternsLen = this.patterns.length;

    for (let i = 0; i < tokensLen; i++) {
      for (let p = 0; p < patternsLen; p++) {
        const pattern = this.patterns[p];
        const matchResult = pattern.matchesAt(tokens, i);

        if (matchResult) {
          // Replaced .map() & .slice() with ultra-fast V8 string concats
          let fullText = "";
          for (
            let j = matchResult.fullStartIndex;
            j < matchResult.fullEndIndex;
            j++
          ) {
            fullText += tokens[j].surface;
          }

          let targetStartIndex = -1;
          let targetEndIndex = -1;

          if (matchResult.matchFlaggedStart !== -1) {
            targetStartIndex = matchResult.matchFlaggedStart;
            targetEndIndex = matchResult.matchFlaggedEnd + 1;
          } else {
            targetStartIndex = matchResult.fullStartIndex;
            targetEndIndex = matchResult.fullEndIndex;
          }

          let targetText = "";
          for (let j = targetStartIndex; j < targetEndIndex; j++) {
            targetText += tokens[j].surface;
          }

          matches.push({
            ruleId: this.id,
            index: targetStartIndex, // Index of the specific targeted tokens
            length: targetEndIndex - targetStartIndex,
            text: targetText, // The specific targeted text

            // Full context of the entire pattern matched
            fullIndex: matchResult.fullStartIndex,
            fullLength: matchResult.fullEndIndex - matchResult.fullStartIndex,
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
      const expectedTargetMatch = sentenceRaw.match(/\{(.*?)\}/);
      const expectedText = expectedTargetMatch ? expectedTargetMatch[1] : null;

      const sentence = sentenceRaw.replaceAll(/\{|\}/g, "");
      const rawJson = sudachi.tokenize_stringified(sentence, 0); // Mode A
      const tokens = JSON.parse(rawJson);

      const results = rule.scan(tokens);
      const tokenDump = tokens
        .map((t) => `${t.surface}(${t.poses[0]}:${t.poses[5] || ""})`)
        .join(" | ");

      if (results.length > 0) {
        const firstMatch = results[0];

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

  console.log("\n------ SUCCESS REPORT ------");
  if (successLogs.length > 0) {
    successLogs.forEach((log) => console.log(log));
  } else {
    console.log("No successes recorded.");
  }

  console.log("\n------ FAILURE REPORT ------");
  if (failureLogs.length > 0) {
    failureLogs.forEach((log) => console.log(log));
  } else {
    console.log("No failures recorded.");
  }

  console.log("\n------ SUMMARY ------");
  console.log(`Total Rules Checked: ${GRAMMAR_RULES.length}`);
  console.log(`Total Tests Passed:  ${totalMatches}`);
  console.log(`Total Tests Failed:  ${failureLogs.length}`);

  if (failureData.length > 0) console.log(failureData);

  return totalMatches;
}

export { GrammarRule, runGrammarEngineCheck, DEFAULT_WILDCARD_MAX };
