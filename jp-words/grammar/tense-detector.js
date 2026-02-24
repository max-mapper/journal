// const detector = new VerbTenseDetector();

// // Example 1: Standard Godan
// const result1 = detector.detect('使う', '使えます');
// console.log(result1);
// // Output: [{ name: 'Potential (Can)', description: 'Expresses ability (can do)...' }]

// // Example 2: Ambiguous form (Ichidan Passive vs Potential)
// const result2 = detector.detect('食べる', '食べられる');
// console.log(result2);
// // Output: [
// //   { name: 'Passive (Rareru)', description: 'Subject receives the action...' },
// //   { name: 'Potential (Can)', description: 'Expresses ability...' }
// // ]

// // Example 3: Shortened form (Slang)
// const result3 = detector.detect('書く', '書いちゃう');
// console.log(result3);
// // Output: [{ name: 'Shortened Regret (Chau/Jau)', description: 'Casual form of ~te shimau...' }]

class VerbTenseDetector {
  constructor() {
    this.tenses = this._defineTenses();
  }

  /**
   * Main entry point.
   * @param {string} dictForm - The dictionary form (e.g., 使う)
   * @param {string} conjForm - The conjugated form to identify (e.g., 使えます)
   * @returns {Array} Array of matching tense objects
   */
  detect(dictForm, conjForm) {
    if (!dictForm || !conjForm) return [];

    const verbType = this._getVerbType(dictForm);
    const results = [];

    // Generate all forms for this specific dictionary verb
    const allForms = this._generateAllForms(dictForm, verbType);

    // Check which generated forms match the input
    for (const [tenseId, generatedString] of Object.entries(allForms)) {
      if (generatedString === conjForm) {
        results.push(this.tenses[tenseId]);
      }
    }

    return results;
  }

  // ==========================================
  // Core Conjugation Logic
  // ==========================================

  _generateAllForms(dict, type) {
    // 1. Get Bases
    const bases = this._getBases(dict, type);

    // 2. Construct Forms based on the requested list
    const forms = {};

    // --- Standard Forms ---
    forms.dictionary = dict;
    forms.polite = bases.i + "ます";
    forms.polite_past = bases.i + "ました";
    forms.polite_negative = bases.i + "ません";
    forms.volitional_polite = bases.i + "ましょう";
    forms.negative = bases.a + "ない";
    forms.negative_past = bases.a + "なかった";
    forms.te = bases.te;
    forms.past = bases.ta;

    // --- Stems / Bases ---
    forms.stem = bases.i; // Ren'youkei (Connective)
    forms.negative_base = bases.a; // Mizenkei (Negative Base)
    forms.negative_conditional_base = bases.a + "なけれ"; // Truncated conditional

    // --- Conditionals & Representative ---
    forms.conditional_tara = bases.ta + "ら";
    forms.representative = bases.ta + "り";
    forms.conditional_ba = bases.e + "ば";

    // --- Desire & Volitional ---
    forms.desiderative = bases.i + "たい";
    forms.volitional = bases.o + "う";

    // --- Potential ---
    if (type === "ichidan") {
      forms.potential = bases.root + "られる";
      forms.ranuki = bases.root + "れる";
    } else if (type === "suru") {
      forms.potential = "できる";
      forms.ranuki = "N/A";
    } else if (type === "kuru") {
      // Handle Kanji vs Hiragana
      if (bases.root === "来") {
        forms.potential = "来られる";
        forms.ranuki = "来れる";
      } else {
        forms.potential = "こられる";
        forms.ranuki = "これる";
      }
    } else {
      // Godan
      forms.potential = bases.e + "る";
      forms.ranuki = "N/A";
    }

    // --- Imperative ---
    forms.imperative = bases.imperative;
    forms.negative_imperative = dict + "な";

    // --- Passive / Causative ---
    if (type === "ichidan") {
      forms.passive = bases.root + "られる";
      forms.causative = bases.root + "させる";
      forms.causative_passive = bases.root + "させられる";
      forms.short_caus_pass = "N/A";
    } else if (type === "suru") {
      forms.passive = "される";
      forms.causative = "させる";
      forms.causative_passive = "させられる";
      forms.short_caus_pass = "N/A";
    } else if (type === "kuru") {
      if (bases.root === "来") {
        forms.passive = "来られる";
        forms.causative = "来させる";
        forms.causative_passive = "来させられる";
      } else {
        forms.passive = "こられる";
        forms.causative = "こさせる";
        forms.causative_passive = "こさせられる";
      }
      forms.short_caus_pass = "N/A";
    } else {
      // Godan
      forms.passive = bases.a + "れる";
      forms.causative = bases.a + "せる";
      forms.causative_passive = bases.a + "せられる";
      forms.short_caus_pass = bases.a + "される";
    }

    // --- Progressive (Continuous) ---
    forms.progressive = bases.te + "いる";
    forms.progressive_polite = bases.te + "います";
    forms.progressive_past = bases.te + "いた";
    forms.progressive_polite_past = bases.te + "いました";
    forms.progressive_negative = bases.te + "いない";
    forms.progressive_polite_negative = bases.te + "いません";

    // --- Shortened / Casual Forms ---

    // Progressive (Te-form + iru -> teru)
    forms.short_progressive = bases.te + "る";

    // Regret (Te-form + shimau -> chau/jau)
    if (bases.te.endsWith("で")) {
      forms.short_regret = bases.te.slice(0, -1) + "じゃう";
      forms.short_prep = bases.te.slice(0, -1) + "どく";
    } else {
      forms.short_regret = bases.te.slice(0, -1) + "ちゃう";
      forms.short_prep = bases.te.slice(0, -1) + "とく";
    }

    // Must (Negative + nakya)
    forms.short_must = bases.a + "なきゃ";

    return forms;
  }

