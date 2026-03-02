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

  getStrictTags(poses) {
    if (!poses || poses.length === 0) return null;
    const pos0 = poses[0];
    const pos1 = poses.length > 1 ? poses[1] : "*";
    const pos2 = poses.length > 2 ? poses[2] : "*";

    const strictCodes = new Set();

    // 動詞 / 形容詞 - 非自立可能 (Auxiliaries: ていく, てみる, ている, ない)
    if (pos1 === "非自立可能") {
      if (pos0 === "動詞") strictCodes.add("aux-v").add("aux");
      if (pos0 === "形容詞") strictCodes.add("aux-adj").add("aux");
    }

    // 接尾辞 (Suffixes: 〜すぎる, 〜たち, etc.)
    if (pos0 === "接尾辞") {
      strictCodes.add("suf");
      if (pos1 === "動詞的") strictCodes.add("v-suf");
      if (pos1 === "名詞的") strictCodes.add("n-suf");
      if (pos1 === "形容詞的") strictCodes.add("aux-adj");
      if (pos2 === "助数詞") strictCodes.add("ctr");
    }

    // 名詞 - 特定のカテゴリ (Nouns)
    if (pos0 === "名詞") {
      if (pos1 === "数詞") strictCodes.add("num");
      if (pos1 === "普通名詞" && pos2 === "副詞可能") strictCodes.add("n-adv");
      if (pos1 === "固有名詞") strictCodes.add("n-pr");
      if (pos1 === "代名詞") strictCodes.add("pn");
    }

    // 副詞
    if (pos0 === "副詞") strictCodes.add("adv").add("adv-to").add("n-adv");

    // 形状詞 (Na-adjectives)
    if (pos0 === "形状詞")
      strictCodes.add("adj-na").add("adj-nari").add("adj-no").add("adj-pn");

    // 連体詞 (Pre-noun adjectivals)
    if (pos0 === "連体詞") strictCodes.add("adj-pn");

    // その他の品詞
    if (pos0 === "代名詞") strictCodes.add("pn");
    if (pos0 === "助詞") strictCodes.add("prt");
    if (pos0 === "助動詞") strictCodes.add("aux").add("aux-v").add("aux-adj");

    return strictCodes;
  }

  searchDictionary(term, poses) {
    if (!this.dictDB) return null;
    let indices = this.dictDB.index[term];
    if (!indices && term.length > 1) {
      indices = this.dictDB.index[term.slice(0, -1)];
    }
    if (!indices) return null;

    const entries = indices.map((idx) => this.dictDB.defs[idx]);

    let posArray = Array.isArray(poses) ? poses : [poses];
    let pos0 = posArray[0];

    if (pos0 && JMDICT_POS_MAP[pos0]) {
      const allowedCodes = new Set(JMDICT_POS_MAP[pos0]);
      const strictCodes = this.getStrictTags(posArray);
      let filteredEntries = [];
      let strictFilteredEntries = [];

      for (const entrySenses of entries) {
        let validSenses = [];
        let strictSenses = [];
        let currentPos = [];

        for (const sense of entrySenses) {
          // Carry forward POS tags, as JMDict definitions often leave them blank
          // on subsequent senses when they belong to the same grammatical grouping.
          if (sense.partOfSpeech && sense.partOfSpeech.length > 0) {
            currentPos = sense.partOfSpeech;
          }

          const isAllowed =
            currentPos.length === 0 ||
            currentPos.some((code) => allowedCodes.has(code));
          if (isAllowed) {
            validSenses.push(sense);
          }

          if (strictCodes && strictCodes.size > 0) {
            const isStrictAllowed =
              currentPos.length > 0 &&
              currentPos.some((code) => strictCodes.has(code));
            if (isStrictAllowed) {
              strictSenses.push(sense);
            }
          }
        }

        if (validSenses.length > 0) filteredEntries.push(validSenses);
        if (strictSenses.length > 0) strictFilteredEntries.push(strictSenses);
      }

      // Strongly prefer specific matched mappings (e.g. aux-v),
      // but gracefully fallback to all allowed valid mappings if none exist.
      if (
        strictCodes &&
        strictCodes.size > 0 &&
        strictFilteredEntries.length > 0
      ) {
        return strictFilteredEntries;
      }

      return filteredEntries.length > 0 ? filteredEntries : null;
    }
    return entries;
  }

  shouldGroup(token) {
    const p = token.poses || token.pos;
    if (!p || p.length === 0) return false;
    const pos0 = p[0];
    if (pos0 === "助動詞" || pos0 === "接尾辞") return true;
    if (pos0 === "助詞" && p.length > 1 && p[1] === "接続助詞") return true;
    return false;
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

    // 1. Process All Grammar Matches
    if (isGrammarEnabled) {
      let grammarRanges = [];
      for (const ruleJson of this.rules) {
        const rule = new GrammarRule(ruleJson);
        const matches = rule.scan(rawTokens);
        matches.forEach((m) => {
          grammarRanges.push({
            start: m.index,
            end: m.index + m.length,
            fullStart: m.fullIndex,
            fullEnd: m.fullIndex + m.fullLength,
            fullText: m.fullText,
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
        // Ensure fullEnd encompasses the newly extended targeted end
        if (match.fullEnd !== undefined && match.fullEnd < match.end) {
          match.fullEnd = match.end;
        }
      }

      // Build Grammar Blocks
      for (const gMatch of grammarRanges) {
        let innerWords = [];
        let seenInner = new Set();
        let blockTokens = [];

        for (let j = gMatch.start; j < gMatch.end; j++) {
          const t = rawTokens[j];
          const tPosArray = t.poses || t.pos;
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
            if (
              !this.searchDictionary(validForm, tPosArray) &&
              t.normalized_form
            ) {
              if (this.searchDictionary(t.normalized_form, tPosArray)) {
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
                posArray: tPosArray,
                tense: tenseMatches,
              });
            }
          }
        }

        allMatches.push({
          type: "grammar",
          startIndex: gMatch.start,
          endIndex: gMatch.end,
          fullStartIndex: gMatch.fullStart,
          fullEndIndex: gMatch.fullEnd,
          fullText: gMatch.fullText,
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
      if (!["助動詞", "助詞"].includes(startPos)) {
        for (let len = this.COMPOUND_LOOKAHEAD_LIMIT; len >= 2; len--) {
          if (i + len > rawTokens.length) continue;

          const slice = rawTokens.slice(i, i + len);
          const combinedSurface = slice.map((t) => t.surface).join("");
          const combinedDictForm =
            slice
              .slice(0, -1)
              .map((t) => t.surface)
              .join("") + slice[slice.length - 1].dictionary_form;
          const combinedNormForm =
            slice
              .slice(0, -1)
              .map((t) => t.surface)
              .join("") + slice[slice.length - 1].normalized_form;

          let matchedDictForm = null;
          let matchedNormForm = null;

          if (this.dictDB.index[combinedDictForm]) {
            matchedDictForm = combinedDictForm;
            matchedNormForm = combinedNormForm;
          } else if (this.dictDB.index[combinedNormForm]) {
            matchedDictForm = combinedNormForm;
            matchedNormForm = combinedNormForm;
          } else if (this.dictDB.index[combinedSurface]) {
            matchedDictForm = combinedSurface;
            matchedNormForm = combinedSurface;
          }

          if (matchedDictForm) {
            let baseTokens = slice;
            let basePos = this.getPos(baseTokens[baseTokens.length - 1]);
            let nextIndex = i + len;
            let groupTokens = [...baseTokens];
            let groupedSurface = combinedSurface;

            if (["動詞", "形容詞", "形状詞"].includes(basePos)) {
              while (nextIndex < rawTokens.length) {
                const nextToken = rawTokens[nextIndex];
                if (this.shouldGroup(nextToken)) {
                  groupTokens.push(nextToken);
                  groupedSurface += nextToken.surface;
                  nextIndex++;
                } else {
                  break;
                }
              }
            }

            const groupObj = {
              isGroup: true,
              tokens: groupTokens,
              baseToken: {
                ...baseTokens[0],
                dictionary_form: matchedDictForm,
                normalized_form: matchedNormForm,
                poses:
                  baseTokens[baseTokens.length - 1].poses ||
                  baseTokens[baseTokens.length - 1].pos,
              },
              surface: groupedSurface,
            };

            const processed = this._processTokenOrGroup(groupObj, activePOS);
            processed.startIndex = i;
            processed.endIndex = nextIndex;
            allMatches.push(processed);
          }
        }
      }

      // Check for Single token at this index + grouping
      const current = rawTokens[i];
      let basePos = this.getPos(current);
      let groupTokens = [current];
      let groupedSurface = current.surface;
      let nextIndex = i + 1;

      if (["動詞", "形容詞", "形状詞"].includes(basePos)) {
        while (nextIndex < rawTokens.length) {
          const nextToken = rawTokens[nextIndex];
          if (this.shouldGroup(nextToken)) {
            groupTokens.push(nextToken);
            groupedSurface += nextToken.surface;
            nextIndex++;
          } else {
            break;
          }
        }
      }

      const groupObj = {
        isGroup: true,
        tokens: groupTokens,
        baseToken: current,
        surface: groupedSurface,
      };

      const processed = this._processTokenOrGroup(groupObj, activePOS);
      processed.startIndex = i;
      processed.endIndex = nextIndex;
      allMatches.push(processed);
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
    let posArray = [];
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
      posArray = head.poses || head.pos || [pos];
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
      posArray = item.poses || item.pos || [pos];
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
      let compatibleEntries = this.searchDictionary(dictForm, posArray);
      if (!compatibleEntries && normForm && normForm !== dictForm) {
        const normEntries = this.searchDictionary(normForm, posArray);
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
      posArray,
      dictForm: finalForm,
      tense: tenseData,
    };
  }
}
