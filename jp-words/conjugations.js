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

// --- MAPPINGS ---

const POS_LABEL_MAP = {
  動詞: "Verb",
  助動詞: "Auxiliary Verb",
  助詞: "Particle",
  名詞: "Noun",
  形容詞: "Adjective",
  副詞: "Adverb",
  形状詞: "Adjectival Noun",
  代名詞: "Pronoun",
  接尾辞: "Suffix",
};

const JMDICT_TAG_MAP = {
  "adj-i": "adjective (keiyoushi)",
  "adj-na": "adjectival nouns or quasi-adjectives (keiyodoshi)",
  "adj-no": "nouns which may take the genitive case particle 'no'",
  "adj-pn": "pre-noun adjectival (rentaishi)",
  "adj-t": "'taru' adjective",
  "adj-f": "noun or verb acting prenominally",
  adj: "former adjective classification",
  adv: "adverb (fukushi)",
  "adv-n": "adverbial noun",
  "adv-to": "adverb taking the 'to' particle",
  aux: "auxiliary",
  "aux-v": "auxiliary verb",
  "aux-adj": "auxiliary adjective",
  conj: "conjunction",
  ctr: "counter",
  exp: "Expressions",
  int: "interjection (kandoushi)",
  iv: "irregular verb",
  n: "noun (common) (futsuumeishi)",
  "n-adv": "adverbial noun (fukushitekimeishi)",
  "n-pref": "noun, used as a prefix",
  "n-suf": "noun, used as a suffix",
  "n-t": "noun (temporal) (jisoumeishi)",
  num: "numeric",
  pn: "pronoun",
  pref: "prefix",
  prt: "particle",
  suf: "suffix",
  v1: "Ichidan verb",
  "v2a-s": "Nidan verb with 'u' ending (archaic)",
  v4h: "Yodan verb with 'hu/fu' ending (archaic)",
  v4r: "Yodan verb with 'ru' ending (archaic)",
  v5: "Godan verb",
  v5aru: "Godan verb - -aru special class",
  v5b: "Godan verb with 'bu' ending",
  v5g: "Godan verb with 'gu' ending",
  v5k: "Godan verb with 'ku' ending",
  "v5k-s": "Godan verb - iku/yuku special class",
  v5m: "Godan verb with 'mu' ending",
  v5n: "Godan verb with 'nu' ending",
  v5r: "Godan verb with 'ru' ending",
  "v5r-i": "Godan verb with 'ru' ending (irregular verb)",
  v5s: "Godan verb with 'su' ending",
  v5t: "Godan verb with 'tsu' ending",
  v5u: "Godan verb with 'u' ending",
  "v5u-s": "Godan verb with 'u' ending (special class)",
  v5uru: "Godan verb - uru old class verb",
  v5z: "Godan verb with 'zu' ending",
  vz: "Ichidan verb - zuru verb",
  vi: "intransitive verb",
  vk: "kuru verb - special class",
  vn: "irregular nu verb",
  vs: "noun or participle which takes the aux. verb suru",
  "vs-c": "su verb - precursor to the modern suru",
  "vs-i": "suru verb - irregular",
  "vs-s": "suru verb - special class",
  vt: "transitive verb",
};

const JMDICT_POS_MAP = {
  動詞: [
    "v1",
    "v1-s",
    "v2a-s",
    "v2b-k",
    "v2b-s",
    "v2d-k",
    "v2d-s",
    "v2g-k",
    "v2g-s",
    "v2h-k",
    "v2h-s",
    "v2k-k",
    "v2k-s",
    "v2m-k",
    "v2m-s",
    "v2n-s",
    "v2r-k",
    "v2r-s",
    "v2s-s",
    "v2t-k",
    "v2t-s",
    "v2w-s",
    "v2y-k",
    "v2y-s",
    "v2z-s",
    "v4b",
    "v4g",
    "v4h",
    "v4k",
    "v4m",
    "v4n",
    "v4r",
    "v4s",
    "v4t",
    "v5aru",
    "v5b",
    "v5g",
    "v5k",
    "v5k-s",
    "v5m",
    "v5n",
    "v5r",
    "v5r-i",
    "v5s",
    "v5t",
    "v5u",
    "v5u-s",
    "v5uru",
    "vi",
    "vk",
    "vn",
    "vr",
    "vs",
    "vs-c",
    "vs-i",
    "vs-s",
    "vt",
    "vz",
    "v-unspec",
  ],
  助動詞: ["aux", "aux-v", "aux-adj"],
  助詞: ["prt", "adv-to", "conj"],
  名詞: [
    "n",
    "n-adv",
    "n-pr",
    "n-pref",
    "n-suf",
    "n-t",
    "num",
    "ctr",
    "adj-no",
    "adj-pn",
    "pn",
    "suf",
    "pref",
    "vs",
    "exp",
  ],
  形容詞: ["adj-i", "adj-ix", "adj-kari", "adj-ku", "adj-shiku"],
  副詞: ["adv", "adv-to", "n-adv"],
  形状詞: ["adj-na", "adj-nari", "adj-no", "adj-f", "adj-pn", "n"],
  代名詞: ["pn"],
  接尾辞: ["suf", "n-suf", "c-suf", "v-suf"],
};