  _getBases(dict, type) {
    let root = "";

    if (type === "ichidan") {
      root = dict.slice(0, -1); // Remove 'ru'
      return {
        root: root,
        a: root,
        i: root,
        u: dict,
        e: root + "れ",
        o: root + "よ",
        te: root + "て",
        ta: root + "た",
        imperative: root + "ろ",
      };
    }

    if (type === "suru") {
      return {
        root: "し",
        a: "し",
        i: "し",
        u: "する",
        e: "すれ",
        o: "しよ",
        te: "して",
        ta: "した",
        imperative: "しろ",
      };
    }

    if (type === "kuru") {
      // Check for Kanji form vs Hiragana form
      if (dict === "来る") {
        return {
          root: "来",
          a: "来", // Konai - visually matches
          i: "来", // Kimasu - visually matches
          u: "来る",
          e: "来れ", // Kureba - visually matches
          o: "来よ", // Koyou - visually matches
          te: "来て",
          ta: "来た",
          imperative: "来い",
        };
      }
      // Hiragana default
      return {
        root: "き",
        a: "こ",
        i: "き",
        u: "くる",
        e: "くれ",
        o: "こよ",
        te: "きて",
        ta: "きた",
        imperative: "こい",
      };
    }

    // --- GODAN HANDLING ---
    root = dict.slice(0, -1);
    const lastChar = dict.slice(-1);

    let bases = { root: root, u: dict };

    switch (lastChar) {
      case "う":
        bases.a = root + "わ";
        bases.i = root + "い";
        bases.e = root + "え";
        bases.o = root + "お";
        bases.te = root + "って";
        bases.ta = root + "った";
        bases.imperative = root + "え";
        break;
      case "く":
        bases.a = root + "か";
        bases.i = root + "き";
        bases.e = root + "け";
        bases.o = root + "こ";
        if (dict === "行く") {
          bases.te = "行って";
          bases.ta = "行った";
        } else {
          bases.te = root + "いて";
          bases.ta = root + "いた";
        }
        bases.imperative = root + "け";
        break;
      case "ぐ":
        bases.a = root + "が";
        bases.i = root + "ぎ";
        bases.e = root + "げ";
        bases.o = root + "ご";
        bases.te = root + "いで";
        bases.ta = root + "いだ";
        bases.imperative = root + "げ";
        break;
      case "す":
        bases.a = root + "さ";
        bases.i = root + "し";
        bases.e = root + "せ";
        bases.o = root + "そ";
        bases.te = root + "して";
        bases.ta = root + "した";
        bases.imperative = root + "せ";
        break;
      case "つ":
        bases.a = root + "た";
        bases.i = root + "ち";
        bases.e = root + "て";
        bases.o = root + "と";
        bases.te = root + "って";
        bases.ta = root + "った";
        bases.imperative = root + "て";
        break;
      case "ぬ":
        bases.a = root + "な";
        bases.i = root + "に";
        bases.e = root + "ね";
        bases.o = root + "の";
        bases.te = root + "んで";
        bases.ta = root + "んだ";
        bases.imperative = root + "ね";
        break;
      case "む":
        bases.a = root + "ま";
        bases.i = root + "み";
        bases.e = root + "め";
        bases.o = root + "も";
        bases.te = root + "んで";
        bases.ta = root + "んだ";
        bases.imperative = root + "め";
        break;
      case "ぶ":
        bases.a = root + "ば";
        bases.i = root + "び";
        bases.e = root + "べ";
        bases.o = root + "ぼ";
        bases.te = root + "んで";
        bases.ta = root + "んだ";
        bases.imperative = root + "べ";
        break;
      case "る":
        bases.a = root + "ら";
        bases.i = root + "り";
        bases.e = root + "れ";
        bases.o = root + "ろ";
        bases.te = root + "って";
        bases.ta = root + "った";
        bases.imperative = root + "れ";
        break;
    }
    return bases;
  }

