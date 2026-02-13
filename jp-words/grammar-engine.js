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
  constructor(id, title, patterns, tests = []) {
    this.id = id;
    this.title = title;
    this.patterns = patterns.map((p) => new Pattern(p));
    this.tests = tests;
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

const GRAMMAR_RULES = [
  // 1. ～ている／ておる
  new GrammarRule(
    "te-iru",
    "～ている／ておる",
    [
      [{ pos: "動詞" }, { surface: "て" }, { baseForm: "いる" }],
      [{ pos: "動詞" }, { surface: "て" }, { baseForm: "おる" }],
      [{ pos: "動詞" }, { surface: "で" }, { baseForm: "いる" }],
      [{ pos: "動詞" }, { surface: "で" }, { baseForm: "おる" }],
      // Split case (歌っており) - matches te-form + verb stem
      [
        { pos: "動詞" },
        { surface: "て" },
        { baseForm: "おる", conjugation: "連用形" },
      ],
      [
        { pos: "動詞" },
        { surface: "で" },
        { baseForm: "おる", conjugation: "連用形" },
      ],
    ],
    ["公園で子供たちが走っている。", "一人で歌を歌っております。"],
  ),

  // 2. ～あげる／やる／差し上げる
  new GrammarRule(
    "giving-verbs",
    "～あげる／やる／差し上げる",
    [
      [{ baseForm: "あげる", pos: "動詞" }],
      [{ baseForm: "やる", pos: "動詞" }],
      [{ baseForm: "差し上げる", pos: "動詞" }],
    ],
    ["友達にお菓子をあげました。", "花に水をやりに行く。"],
  ),

  // 3. ～がする
  new GrammarRule(
    "ga-suru",
    "～がする",
    [[{ pos: "名詞" }, { surface: "が" }, { baseForm: "する", pos: "動詞" }]],
    ["キッチンからカレーの匂いがする。", "変な味がする。"],
  ),

  // 4. ～方
  new GrammarRule(
    "kata-method",
    "～方",
    [
      [
        { pos: "動詞", conjugation: "連用形" },
        { surface: "方", pos: "接尾辞" },
      ],
      [{ surface: "仕方", pos: "名詞" }],
      [
        { pos: "動詞", conjugation: "連用形" },
        { surface: "方", pos: "名詞" },
      ],
      [{ surfaceEndsWith: "方", pos: "名詞" }],
    ],
    ["彼の話し方はどうも鼻につく。", "乗り換えの仕方が分からない"],
  ),

  // 5. ～かどうか
  new GrammarRule(
    "ka-dou-ka",
    "～かどうか",
    [[{ surface: "か" }, { surface: "どう" }, { surface: "か" }]],
    ["契約を更新するかどうか悩む。"],
  ),

  // 6. ～かもしれない
  new GrammarRule(
    "kamo-shirenai",
    "～かもしれない",
    [
      [
        { surface: "か" },
        { surface: "も" },
        { surface: "しれ" },
        { baseForm: "ない" },
      ],
      [
        { surface: "か" },
        { surface: "も" },
        { surface: "しれ" },
        { surface: "ませ" },
      ],
      [{ surface: "かもしれない" }],
    ],
    [
      "夫が不倫をしているかもしれない。",
      "ホラーなら一人で見れないかもしれません。",
    ],
  ),

  // 7. ～から (Reason)
  new GrammarRule(
    "kara-reason",
    "～から (Reason)",
    [[{ surface: "から", pos: "助詞" }]],
    ["眠いから寝ます。", "明日用事あるから早く寝ないと。"],
  ),

  // 8. ～後に／後で
  new GrammarRule(
    "ato-de",
    "～後に／後で",
    [
      [{ surface: "の" }, { baseForm: "後", pos: "名詞" }],
      [
        { surface: "た", pos: "助動詞" },
        { baseForm: "後", pos: "名詞" },
      ],
      [{ baseForm: "後", pos: "名詞" }, { surface: "で" }],
      [{ baseForm: "後", pos: "名詞" }, { surface: "に" }],
      // Fix: Suffix "Go" + Particle
      [{ surface: "後", pos: "接尾辞" }, { surface: "に" }],
      [{ surface: "後", pos: "接尾辞" }, { surface: "で" }],
      [{ surface: "後", pos: "接尾辞" }, { surface: "の" }],
    ],
    ["仕事の後のお風呂は最高だ。", "５分後に出発します。"],
  ),

  // 9. ～が欲しい／欲しがる
  new GrammarRule(
    "ga-hoshii",
    "～が欲しい／欲しがる",
    [
      [{ surface: "が" }, { baseForm: "欲しい" }],
      [{ baseForm: "欲しい" }, { baseForm: "ない" }],
      [{ surface: "欲し" }, { baseForm: "がる" }],
      [{ surface: "欲し" }, { surface: "がっ" }],
      [{ baseForm: "欲しがる" }],
    ],
    ["遊ぶお金が欲しい。", "母は大きい冷蔵庫を欲しがっている。"],
  ),

  // 10. ～したい／したくない／したがる
  new GrammarRule(
    "shi-tai",
    "～したい／したくない／したがる",
    [
      [{ baseForm: "たい", pos: "助動詞" }],
      [{ surface: "たく" }, { baseForm: "ない" }],
      [{ surface: "た" }, { baseForm: "がる" }],
      [{ baseForm: "たがる", pos: "助動詞" }],
    ],
    [
      "髪染めたい。",
      "学校は行きたくない。",
      "彼女は海外旅行に行きたがっている。",
    ],
  ),

  // 11. ～だけ
  new GrammarRule(
    "dake",
    "～だけ",
    [[{ surface: "だけ", pos: "助詞" }]],
    ["今日だけ全品半額です。"],
  ),

  // 12. ～てから
  new GrammarRule(
    "te-kara",
    "～てから",
    [
      [{ pos: "動詞" }, { surface: "て" }, { surface: "から" }],
      [{ pos: "動詞" }, { surface: "で" }, { surface: "から" }],
    ],
    ["ご飯を食べてから勉強する。"],
  ),

  // 13. ～てください
  new GrammarRule(
    "te-kudasai",
    "～てください／ないでください",
    [
      [{ surface: "て" }, { baseForm: "くださる" }],
      [{ surface: "で" }, { baseForm: "くださる" }],
      [{ surface: "て" }, { surface: "ちょうだい" }],
      [{ surface: "で" }, { surface: "ちょうだい" }],
      [{ surface: "て" }, { baseForm: "くれる" }],
      [{ surface: "で" }, { baseForm: "くれる" }],
      [{ surface: "て" }, { surface: "くれ" }],
      [{ surface: "ない" }, { surface: "で" }, { baseForm: "くださる" }],
    ],
    ["テスト頑張ってください。", "早く教えてくれ。", "醤油取ってちょうだい。"],
  ),

  // 14. ～です
  new GrammarRule(
    "desu",
    "～です／ではありません",
    [
      [{ baseForm: "です", pos: "助動詞" }],
      [{ surface: "で" }, { surface: "は" }, { baseForm: "ある" }],
      [{ surface: "じゃ" }, { baseForm: "ある" }],
      [{ surface: "じゃ" }, { baseForm: "ない" }],
    ],
    ["彼は学生です。", "今日は日曜日じゃありません。"],
  ),

  // 15. ～と
  new GrammarRule(
    "particle-to",
    "～と",
    [[{ surface: "と", pos: "助詞" }]],
    ["私と彼は学生です。"],
  ),

  // 16. ～ないで／ずに
  new GrammarRule(
    "naide-zuni",
    "～ないで／ずに",
    [
      [{ baseForm: "ない", pos: "助動詞" }, { surface: "で" }],
      [{ baseForm: "ず", pos: "助動詞" }, { surface: "に" }],
      [{ baseForm: "ず", pos: "助動詞" }],
    ],
    ["手を傷つけないで掴み取る。", "休まず働く。"],
  ),

  // 17. ～ながら
  new GrammarRule(
    "nagara",
    "～ながら",
    [[{ surface: "ながら", pos: "助詞" }]],
    ["歌いながら踊る。"],
  ),

  // 18. ～にする／くする
  new GrammarRule(
    "ni-suru",
    "～にする／くする",
    [
      [{ surface: "に", pos: "助詞" }, { baseForm: "する" }],
      [{ pos: "形状詞" }, { surface: "に" }, { baseForm: "する" }],
      [{ pos: "形容詞", conjugation: "連用形" }, { baseForm: "する" }],
      [{ baseForm: "ない", conjugation: "連用形" }, { baseForm: "する" }],
    ],
    [
      "我が子を弁護士にしたい。",
      "壁の色を黒くしたい。",
      "ちょっと静かにしてください。",
    ],
  ),

  // 19. ～になる／くなる
  new GrammarRule(
    "ni-naru",
    "～になる／くなる",
    [
      [{ surface: "に", pos: "助詞" }, { baseForm: "なる" }],
      [{ pos: "形容詞", conjugation: "連用形" }, { baseForm: "なる" }],
      [{ baseForm: "ない", conjugation: "連用形" }, { baseForm: "なる" }],
    ],
    ["大人になった。", "もっと可愛くなる。"],
  ),

  // 20. ～前に
  new GrammarRule(
    "mae-ni",
    "～前に／前で",
    [
      [{ baseForm: "前", pos: "名詞" }, { surface: "に" }],
      [{ baseForm: "前", pos: "名詞" }, { surface: "で" }],
      [{ pos: "名詞", surfaceEndsWith: "前" }, { surface: "に" }],
      [{ pos: "名詞", surfaceEndsWith: "前" }, { surface: "で" }],
    ],
    [
      "寝る前に歯を磨く。",
      "駅前に商業施設ができる。",
      "目の前で事故が起きた。",
    ],
  ),

  // 21. ～ましょう
  new GrammarRule(
    "mashou",
    "～ましょう",
    [[{ surface: "ましょ" }, { surface: "う" }], [{ surface: "ましょう" }]],
    ["元気出しましょう。", "また会いましょう。"],
  ),

  // 22. ～ませんか
  new GrammarRule(
    "masen-ka",
    "～ませんか",
    [[{ surface: "ませ" }, { surface: "ん" }, { surface: "か" }]],
    ["一緒に行きませんか。"],
  ),

  // 23. ～をください
  new GrammarRule(
    "o-kudasai",
    "～をください (Object)",
    [
      [{ surface: "を" }, { baseForm: "くださる" }],
      [{ surface: "を" }, { surface: "ちょうだい" }],
      [{ surface: "を" }, { baseForm: "くれる" }],
      // Fix: Omitted particle
      [{ pos: "名詞" }, { baseForm: "くれる" }],
      [{ pos: "名詞" }, { baseForm: "くださる" }],
      [{ pos: "名詞" }, { surface: "くれ" }],
      [{ surface: "ちょうだい" }],
    ],
    ["メニューをください。", "金くれ。", "お小遣いちょうだい！"],
  ),

  // 24. ～がる／がっている
  new GrammarRule(
    "garu",
    "～がる／がっている",
    [
      [{ pos: "接尾辞", baseForm: "がる" }],
      [{ surface: "がっ" }, { surface: "て" }],
      [{ surface: "がり" }], // Noun form (Sabishigari)
      [{ surface: "が" }, { surface: "られ" }],
    ],
    ["彼は死ぬことを怖がっている。", "彼女は寂しがり屋だ。"],
  ),

  // 25. ～くらい／ぐらい
  new GrammarRule(
    "kurai-gurai",
    "～くらい／ぐらい",
    [
      [{ surface: "くらい", pos: "助詞" }],
      [{ surface: "ぐらい", pos: "助詞" }],
    ],
    ["食費は毎月３万円くらいかかる。", "二人の身長は同じぐらいだ。"],
  ),

  // 26. ～くれる／くださる
  new GrammarRule(
    "kureru-kudasaru",
    "～くれる／くださる",
    [
      [{ baseForm: "くれる", pos: "動詞" }],
      [{ baseForm: "くださる", pos: "動詞" }],
      // Catch "kudasatta" split: くださっ + た
      [{ surface: "くださっ" }, { surface: "た" }],
    ],
    ["娘が手紙をくれた。", "先生が手紙をくださった。"],
  ),

  // 27. ～ことができる
  new GrammarRule(
    "koto-ga-dekiru",
    "～ことができる",
    [
      [{ surface: "こと" }, { surface: "が" }, { baseForm: "できる" }],
      [{ surface: "こと" }, { surface: "が" }, { baseForm: "でき" }],
    ],
    ["夢を叶えることができた。", "言葉に表すことができない。"],
  ),

  // 28. ～（さ）せられる
  new GrammarRule(
    "saserareru",
    "～（さ）せられる",
    [
      [{ baseForm: "させる" }, { baseForm: "られる" }],
      [{ surface: "させ" }, { baseForm: "られる" }],
      [{ surface: "させ" }, { surface: "られ" }],
      [{ surface: "さ" }, { baseForm: "れる" }],
      [{ surface: "さ" }, { surface: "せ" }, { baseForm: "られる" }],
      // Fix: Verb ending in 'sa' + 'reru' (e.g. 飲まさ + れ + た)
      [{ pos: "動詞", surfaceEndsWith: "さ" }, { baseForm: "れる" }],
      [{ pos: "動詞", surfaceEndsWith: "さ" }, { baseForm: "られる" }],
    ],
    ["母に薬を飲まされた。", "今日は残業させられた。"],
  ),

  // 29. ～過ぎる
  new GrammarRule(
    "sugiru",
    "～過ぎる",
    [
      [{ baseForm: "過ぎる", pos: "動詞" }],
      [{ baseForm: "すぎる" }],
      [{ surface: "すぎ" }, { surface: "て" }],
      // Noun + Sugiru or Adj Stem + Sugiru often appears as Suffix Verb "sugi"
      [{ surface: "すぎ" }],
      [{ surface: "過ぎ" }],
    ],
    ["夜景が美しすぎて見とれてしまった。", "飲み過ぎた。"],
  ),

  // 30. ～せる／させる
  new GrammarRule(
    "seru-saseru",
    "～せる／させる",
    [
      [{ baseForm: "せる", pos: "助動詞" }],
      [{ baseForm: "させる", pos: "助動詞" }],
      [{ surface: "せ" }, { surface: "て" }], // "se" token
      [{ surface: "させ" }, { surface: "て" }],
    ],
    ["母は私を買い物に行かせた。", "子供に怪我をさせてしまった。"],
  ),

  // 31. ～そうだ
  new GrammarRule(
    "souda",
    "～そうだ（様態・伝聞）",
    [
      [{ surface: "そう" }, { baseForm: "だ" }],
      [{ surface: "そう" }, { baseForm: "です" }],
      [{ surface: "そう" }, { surface: "な" }],
      [{ surface: "そう" }, { surface: "に" }],
    ],
    ["明日は雨だそうだ。", "美味しそうなケーキだ。", "雨が降りそうだ。"],
  ),

  // 32. ～出す
  new GrammarRule(
    "dasu",
    "～出す",
    [
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "だす" }],
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "出す" }],
    ],
    ["赤ちゃんが急に泣き出した。", "雨が降り出した。"],
  ),

  // 33. ～たところだ
  new GrammarRule(
    "ta-tokoro-da",
    "～たところだ",
    [
      [
        { pos: "助動詞", surface: "た" },
        { surface: "ところ" },
        { baseForm: "だ" },
      ],
      [
        { pos: "助動詞", surface: "た" },
        { surface: "ところ" },
        { baseForm: "です" },
      ],
    ],
    ["今帰って来たところです。", "ちょうど食べ終わったところだ。"],
  ),

  // 34. ～たばかりだ
  new GrammarRule(
    "ta-bakari-da",
    "～たばかりだ",
    [[{ pos: "助動詞", surface: "た" }, { surface: "ばかり" }]],
    ["さっき起きたばかりだ。", "日本に来たばかりです。"],
  ),

  // 35. ～続ける
  new GrammarRule(
    "tsudzukeru",
    "～続ける",
    [
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "続ける" }],
      // Fix: Intransitive 'tsudzuku'
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "続く" }],
    ],
    ["努力し続ける。", "雨が降り続いている。"],
  ),

  // 36. ～つもりだ
  new GrammarRule(
    "tsumori",
    "～つもりだ",
    [
      [{ surface: "つもり" }, { baseForm: "だ" }],
      [{ surface: "つもり" }, { baseForm: "です" }],
      [{ surface: "つもり" }, { surface: "は" }],
    ],
    ["来年大学に進学するつもりだ。", "負けるつもりはない。"],
  ),

  // 37. ～てあげる
  new GrammarRule(
    "te-ageru",
    "～てあげる",
    [
      [{ surface: "て" }, { baseForm: "あげる" }],
      [{ surface: "て" }, { baseForm: "やる" }],
      [{ surface: "て" }, { baseForm: "差し上げる" }],
      [{ surface: "で" }, { baseForm: "あげる" }],
      [{ surface: "て" }, { surface: "やっ" }], // Te-yatta
    ],
    ["妹に香水買ってあげた。", "花壇に水を撒いてやった。"],
  ),

  // 38. ～てある
  new GrammarRule(
    "te-aru",
    "～てある",
    [
      [{ surface: "て" }, { baseForm: "ある" }],
      [{ surface: "で" }, { baseForm: "ある" }],
      [{ surface: "て" }, { surface: "あり" }],
    ],
    ["壁に絵が飾ってある。", "ホテルはもう予約してあります。"],
  ),

  // 39. ～ていく
  new GrammarRule(
    "te-iku",
    "～ていく",
    [
      [{ surface: "て" }, { baseForm: "いく" }],
      [{ surface: "て" }, { baseForm: "行く" }],
      [{ surface: "で" }, { baseForm: "いく" }],
      [{ surface: "で" }, { surface: "いっ" }], // De-itta
    ],
    ["これからも日本語を勉強していく。", "鳥が飛んでいった。"],
  ),

  // 40. ～ているところだ
  new GrammarRule(
    "te-iru-tokoro",
    "～ているところだ",
    [
      [{ surface: "て" }, { baseForm: "いる" }, { surface: "ところ" }],
      [{ surface: "で" }, { baseForm: "いる" }, { surface: "ところ" }],
    ],
    ["今ご飯を食べているところです。", "掃除しているところだ。"],
  ),

  // 41. ～ておく
  new GrammarRule(
    "te-oku",
    "～ておく",
    [
      [{ surface: "て" }, { baseForm: "おく" }],
      [{ surface: "で" }, { baseForm: "おく" }],
      [{ surface: "とく" }],
      [{ surface: "どく" }],
      [{ surface: "て" }, { surface: "おき" }], // Te-oki
      [{ surface: "て" }, { surface: "おい" }], // Te-oi(te)
    ],
    ["部屋を掃除しておきましょう。", "そこに置いておいてください。"],
  ),

  // 42. ～てくる
  new GrammarRule(
    "te-kuru",
    "～てくる",
    [
      [{ surface: "て" }, { baseForm: "くる" }],
      [{ surface: "て" }, { baseForm: "来る" }],
      [{ surface: "で" }, { baseForm: "くる" }],
      [{ surface: "て" }, { surface: "き" }], // Te-ki(ta)
    ],
    ["お腹が空いてきた。", "雨が降ってくる。"],
  ),

  // 43. ～てくれる
  new GrammarRule(
    "te-kureru",
    "～てくれる",
    [
      [{ surface: "て" }, { baseForm: "くれる" }],
      [{ surface: "て" }, { baseForm: "くださる" }],
      [{ surface: "で" }, { baseForm: "くれる" }],
      [{ surface: "て" }, { surface: "くれ" }], // Te-kure
    ],
    ["友達が手伝ってくれた。", "先生が褒めてくれた。"],
  ),

  // 44. ～てしまう
  new GrammarRule(
    "te-shimau",
    "～てしまう",
    [
      [{ surface: "て" }, { baseForm: "しまう" }],
      [{ surface: "で" }, { baseForm: "しまう" }],
      [{ baseForm: "ちゃう" }],
      [{ baseForm: "じゃう" }],
      [{ surface: "ちゃっ" }],
    ],
    ["忘れてしまった。", "食べちゃった。"],
  ),

  // 45. ～てはいけない
  new GrammarRule(
    "te-wa-ikenai",
    "～てはいけない",
    [
      [{ surface: "て" }, { surface: "は" }, { baseForm: "いける" }],
      [{ surface: "て" }, { surface: "は" }, { baseForm: "いけない" }],
      [{ surface: "て" }, { surface: "は" }, { baseForm: "だめ" }],
      [{ surface: "て" }, { surface: "は" }, { baseForm: "ならない" }],
      [{ surface: "ちゃ" }, { baseForm: "いけない" }],
      [{ surface: "じゃ" }, { baseForm: "いけない" }],
      // Fix: Voiced 'de', and split 'ike'+'nai'
      [
        { surface: "で" },
        { surface: "は" },
        { surface: "いけ" },
        { baseForm: "ない" },
      ],
      [
        { surface: "て" },
        { surface: "は" },
        { surface: "いけ" },
        { baseForm: "ない" },
      ],
      // Fix: Polite form
      [
        { surface: "て" },
        { surface: "は" },
        { surface: "いけ" },
        { surface: "ませ" },
      ],
    ],
    ["ここに入ってはいけません。", "遊んではいけない。"],
  ),

  // 46. ～てばかり
  new GrammarRule(
    "te-bakari",
    "～てばかり",
    [
      [{ surface: "て" }, { surface: "ばかり" }],
      [{ surface: "で" }, { surface: "ばかり" }],
    ],
    ["寝てばかりいる。", "負けてばかりだ。"],
  ),

  // 47. ～てみる
  new GrammarRule(
    "te-miru",
    "～てみる",
    [
      [{ surface: "て" }, { baseForm: "みる" }],
      [{ surface: "て" }, { baseForm: "見る" }],
      [{ surface: "で" }, { baseForm: "みる" }],
      [{ surface: "て" }, { surface: "み" }], // Te-mi(ta)
    ],
    ["一度やってみたら。", "着てみてもいいですか。"],
  ),

  // 48. ～てもいい
  new GrammarRule(
    "te-mo-ii",
    "～てもいい",
    [
      [{ surface: "て" }, { surface: "も" }, { baseForm: "いい" }],
      [{ surface: "て" }, { surface: "も" }, { baseForm: "よい" }],
      [{ surface: "で" }, { surface: "も" }, { baseForm: "いい" }],
      [{ surface: "で" }, { surface: "も" }, { baseForm: "いい" }],
    ],
    ["読んでもいいですか？", "下手でもいい。"],
  ),

  // 49. ～てもらう
  new GrammarRule(
    "te-morau",
    "～てもらう",
    [
      [{ surface: "て" }, { baseForm: "もらう" }],
      [{ surface: "て" }, { baseForm: "いただく" }],
      [{ surface: "て" }, { baseForm: "頂く" }],
      [{ surface: "で" }, { baseForm: "もらう" }],
      [{ surface: "て" }, { surface: "頂き" }], // Te-itadaki
    ],
    ["友だちに紹介してもらった。", "案内して頂きました。"],
  ),

  // 50. ～（る）ところだ
  new GrammarRule(
    "ru-tokoro",
    "～（る）ところだ",
    [
      // Fix: Simple generic Verb + Tokoro to catch Dictionary/Volitional/etc forms before Tokoro
      [{ pos: "動詞" }, { surface: "ところ" }],
    ],
    ["これから出かけるところだ。", "今寝るところです。"],
  ),

  // 51. ～なくてもいい
  new GrammarRule(
    "nakute-mo-ii",
    "～なくてもいい",
    [
      [
        { surface: "なく" },
        { surface: "て" },
        { surface: "も" },
        { baseForm: "いい" },
      ],
      [
        { surface: "なく" },
        { surface: "て" },
        { surface: "も" },
        { baseForm: "構う" },
      ],
      [{ surface: "ず" }, { surface: "と" }, { surface: "も" }],
    ],
    ["急がなくてもいい。", "謝らなくてもいいですよ。"],
  ),

  // 52. ～なさい
  new GrammarRule(
    "nasai",
    "～なさい",
    [
      [{ pos: "動詞", conjugation: "連用形" }, { surface: "なさい" }],
      [{ pos: "動詞", conjugation: "連用形" }, { surface: "なされ" }],
      [{ surface: "来なさい" }], // Irregular
      [{ surface: "しなさい" }], // Irregular
    ],
    ["早く来なさい。", "野菜を食べなさい。"],
  ),

  // 53. ～にくい／やすい
  new GrammarRule(
    "nikui-yasui",
    "～にくい／やすい",
    [
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "にくい" }],
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "難い" }],
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "やすい" }],
      [{ pos: "動詞", conjugation: "連用形" }, { baseForm: "易い" }],
    ],
    ["このペンは使いにくい。", "分かりやすい説明。"],
  ),

  // 54. ～に対して
  new GrammarRule(
    "ni-taishite",
    "～に対して",
    [
      [{ surface: "に" }, { surface: "対し" }],
      [{ surface: "に" }, { surface: "対する" }],
    ],
    ["ご支援に対し感謝します。", "兄に対して弟は..."],
  ),

  // 55. ～について
  new GrammarRule(
    "ni-tsuite",
    "～について",
    [
      [{ surface: "に" }, { surface: "つい" }, { surface: "て" }],
      [{ surface: "に" }, { surface: "つき" }, { surface: "まし" }],
    ],
    ["この件について話し合う。", "将来について考える。"],
  ),

  // 56. ～にとって
  new GrammarRule(
    "ni-totte",
    "～にとって",
    [[{ surface: "に" }, { surface: "とっ" }, { surface: "て" }]],
    ["私にとって重要だ。"],
  ),

  // 57. ～のうち
  new GrammarRule(
    "no-uchi",
    "～のうち",
    [
      [{ surface: "の" }, { baseForm: "うち" }],
      [{ surface: "の" }, { baseForm: "内" }],
      // Fix: Adjective + Uchi
      [{ pos: "形容詞" }, { baseForm: "うち" }],
      [{ pos: "動詞" }, { baseForm: "うち" }], // e.g. Shiranai-uchi-ni
    ],
    ["３つのうち１つを選ぶ。", "若いうちに旅をする。"],
  ),

  // 58. ～ので
  new GrammarRule(
    "node",
    "～ので",
    [
      [{ surface: "ので", pos: "助詞" }],
      [{ surface: "んで", pos: "助詞" }],
      // Fix: Split 'no-de' and 'n-de'
      [{ surface: "の" }, { surface: "で" }],
      [{ surface: "ん" }, { surface: "で" }],
    ],
    ["頭が痛いので寝ます。", "分からないんで教えて。"],
  ),

  // 59. ～のです／んです
  new GrammarRule(
    "no-desu",
    "～のです／んです",
    [
      [{ surface: "の" }, { baseForm: "です" }],
      [{ surface: "ん" }, { baseForm: "です" }],
      [{ surface: "ん" }, { baseForm: "だ" }],
      [{ surface: "の" }, { baseForm: "だ" }],
    ],
    ["明日行くのです。", "大好きなんです。"],
  ),

  // 60. ～のところ
  new GrammarRule(
    "no-tokoro",
    "～のところ",
    [[{ surface: "の" }, { surface: "ところ" }]],
    ["今のところ変化はない。", "現在のところ不明だ。"],
  ),

  // 61. ～ばかり
  new GrammarRule(
    "bakari",
    "～ばかり",
    [[{ surface: "ばかり", pos: "助詞" }]],
    ["雨ばかり降っている。", "嘘ばかりつく。"],
  ),

  // 62. ～はずだ
  new GrammarRule(
    "hazu-da",
    "～はずだ",
    [
      [{ baseForm: "はず" }, { baseForm: "だ" }],
      [{ baseForm: "はず" }, { baseForm: "です" }],
    ],
    ["彼は来るはずだ。", "寒いはずだ。"],
  ),

  // 63. 別に～ない
  new GrammarRule(
    "betsu-ni-nai",
    "別に～ない",
    [
      [{ baseForm: "別に", pos: "副詞" }],
      // Fix: Split 'Betsu' + 'ni'
      [{ surface: "別" }, { surface: "に" }],
    ],
    ["別にいいよ。", "別に嫌いではない。"],
  ),

  // 64. ～ほど
  new GrammarRule(
    "hodo",
    "～ほど",
    [[{ surface: "ほど", pos: "助詞" }]],
    ["死ぬほど好き。", "３時間ほど待った。"],
  ),

  // 65. ～までに
  new GrammarRule(
    "made-ni",
    "～までに",
    [[{ surface: "まで" }, { surface: "に" }]],
    ["明日までに終わらせる。", "５時までに来る。"],
  ),

  // 66. ～まま
  new GrammarRule(
    "mama",
    "～まま",
    [[{ baseForm: "まま", pos: "名詞" }]],
    ["このままではいけない。", "服を着たまま寝る。"],
  ),

  // 67. ～みたい
  new GrammarRule(
    "mitai",
    "～みたい",
    [
      [{ baseForm: "みたい", pos: "助動詞" }],
      [{ surface: "みたい" }, { surface: "な" }],
      [{ surface: "みたい" }, { surface: "に" }],
      // Fix: Adjectival Noun (Keijoushi)
      [{ baseForm: "みたい", pos: "形状詞" }],
    ],
    ["夢みたいだ。", "子供みたいに泣く。"],
  ),

  // 68. ～もらう
  new GrammarRule(
    "morau",
    "～もらう",
    [
      [{ baseForm: "もらう", pos: "動詞" }],
      [{ baseForm: "いただく", pos: "動詞" }],
      [{ baseForm: "頂く", pos: "動詞" }],
      [{ surface: "もらっ" }], // Past
      [{ surface: "頂い" }], // Past
    ],
    ["プレゼントをもらった。", "内定を頂いた。"],
  ),

  // 69. ～ようだ
  new GrammarRule(
    "you-da",
    "～ようだ",
    [
      [{ baseForm: "よう", pos: "助動詞" }, { baseForm: "だ" }],
      [{ surface: "よう" }, { surface: "な" }],
      [{ surface: "よう" }, { surface: "に" }],
      // Fix: Adjectival Noun
      [{ baseForm: "よう", pos: "形状詞" }],
    ],
    ["雨のようだ。", "魔法のように消えた。"],
  ),

  // 70. ～ようと思う
  new GrammarRule(
    "you-to-omou",
    "～ようと思う",
    [
      [{ surface: "う" }, { surface: "と" }, { baseForm: "思う" }],
      [{ surface: "よう" }, { surface: "と" }, { baseForm: "思う" }],
      // Fix: Volitional Form + to + omou
      [
        { pos: "動詞", conjugation: "意志推量形" },
        { surface: "と" },
        { baseForm: "思う" },
      ],
    ],
    ["行こうと思う。", "始めようと思っている。"],
  ),

  // 71. ～ようにする
  new GrammarRule(
    "you-ni-suru",
    "～ようにする",
    [[{ surface: "よう" }, { surface: "に" }, { baseForm: "する" }]],
    ["遅れないようにする。", "メモするようにしている。"],
  ),

  // 72. ～ようになる
  new GrammarRule(
    "you-ni-naru",
    "～ようになる",
    [[{ surface: "よう" }, { surface: "に" }, { baseForm: "なる" }]],
    ["泳げるようになった。", "分かるようになった。"],
  ),

  // 73. ～らしい
  new GrammarRule(
    "rashii",
    "～らしい",
    [[{ baseForm: "らしい", pos: "助動詞" }], [{ surface: "らしく" }]],
    ["雨らしい。", "男らしい。"],
  ),

  // 74. ～れる／られる
  new GrammarRule(
    "reru-rareru",
    "～れる／られる",
    [
      [{ baseForm: "れる", pos: "助動詞" }],
      [{ baseForm: "られる", pos: "助動詞" }],
      [{ surface: "れ" }], // Tokenized as 're'
      [{ surface: "られ" }],
    ],
    ["先生に叱られた。", "食べられる（可能）。", "食べられる（受身）。"],
  ),
];

// ==========================================
// 3. Execution & Self-Test Module
// ==========================================

async function runGrammarEngineCheck(sudachi) {
  console.log("Starting Grammar Engine Self-Test...\n");

  let totalMatches = 0;

  for (const rule of GRAMMAR_RULES) {
    console.log(`--- Testing Rule: [${rule.title}] ---`);

    for (const sentence of rule.tests) {
      const rawJson = sudachi.tokenize_stringified(sentence, 0); // Mode A
      const tokens = JSON.parse(rawJson);

      const results = rule.scan(tokens);

      if (results.length > 0) {
        const matchTexts = results.map((r) => `"${r.text}"`).join(", ");
        console.log(
          `✅ MATCH: Sentence: "${sentence}" -> Found: ${matchTexts}`,
        );
        totalMatches++;
      } else {
        console.log(`❌ FAIL:  Sentence: "${sentence}" -> No match found.`);
        console.log(
          "   Tokens:",
          tokens
            .map((t) => `${t.surface}(${t.poses[0]}:${t.poses[5]})`)
            .join(" | "),
        );
      }
    }
    console.log("");
  }

  return totalMatches;
}

export { GrammarRule, GRAMMAR_RULES, runGrammarEngineCheck };