const SAMPLE_SENTENCES = `ジュースを友達にあげます。
明日は雨がふると思います。
パンを食べました。お腹が空いたからです。
アメリカから来ました。
何人ぐらい来ますか。
友達が私にジュースをくれました。
日本語の森で働きたいです。
ここのパソコンは学生だけが使えます。
大学に行くつもりです。
これから地球の温度がだんだん高くなっていく。
今、朝ごはんを食べています。
先生に聞いてください。
他の人を傷つけてはいけません。
仕事は忙しいです。でも、楽しいです。
帰ってもいいですか。
ここに来てください。
宿題を忘れないでください。
ジュホさんは韓国人じゃないですか。
大人になりました。
ゲームをしましょう。
カフェに行きましょうか。
テレビを見ませんか。
授業は4時までです。
私は友達にジュースをもらいました。
テストの前に勉強します。
授業の後で帰りました。
この漢字の読み方は何ですか。
たくさん本があります。
朝9時に起きました。
映画を見ることが好きです。
言い間違うことがあります。
彼は友達をうらぎることはない。
猫と犬が好きだ。
お茶と水と、どちらがいいですか。
ファミリーマートというコンビニを知っていますか。
タラと言います。
7時に起きます。
新宿は東京にある。
日本に働きに来た。
これはペンです。
ゆかさんは先生です。
今から休憩が始まります。
昨日4時に帰りました。
猫はかわいい。
今日勉強したり、買い物をしたりしました。
誕生日はいつですか。
図書館で勉強します。
ボールを落とした。
新宿へ行きます。
誰が関西出身ですか。
兄弟とよくけんかします。
これは私のペンだ。
私も学生です。
牛乳や卵を買いました。
1時ごろ会議があります。
日本に好きな食べ物があまりない。
魚はぜんぜん好きじゃない。
本を3冊買います。
このペンは青い。
家は郵便局の右にあります。
彼は背が高いです。
歌うのが好きです。
上田くんは卓球が上手だ。
廊下を静かに歩いた。
日本とアメリカと、どちらのほうが大きい？
アメリカは日本より大きいです。
食べ物の中で、パンが一番おいしいです。
明日雨がふるでしょう。
都会はうるさすぎる。
お金がほしいです。
水をください。
家に帰って、シャワーを浴びました。
学生で、日本に住んでいる。
まだ家から出ていないです。
彼はもう帰りました。
宿題をしなければなりません。
コーヒーじゃなくてお茶をください。
日本語を勉強する。
母がくれた時計は古いです。
冷蔵庫に何もないです。

鶏肉はあまり好きじゃない。
仕事が終わったあとで、ジムに行く。
あなたが行けば、私も行きます。
雨が降らない場合は泳ぎます。
二人だけで少し話がしたい。
雨が降りだした。
暇だから、ゲームでもしましょう。
この猫は誰も欲しがる人がいなかった。
日本語を勉強し始めて、もう四年経った。
その船は沈むはずがない。
食べ物が必要です。
食べる必要がある。
美味しい晩ごはんが欲しい。
このゲームは難しいんじゃないか。
彼が驚くかどうかわかりません。
漫画があるかもしれません。
寿司の食べ方を教えてくれませんか。
有名人じゃないかしら？
子供みたいです。
テレビを見ながら晩ごはんを食べます。
寝ないで勉強をします。
勉強しなければならない。
学校に行かなくてもいい。
日本語を習いたいのなら、この本がいいですよ。
ちょっと待ちなさい。
お母さんが帰ってきたことに気がつく。
この質問には答えにくいです。
言語の中で日本語が一番難しいと思います。
ごはんを作るのに一時間かかります。
この仕事は私がいたします。
皆が子供のように元気に歌い始めた。
５メートルおきに木を植えました。
タバコを止められない。
妹が部屋にいないらしい。
今年の暑さは普通ではない。
母は私に自分の部屋を片付けさせた。
毎日母に野菜を食べさせられる。
さすがの彼も妻には勝てなかった。
箱の中に卵は一個しか残っていない。
日本に来たばかりです。
妹はその馬に乗りたがっている。
寂しかったら電話をください。
宿題をしたらどうですか。
あなたのことを話してたところだよ。
明日事務所に行ってほしい。
私は今、家で日本語を勉強しているところです。
このサラダがすごく美味しいよ。食べてみて。
雨でも行きましょう。
この文章は重要です。覚えておいてください。
君に会えてよかった。
日本語は最も難しい言語だと言われている。
その辺りはとても賑やかだと聞いた。
これからパンを焼くところです。
仕事を続けるのは無理だと思う。
一日中雨が降り続く。
建物の中はいつもより暗かった。
私は留学をする予定です。
５年間日本語を勉強して、日本語が話せるようになった。
そのことは全然知りません。`;

export {
  VerbTenseDetector,
  POS_LABEL_MAP,
  JMDICT_POS_MAP,
  JMDICT_TAG_MAP,
  SAMPLE_SENTENCES,
};