  _getVerbType(dict) {
    if (dict === "する") return "suru";
    if (dict === "来る" || dict === "くる") return "kuru";

    if (!dict.endsWith("る")) return "godan";

    // Handle common Ichidan verbs with Kanji stems where phonetic check fails
    const ichidanExceptions = [
      "見る",
      "寝る",
      "出る",
      "着る",
      "似る",
      "煮る",
      "居る",
      "射る",
      "得る",
      "経る",
    ];
    if (ichidanExceptions.includes(dict)) return "ichidan";

    const stem = dict.slice(0, -1);
    const lastCharOfStem = stem.slice(-1);

    const iSound = [
      "い",
      "き",
      "し",
      "ち",
      "に",
      "ひ",
      "み",
      "り",
      "ぎ",
      "じ",
      "ぢ",
      "び",
      "ぴ",
    ];
    const eSound = [
      "え",
      "け",
      "せ",
      "て",
      "ね",
      "へ",
      "め",
      "れ",
      "げ",
      "ぜ",
      "で",
      "べ",
      "ぺ",
    ];

    if (iSound.includes(lastCharOfStem) || eSound.includes(lastCharOfStem)) {
      const godanExceptions = [
        "走る",
        "帰る",
        "入る",
        "切る",
        "知る",
        "要る",
        "蹴る",
        "滑る",
        "しゃべる",
      ];
      if (godanExceptions.some((ex) => dict.endsWith(ex))) return "godan";

      return "ichidan";
    }

    return "godan";
  }

  _defineTenses() {
    return {
      dictionary: {
        name: "Dictionary Form",
        description: "The basic, non-conjugated form found in dictionaries.",
      },
      polite: {
        name: "Polite (Masu)",
        description: "Standard polite form used in general conversation.",
      },
      polite_past: {
        name: "Polite Past (Mashita)",
        description: "Polite past tense form.",
      },
      polite_negative: {
        name: "Polite Negative (Masen)",
        description: "Polite negative form.",
      },
      volitional_polite: {
        name: "Polite Volitional (Mashou)",
        description: 'Polite suggestion or invitation ("Let\'s...").',
      },
      negative: {
        name: "Negative (Nai)",
        description: "Casual form to say something does not happen.",
      },
      negative_past: {
        name: "Negative Past (Nakatta)",
        description: "Casual past negative form.",
      },
      te: {
        name: "Te-Form",
        description: "Connective form for requests, linking verbs, etc.",
      },
      past: {
        name: "Past (Ta)",
        description: "Casual past tense.",
      },
      stem: {
        name: "Masu-Stem",
        description: "Compound verbs or formal conjunctions.",
      },
      negative_base: {
        name: "Negative Base (Mizenkei)",
        description: "Base form before 'nai'",
      },
      negative_conditional_base: {
        name: "Negative Conditional Base",
        description:
          "Truncated form of the negative conditional (shinakere...).",
      },
      conditional_tara: {
        name: "Conditional (Tara)",
        description: 'Conditional "if/when".',
      },
      representative: {
        name: "Representative (Tari)",
        description: "Lists actions as examples.",
      },
      desiderative: {
        name: "Desiderative (Tai)",
        description: 'Expresses desire ("I want to...").',
      },
      potential: {
        name: "Potential (Can)",
        description: 'Expresses ability ("Can do...") or possibility.',
      },
      volitional: {
        name: "Volitional (Let's)",
        description: 'Casual suggestion ("Let\'s...") or intention.',
      },
      conditional_ba: {
        name: "Conditional (Ba)",
        description: 'Hypothetical condition ("If...").',
      },
      imperative: {
        name: "Imperative (Command)",
        description: "Strong, often rude, command.",
      },
      negative_imperative: {
        name: "Neg. Imperative (Don't)",
        description: "Strong command not to do something.",
      },
      passive: {
        name: "Passive (Rareru)",
        description: 'Subject receives the action ("Was done by...").',
      },
      causative: {
        name: "Causative (Saseru)",
        description: "Making or letting someone do something.",
      },
      causative_passive: {
        name: "Causative-Passive (Saserareru)",
        description: "Being made to do something (often implies reluctance).",
      },
      short_caus_pass: {
        name: "Shortened Caus-Pass (Forced)",
        description: "Collapsed version of Causative-Passive (Godan only).",
      },
      progressive: {
        name: "Progressive (Te-iru)",
        description: "Continuous action or state (~te iru).",
      },
      progressive_polite: {
        name: "Polite Progressive (Te-imasu)",
        description: "Polite continuous action or state (~te imasu).",
      },
      progressive_past: {
        name: "Progressive Past (Te-ita)",
        description: "Past continuous action (~te ita).",
      },
      progressive_polite_past: {
        name: "Polite Progressive Past (Te-imashita)",
        description: "Polite past continuous action (~te imashita).",
      },
      progressive_negative: {
        name: "Progressive Negative (Te-inai)",
        description: "Negative continuous action (~te inai).",
      },
      progressive_polite_negative: {
        name: "Polite Progressive Negative (Te-imasen)",
        description: "Polite negative continuous action (~te imasen).",
      },
      short_progressive: {
        name: "Shortened Progressive (Teru)",
        description: "Casual continuous action (~te iru -> ~teru).",
      },
      short_regret: {
        name: "Shortened Regret (Chau/Jau)",
        description: "Casual expression of regret or completion.",
      },
      short_prep: {
        name: "Shortened Prep (Toku/Doku)",
        description: "Casual preparatory action (~te oku -> ~toku).",
      },
      short_must: {
        name: "Shortened Must (Nakya)",
        description: "Casual obligation (~nakereba -> ~nakya).",
      },
      ranuki: {
        name: "Ra-nuki Potential (Can)",
        description:
          'Slang Potential form for Ichidan verbs (dropping the "ra").',
      },
    };
  }
}

export { VerbTenseDetector };
