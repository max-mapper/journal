const GRAMMAR_RULES = [
  {
    id: "te-iru",
    title: "～ている／ておる",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "いる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "おる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "いる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "おる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "おる",
          conjugation: "連用形",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "おる",
          conjugation: "連用形",
        },
      ],
    ],
    tests: [
      "公園で子供たちが走っている。",
      "一人で歌を歌っております。",
      "この交差点は毎年多くの人が交通事故で死んでいる。",
    ],
  },
  {
    id: "giving-verbs",
    title: "～あげる／やる／差し上げる",
    patterns: [
      [
        {
          baseForm: "あげる",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "やる",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "差し上げる",
          pos: "動詞",
        },
      ],
      [
        {
          surface: "差し",
        },
        {
          baseForm: "上げる",
        },
      ],
    ],
    tests: [
      "友達にお菓子をあげました。",
      "花に水をやりに行く。",
      "ご来店いただいた先着１００名様にプレゼントを差し上げます。",
    ],
  },
  {
    id: "ga-suru",
    title: "～がする",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "が",
        },
        {
          baseForm: "する",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "キッチンからカレーの匂いがする。",
      "変な味がする。",
      "遠くからピアノの音がする。",
    ],
  },
  {
    id: "kata-method",
    title: "～方",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "方",
          pos: "接尾辞",
        },
      ],
      [
        {
          surface: "仕方",
          pos: "名詞",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "方",
          pos: "名詞",
        },
      ],
      [
        {
          surfaceEndsWith: "方",
          pos: "名詞",
        },
      ],
    ],
    tests: [
      "彼の話し方はどうも鼻につく。",
      "乗り換えの仕方が分からない",
      "謝り方を間違ったせいで、もっと叱られた。",
    ],
  },
  {
    id: "ka-dou-ka",
    title: "～かどうか",
    patterns: [
      [
        {
          surface: "か",
        },
        {
          surface: "どう",
        },
        {
          surface: "か",
        },
      ],
    ],
    tests: [
      "契約を更新するかどうか悩む。",
      "この服似合ってるかどうかは自分ではちょっとわからない。",
    ],
  },
  {
    id: "kamo-shirenai",
    title: "～かもしれない",
    patterns: [
      [
        {
          surface: "か",
        },
        {
          surface: "も",
        },
        {
          surface: "しれ",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "か",
        },
        {
          surface: "も",
        },
        {
          surface: "しれ",
        },
        {
          surface: "ませ",
        },
      ],
      [
        {
          surface: "かもしれない",
        },
      ],
    ],
    tests: [
      "夫が不倫をしているかもしれない。",
      "ホラーなら一人で見れないかもしれません。",
    ],
  },
  {
    id: "kara-reason",
    title: "～から (Reason)",
    patterns: [
      [
        {
          surface: "から",
          pos: "助詞",
        },
      ],
    ],
    tests: ["眠いから寝ます。", "明日用事あるから早く寝ないと。"],
  },
  {
    id: "ato-de",
    title: "～後に／後で",
    patterns: [
      [
        {
          surface: "の",
        },
        {
          baseForm: "後",
          pos: "名詞",
        },
      ],
      [
        {
          surface: "た",
          pos: "助動詞",
        },
        {
          baseForm: "後",
          pos: "名詞",
        },
      ],
      [
        {
          baseForm: "後",
          pos: "名詞",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          baseForm: "後",
          pos: "名詞",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          surface: "後",
          pos: "接尾辞",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          surface: "後",
          pos: "接尾辞",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          surface: "後",
          pos: "接尾辞",
        },
        {
          surface: "の",
        },
      ],
    ],
    tests: [
      "仕事の後のお風呂は最高だ。",
      "５分後に出発します。",
      "トイレに行った後は必ず手を洗うこと。",
      "家を出た後で忘れ物をしたことに気づいた。",
      "学生時代はよく放課後に友達と遊びにいった。",
    ],
  },
  {
    id: "ga-hoshii",
    title: "～が欲しい／欲しがる",
    patterns: [
      [
        {
          surface: "が",
        },
        {
          baseForm: "欲しい",
        },
      ],
      [
        {
          baseForm: "欲しい",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "欲し",
        },
        {
          baseForm: "がる",
        },
      ],
      [
        {
          surface: "欲し",
        },
        {
          surface: "がっ",
        },
      ],
      [
        {
          baseForm: "欲しがる",
        },
      ],
    ],
    tests: [
      "遊ぶお金が欲しい。",
      "母は大きい冷蔵庫を欲しがっている。",
      "子供は欲しくない。",
    ],
  },
  {
    id: "shi-tai",
    title: "～したい／したくない／したがる",
    patterns: [
      [
        {
          baseForm: "たい",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "たく",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "た",
        },
        {
          baseForm: "がる",
        },
      ],
      [
        {
          baseForm: "たがる",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "髪染めたい。",
      "学校は行きたくない。",
      "彼女は海外旅行に行きたがっている。",
    ],
  },
  {
    id: "naide-zuni",
    title: "～ないで／ずに",
    patterns: [
      [
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          baseForm: "ず",
          pos: "助動詞",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          baseForm: "ず",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "手を傷つけないで掴み取る。",
      "休まず働く。",
      "一度もモテ期が訪れずに人生を終えることになりそうだ。",
    ],
  },
  {
    id: "nagara",
    title: "～ながら",
    patterns: [
      [
        {
          surface: "ながら",
          pos: "助詞",
        },
      ],
    ],
    tests: ["歌いながら踊る。"],
  },
  {
    id: "ni-suru",
    title: "～にする／くする",
    patterns: [
      [
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "する",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "に",
        },
        {
          baseForm: "する",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          baseForm: "する",
        },
      ],
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          baseForm: "する",
        },
      ],
    ],
    tests: [
      "我が子を弁護士にしたい。",
      "壁の色を黒くしたい。",
      "ちょっと静かにしてください。",
    ],
  },
  {
    id: "ni-naru",
    title: "～になる／くなる／となる",
    patterns: [
      [
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
      ],
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          baseForm: "なる",
        },
      ],
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          baseForm: "なる",
        },
      ],
    ],
    tests: [
      "大人になった。",
      "もっと可愛くなる。",
      "聞けば聞くほど分からなくなる。",
      "来月から有料となる。",
    ],
  },
  {
    id: "mae-ni",
    title: "～前に／前で",
    patterns: [
      [
        {
          baseForm: "前",
          pos: "名詞",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          baseForm: "前",
          pos: "名詞",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          pos: "名詞",
          surfaceEndsWith: "前",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          pos: "名詞",
          surfaceEndsWith: "前",
        },
        {
          surface: "で",
        },
      ],
    ],
    tests: [
      "寝る前に歯を磨く。",
      "駅前に商業施設ができる。",
      "目の前で事故が起きた。",
    ],
  },
  {
    id: "mashou",
    title: "～ましょう",
    patterns: [
      [
        {
          surface: "ましょ",
        },
        {
          surface: "う",
        },
      ],
      [
        {
          surface: "ましょう",
        },
      ],
    ],
    tests: [
      "元気出しましょう。",
      "また会いましょう。",
      "お寿司でも食べにいきましょうか。",
    ],
  },
  {
    id: "masen-ka",
    title: "～ませんか",
    patterns: [
      [
        {
          surface: "ませ",
        },
        {
          surface: "ん",
        },
        {
          surface: "か",
        },
      ],
    ],
    tests: ["一緒に行きませんか。"],
  },
  {
    id: "o-kudasai",
    title: "～をください (Object)",
    patterns: [
      [
        {
          surface: "を",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          surface: "を",
        },
        {
          surface: "ちょうだい",
        },
      ],
      [
        {
          surface: "を",
        },
        {
          baseForm: "くれる",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          baseForm: "くれる",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "くれ",
        },
      ],
      [
        {
          surface: "ちょうだい",
        },
      ],
    ],
    tests: [
      "メニューをください。",
      "金くれ。",
      "お小遣いちょうだい！",
      "彼が素敵な花束をくれた。",
      "ちょっとそこのお皿ちょうだい。",
    ],
  },
  {
    id: "garu",
    title: "～がる／がっている",
    patterns: [
      [
        {
          pos: "接尾辞",
          baseForm: "がる",
        },
      ],
      [
        {
          surface: "がっ",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          surface: "がり",
        },
      ],
      [
        {
          surface: "が",
        },
        {
          surface: "られ",
        },
      ],
    ],
    tests: [
      "彼は死ぬことを怖がっている。",
      "彼女は寂しがり屋だ。",
      "うちの猫は爪切られるのをとても嫌がる。",
    ],
  },
  {
    id: "kurai-gurai",
    title: "～くらい／ぐらい",
    patterns: [
      [
        {
          surface: "くらい",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "ぐらい",
          pos: "助詞",
        },
      ],
    ],
    tests: ["食費は毎月３万円くらいかかる。", "二人の身長は同じぐらいだ。"],
  },
  {
    id: "kureru-kudasaru",
    title: "～くれる／くださる",
    patterns: [
      [
        {
          baseForm: "くれる",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "くださる",
          pos: "動詞",
        },
      ],
      [
        {
          surface: "くださっ",
        },
        {
          surface: "た",
        },
      ],
    ],
    tests: ["娘が手紙をくれた。", "先生が手紙をくださった。"],
  },
  {
    id: "koto-ga-dekiru",
    title: "～ことができる",
    patterns: [
      [
        {
          surface: "こと",
        },
        {
          surface: "が",
        },
        {
          baseForm: "できる",
        },
      ],
      [
        {
          surface: "こと",
        },
        {
          surface: "が",
        },
        {
          baseForm: "でき",
        },
      ],
    ],
    tests: ["夢を叶えることができた。", "言葉に表すことができない。"],
  },
  {
    id: "saserareru",
    title: "～（さ）せられる",
    patterns: [
      [
        {
          baseForm: "させる",
        },
        {
          baseForm: "られる",
        },
      ],
      [
        {
          surface: "させ",
        },
        {
          baseForm: "られる",
        },
      ],
      [
        {
          surface: "させ",
        },
        {
          surface: "られ",
        },
      ],
      [
        {
          surface: "さ",
        },
        {
          baseForm: "れる",
        },
      ],
      [
        {
          surface: "さ",
        },
        {
          surface: "せ",
        },
        {
          baseForm: "られる",
        },
      ],
      [
        {
          pos: "動詞",
          surfaceEndsWith: "さ",
        },
        {
          baseForm: "れる",
        },
      ],
      [
        {
          pos: "動詞",
          surfaceEndsWith: "さ",
        },
        {
          baseForm: "られる",
        },
      ],
    ],
    tests: [
      "母に薬を飲まされた。",
      "今日は残業させられた。",
      "非常に感動させられる映画だった。",
    ],
  },
  {
    id: "sugiru",
    title: "～過ぎる",
    patterns: [
      [
        {
          baseForm: "過ぎる",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "すぎる",
        },
      ],
      [
        {
          surface: "すぎ",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          surface: "すぎ",
        },
      ],
      [
        {
          surface: "過ぎ",
        },
      ],
    ],
    tests: [
      "夜景が美しすぎて見とれてしまった。",
      "飲み過ぎた。",
      "今の会社は残業が多すぎる。",
    ],
  },
  {
    id: "seru-saseru",
    title: "～せる／させる",
    patterns: [
      [
        {
          baseForm: "せる",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "させる",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "せ",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          surface: "させ",
        },
        {
          surface: "て",
        },
      ],
    ],
    tests: [
      "母は私を買い物に行かせた。",
      "子供に怪外をさせてしまった。",
      "彼女を待たせているので早く行かなければ。",
    ],
  },
  {
    id: "souda",
    title: "～そうだ（様態・伝聞）",
    patterns: [
      [
        {
          surface: "そう",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          surface: "そう",
        },
        {
          baseForm: "です",
        },
      ],
      [
        {
          surface: "そう",
        },
        {
          surface: "な",
        },
      ],
      [
        {
          surface: "そう",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "明日は雨だそうだ。",
      "美味しそうなケーキだ。",
      "雨が降りそうだ。",
      "不思議そうに首を傾げた。",
    ],
  },
  {
    id: "dasu",
    title: "～出す",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "だす",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "出す",
        },
      ],
    ],
    tests: [
      "赤ちゃんが急に泣き出した。",
      "雨が降り出した。",
      "先生からの難問に、生徒は一斉に考え出した。",
    ],
  },
  {
    id: "ta-tokoro-da",
    title: "～たところだ",
    patterns: [
      [
        {
          pos: "助動詞",
          surface: "た",
        },
        {
          surface: "ところ",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          pos: "助動詞",
          surface: "た",
        },
        {
          surface: "ところ",
        },
        {
          baseForm: "です",
        },
      ],
    ],
    tests: ["今帰って来たところです。", "ちょうど食べ終わったところだ。"],
  },
  {
    id: "ta-bakari-da",
    title: "～たばかりだ",
    patterns: [
      [
        {
          pos: "助動詞",
          surface: "た",
        },
        {
          surface: "ばかり",
        },
      ],
    ],
    tests: ["さっき起きたばかりだ。", "日本に来たばかりです。"],
  },
  {
    id: "tsudzukeru",
    title: "～続ける",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "続ける",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "続く",
        },
      ],
    ],
    tests: ["努力し続ける。", "雨が降り続いている。"],
  },
  {
    id: "tsumori",
    title: "～つもりだ",
    patterns: [
      [
        {
          surface: "つもり",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          surface: "つもり",
        },
        {
          baseForm: "です",
        },
      ],
      [
        {
          surface: "つもり",
        },
        {
          surface: "は",
        },
      ],
    ],
    tests: [
      "来年大学に進学するつもりだ。",
      "負けるつもりはない。",
      "子供は３人作るつもりです。",
    ],
  },
  {
    id: "te-ageru",
    title: "～てあげる",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "あげる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "やる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "差し上げる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "差し",
        },
        {
          baseForm: "上げる",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "あげる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "やっ",
        },
      ],
    ],
    tests: [
      "妹に香水買ってあげた。",
      "花壇に水を撒いてやった。",
      "ご主人様を癒して差し上げるのが私の務めです。",
    ],
  },
  {
    id: "te-aru",
    title: "～てある",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "ある",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "ある",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "あり",
        },
      ],
    ],
    tests: ["壁に絵が飾ってある。", "ホテルはもう予約してあります。"],
  },
  {
    id: "te-iku",
    title: "～ていく",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "いく",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "行く",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "いく",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "いっ",
        },
      ],
    ],
    tests: ["これからも日本語を勉強していく。", "鳥が飛んでいった。"],
  },
  {
    id: "te-iru-tokoro",
    title: "～ているところだ",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "ところ",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "ところ",
        },
      ],
    ],
    tests: ["今ご飯を食べているところです。", "掃除しているところだ。"],
  },
  {
    id: "te-oku",
    title: "～ておく",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "おく",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "おく",
        },
      ],
      [
        {
          surface: "とく",
        },
      ],
      [
        {
          surface: "どく",
        },
      ],
      [
        {
          surface: "とい",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "どい",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "おき",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "おい",
        },
      ],
    ],
    tests: [
      "部屋を掃除しておきましょう。",
      "そこに置いておいてください。",
      "ここに置いておくので、使いたければ使ってください。",
      "世の中には謎のままにしといたほうがいいこともある。",
    ],
  },
  {
    id: "te-kuru",
    title: "～てくる",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "くる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "来る",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "くる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "き",
        },
      ],
    ],
    tests: [
      "お腹が空いてきた。",
      "雨が降ってくる。",
      "今帰って来たところです。",
    ],
  },
  {
    id: "te-kureru",
    title: "～てくれる",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "くれる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "くれる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "くれ",
        },
      ],
    ],
    tests: [
      "友達が手伝ってくれた。",
      "先生が褒めてくれた。",
      "沢山の方が協力してくださいました。",
      "早く教えてくれ。",
    ],
  },
  {
    id: "te-shimau",
    title: "～てしまう",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "しまう",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "しまう",
        },
      ],
      [
        {
          baseForm: "ちゃう",
        },
      ],
      [
        {
          baseForm: "じゃう",
        },
      ],
      [
        {
          surface: "ちゃっ",
        },
      ],
    ],
    tests: [
      "忘れてしまった。",
      "食べちゃった。",
      "一生分の運を使い切っちゃった気がする。",
    ],
  },
  {
    id: "te-wa-ikenai",
    title: "～てはいけない",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "いける",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "いけない",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "だめ",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "ならない",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "ちゃ",
        },
        {
          baseForm: "いけない",
        },
      ],
      [
        {
          surface: "じゃ",
        },
        {
          baseForm: "いけない",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "は",
        },
        {
          surface: "いけ",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          surface: "いけ",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          surface: "いけ",
        },
        {
          surface: "ませ",
        },
      ],
    ],
    tests: [
      "ここに入ってはいけません。",
      "遊んではいけない。",
      "この先立ち入ってはならない。",
      "早く治したいからといって、薬をたくさん飲んではいけない。",
    ],
  },
  {
    id: "te-bakari",
    title: "～てばかり",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          surface: "ばかり",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "ばかり",
        },
      ],
    ],
    tests: ["寝てばかりいる。", "負けてばかりだ。"],
  },
  {
    id: "te-miru",
    title: "～てみる",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "みる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "見る",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "みる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "み",
        },
      ],
    ],
    tests: [
      "一度やってみたら。",
      "着てみてもいいですか。",
      "死ぬまでに一度は本場の中華料理を食べてみたい。",
    ],
  },
  {
    id: "te-mo-ii",
    title: "～てもいい",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "いい",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "よい",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "も",
        },
        {
          baseForm: "いい",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "も",
        },
        {
          baseForm: "いい",
        },
      ],
    ],
    tests: [
      "読んでもいいですか？",
      "下手でもいい。",
      "嫌なら断ってもいいです。",
    ],
  },
  {
    id: "te-morau",
    title: "～てもらう",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "もらう",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "いただく",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          baseForm: "頂く",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "もらう",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "頂き",
        },
      ],
    ],
    tests: ["友だちに紹介してもらった。", "案内して頂きました。"],
  },
  {
    id: "ru-tokoro",
    title: "～（る）ところだ",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "ところ",
        },
      ],
    ],
    tests: [
      "これから出かけるところだ。",
      "今寝るところです。",
      "これから仕事に行くところだ。",
    ],
  },
  {
    id: "ni-tsuite",
    title: "～について",
    patterns: [
      [
        {
          surface: "に",
        },
        {
          surface: "つい",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          surface: "に",
        },
        {
          surface: "つき",
        },
        {
          surface: "まし",
        },
      ],
    ],
    tests: [
      "この件について話し合う。",
      "将来について考える。",
      "詳しい内容につきましては添付画像をご確認ください。",
    ],
  },
  {
    id: "ni-totte",
    title: "～にとって",
    patterns: [
      [
        {
          surface: "に",
        },
        {
          surface: "とっ",
        },
        {
          surface: "て",
        },
      ],
    ],
    tests: ["私にとって重要だ。"],
  },
  {
    id: "no-uchi",
    title: "～のうち",
    patterns: [
      [
        {
          surface: "の",
        },
        {
          baseForm: "うち",
        },
      ],
      [
        {
          surface: "の",
        },
        {
          baseForm: "内",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          baseForm: "うち",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          baseForm: "うち",
        },
      ],
    ],
    tests: [
      "３つのうち１つを選ぶ。",
      "若いうちに旅をする。",
      "買い物で２つの内どっち買うかで迷ったら、両方買うようにしている。",
    ],
  },
  {
    id: "node",
    title: "～ので",
    patterns: [
      [
        {
          surface: "ので",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "んで",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "の",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          surface: "ん",
        },
        {
          surface: "で",
        },
      ],
    ],
    tests: ["頭が痛いので寝ます。", "分からないんで教えて。"],
  },
  {
    id: "no-desu",
    title: "～のです／んです",
    patterns: [
      [
        {
          surface: "の",
        },
        {
          baseForm: "です",
        },
      ],
      [
        {
          surface: "ん",
        },
        {
          baseForm: "です",
        },
      ],
      [
        {
          surface: "ん",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          surface: "の",
        },
        {
          baseForm: "だ",
        },
      ],
    ],
    tests: [
      "明日行くのです。",
      "大好きなんです。",
      "あいつ、絶対許さないんだから。",
      "満員電車は嫌いですが、会社に行くためには毎日乗らないといけないのです。",
    ],
  },
  {
    id: "no-tokoro",
    title: "～のところ",
    patterns: [
      [
        {
          surface: "の",
        },
        {
          surface: "ところ",
        },
      ],
    ],
    tests: ["今のところ変化はない。", "現在のところ不明だ。"],
  },
  {
    id: "bakari",
    title: "～ばかり",
    patterns: [
      [
        {
          surface: "ばかり",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "雨ばかり降っている。",
      "嘘ばかりつく。",
      "ここは良いものばかりで目移りする。",
    ],
  },
  {
    id: "demo",
    title: "～でも",
    patterns: [
      [
        {
          surface: "で",
          pos: "助詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
    ],
    tests: ["仕事は忙しいですでも、楽しいです"],
  },
  {
    id: "dake",
    title: "～だけ",
    patterns: [
      [
        {
          surface: "だけ",
          pos: "助詞",
        },
      ],
    ],
    tests: ["ここのパソコンは学生だけが使えます。"],
  },
  {
    id: "to-omou",
    title: "～うと思う",
    patterns: [
      [
        {
          surface: "と",
        },
        {
          baseForm: "思う",
        },
      ],
    ],
    tests: ["明日は雨がふると思います。"],
  },

  {
    id: "hazu-da",
    title: "～はずだ",
    patterns: [
      [
        {
          baseForm: "はず",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          baseForm: "はず",
        },
        {
          baseForm: "です",
        },
      ],
    ],
    tests: [
      "彼は来るはずだ。",
      "寒いはずだ。",
      "小学校の頃にサッカーやっていたので、リフティングは今でもできるはずです。",
    ],
  },
  {
    id: "betsu-ni-nai",
    title: "別に～ない",
    patterns: [
      [
        {
          baseForm: "別に",
          pos: "副詞",
        },
      ],
      [
        {
          surface: "別",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "別にいいよ。",
      "別に嫌いではない。",
      "酒は好きですけど別に強くはないです。",
    ],
  },
  {
    id: "hodo",
    title: "～ほど",
    patterns: [
      [
        {
          surface: "ほど",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "死ぬほど好き。",
      "３時間ほど待った。",
      "今年の冬は去年の冬ほど寒くはない。",
    ],
  },
  {
    id: "made-ni",
    title: "～までに",
    patterns: [
      [
        {
          surface: "まで",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "明日までに終わらせる。",
      "５時までに来る。",
      "夏までに５kg痩せたい。",
    ],
  },
  {
    id: "mama",
    title: "～まま",
    patterns: [
      [
        {
          baseForm: "まま",
          pos: "名詞",
        },
      ],
    ],
    tests: ["このままではいけない。", "服を着たまま寝る。"],
  },
  {
    id: "mitai",
    title: "～みたい",
    patterns: [
      [
        {
          baseForm: "みたい",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "みたい",
        },
        {
          surface: "な",
        },
      ],
      [
        {
          surface: "みたい",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          baseForm: "みたい",
          pos: "形状詞",
        },
      ],
    ],
    tests: [
      "夢みたいだ。",
      "子供みたいに泣く。",
      "葬式みたいな話は聞きたくない。",
      "彼女は太陽みたいな人だ。",
    ],
  },
  {
    id: "morau",
    title: "～もらう",
    patterns: [
      [
        {
          baseForm: "もらう",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "いただく",
          pos: "動詞",
        },
      ],
      [
        {
          baseForm: "頂く",
          pos: "動詞",
        },
      ],
      [
        {
          surface: "もらっ",
        },
      ],
      [
        {
          surface: "頂い",
        },
      ],
    ],
    tests: [
      "プレゼントをもらった。",
      "内定を頂いた。",
      "ガイドさんにお城の案内をして頂きました。",
    ],
  },
  {
    id: "you-da",
    title: "～ようだ",
    patterns: [
      [
        {
          baseForm: "よう",
          pos: "助動詞",
        },
        {
          baseForm: "だ",
        },
      ],
      [
        {
          surface: "よう",
        },
        {
          surface: "な",
        },
      ],
      [
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          baseForm: "よう",
          pos: "形状詞",
        },
      ],
    ],
    tests: [
      "雨のようだ。",
      "魔法のように消えた。",
      "まるでサウナの中にいるような天気だ。",
    ],
  },
  {
    id: "you-to-omou",
    title: "～ようと思う",
    patterns: [
      [
        {
          surface: "う",
        },
        {
          surface: "と",
        },
        {
          baseForm: "思う",
        },
      ],
      [
        {
          surface: "よう",
        },
        {
          surface: "と",
        },
        {
          baseForm: "思う",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "意志推量形",
        },
        {
          surface: "と",
        },
        {
          baseForm: "思う",
        },
      ],
    ],
    tests: ["行こうと思う。", "始めようと思っている。"],
  },
  {
    id: "you-ni-suru",
    title: "～ようにする",
    patterns: [
      [
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "する",
        },
      ],
    ],
    tests: ["遅れないようにする。", "メモするようにしている。"],
  },
  {
    id: "you-ni-naru",
    title: "～ようになる",
    patterns: [
      [
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "なる",
        },
      ],
    ],
    tests: ["泳げるようになった。", "分かるようになった。"],
  },
  {
    id: "rashii",
    title: "～らしい",
    patterns: [
      [
        {
          baseForm: "らしい",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "らしく",
        },
      ],
    ],
    tests: ["雨らしい。", "男らしい。", "子供は子供らしく遊べばいい。"],
  },
  {
    id: "reru-rareru",
    title: "～れる／られる",
    patterns: [
      [
        {
          baseForm: "れる",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "られる",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "れ",
        },
      ],
      [
        {
          surface: "られ",
        },
      ],
    ],
    tests: ["先生に叱られた。", "食べられる（可能）。", "食べられる（受身）。"],
  },
  {
    id: "te-kara",
    title: "～てから",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          surface: "から",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          surface: "から",
        },
      ],
    ],
    tests: [
      "ご飯を食べてから行く。",
      "薬を飲んでから寝る。",
      "よく考えてから返事をする。",
    ],
  },
  {
    id: "te-kudasai",
    title: "～てください",
    patterns: [
      [
        {
          surface: "て",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "ちょうだい",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "ちょうだい",
        },
      ],
      [
        {
          surface: "て",
        },
        {
          surface: "くれ",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "くれ",
        },
      ],
      [
        {
          baseForm: "ない",
        },
        {
          surface: "で",
        },
        {
          baseForm: "くださる",
        },
      ],
      [
        {
          baseForm: "ない",
        },
        {
          surface: "で",
        },
        {
          surface: "ちょうだい",
        },
      ],
    ],
    tests: [
      "名前を書いてください。",
      // "大盛りでお願いします。",
      "入らないでください。",
      "教えてちょうだい。",
    ],
  },
  {
    id: "nakutemo-ii",
    title: "～なくてもいい／なくても構わない／ずともよい",
    patterns: [
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "いい",
        },
      ],
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "よい",
        },
      ],
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "かまう",
        },
      ],
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
        },
        {
          baseForm: "構う",
        },
      ],
      // Handle split 'to' + 'mo'
      [
        {
          baseForm: "ず",
        },
        {
          surface: "と",
        },
        {
          surface: "も",
        },
        {
          baseForm: "よい",
        },
      ],
      // Handle combined 'tomo' (as seen in your error log)
      [
        {
          baseForm: "ず",
        },
        {
          surface: "とも",
        },
        {
          baseForm: "よい",
        },
      ],
      [
        {
          baseForm: "ず",
        },
        {
          surface: "とも",
        },
        {
          baseForm: "いい",
        },
      ],
    ],
    tests: [
      "無理しなくてもいい。",
      "明日来なくてもいいです。",
      "名前を書かなくても構いません。",
      "行かずともよい。",
    ],
  },
  {
    id: "nasai",
    title: "～なさい",
    patterns: [
      [
        {
          baseForm: "なさい",
        },
      ],
      [
        {
          baseForm: "なさる",
          conjugation: "命令形",
        },
      ],
    ],
    tests: ["早く起きなさい。", "野菜も食べなさい。"],
  },
  {
    id: "ni-taishite",
    title: "～に対して",
    patterns: [
      [
        {
          surface: "に",
        },
        {
          baseForm: "対する",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          surface: "に",
        },
        {
          surface: "対し",
        },
        {
          surface: "て",
        },
      ],
    ],
    tests: ["目上の人に対して敬語を使う。", "質問に対して答える。"],
  },
  {
    id: "wa-ga",
    title: "～は～が",
    patterns: [
      [
        {
          surface: "は",
          pos: "助詞",
        },
        {
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "は",
          pos: "助詞",
        },
        {
          pos: "代名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
    ],
    tests: ["私は背が高い。", "象は鼻が長い。", "北海道は冬が寒い。"],
  },
  {
    id: "yasui",
    title: "～やすい",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "やすい",
        },
      ],
    ],
    tests: ["このペンは書きやすい。", "分かりやすい説明だ。"],
  },
  {
    id: "nikui",
    title: "～にくい",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "にくい",
        },
      ],
    ],
    tests: ["この肉は食べにくい。", "歩きにくい靴。"],
  },
  {
    id: "deshou",
    title: "～でしょう",
    patterns: [
      [
        {
          surface: "でしょう",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "明日は雨でしょう。",
      "美味しいでしょう？",
      "彼はすぐ来るでしょう。",
      "この料理は有名でしょう。",
      "きれいでしょう。",
    ],
  },
  {
    id: "darou",
    title: "～だろう",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "だろう",
          pos: "助動詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "だろう",
          pos: "助動詞",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "終止形",
        },
        {
          surface: "だろう",
          pos: "助動詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "だろう",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "明日は雨が降るだろう。",
      "これはうそだろう。",
      "明日は寒いだろう。",
      "彼は元気だろう。",
      "田中さんは来るだろう。",
    ],
  },
  {
    id: "he-iku",
    title: "～へいく",
    patterns: [
      [
        {
          surface: "へ",
          pos: "助詞",
        },
        {
          baseForm: "行く",
          pos: "動詞",
        },
      ],
      [
        {
          surface: "へ",
          pos: "助詞",
        },
        {
          baseForm: "いく",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "東京へ行く。",
      "学校へいきます。",
      "あちらへ行ってください。",
      "どこへ行ったのですか。",
    ],
  },
  {
    id: "ni-iku",
    title: "～に行く",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "行く",
        },
      ],
    ],
    tests: [
      "スーパーへ買い物に行きます。",
      "映画を見に行く。",
      "日本へ遊びに行った。",
      "公園へ走りに行こう。",
      "昼ご飯を食べに行きました。",
    ],
  },
  {
    id: "no-ga-suki",
    title: "～のが好き",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "好き",
        },
      ],
    ],
    tests: [
      "本を読むのが好きです。",
      "泳ぐのが好きだ。",
      "料理を作るのが好きです。",
      "走るのが好きじゃない。",
    ],
  },
  {
    id: "kedo-dakedo",
    title: "～けど・だけど",
    patterns: [
      [
        {
          surface: "けど",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "だけど",
          pos: "接続詞",
        },
      ],
      [
        {
          surface: "だ",
          pos: "助動詞",
        },
        {
          surface: "けど",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "明日は休みだけど、仕事があります。",
      "この本は高いけど、面白いです。",
      "勉強したけど、わかりませんでした。",
      "静かだけど、不便な場所です。",
      "だけど、行きたくないです。",
      "行きたいですけど、お金がありません。",
    ],
  },
  {
    id: "ja-nai",
    title: "～じゃない",
    patterns: [
      [
        {
          surface: "じゃ",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "これは私の本じゃない。",
      "彼は学生じゃない。",
      "その町はにぎやかじゃない。",
      "今日は休みじゃないです。",
    ],
  },
  {
    id: "ja-nakatta",
    title: "～じゃなかった",
    patterns: [
      [
        {
          surface: "じゃ",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          baseForm: "た",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "昨日は雨じゃなかった。",
      "彼は学生じゃなかった。",
      "その試験は簡単じゃなかった。",
      "そこは静かじゃなかった。",
      "あれは私の本じゃなかった。",
    ],
  },
  {
    id: "i-adjective-kunakatta",
    title: "～くなかった",
    patterns: [
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          baseForm: "ない",
          surface: "なかっ",
        },
        {
          baseForm: "た",
          surface: "た",
        },
      ],
    ],
    tests: [
      "昨日は寒くなかったです。",
      "このテストは難しくなかった。",
      "あまりおいしくなかった。",
      "先週は忙しくなかった。",
      "良くなかった。",
    ],
  },
  {
    id: "mada-te-imasen",
    title: "まだ～ていません",
    patterns: [
      [
        {
          surface: "まだ",
          pos: "副詞",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          baseForm: "いる",
          pos: "動詞",
        },
        {
          surface: "ませ",
          pos: "助動詞",
        },
        {
          surface: "ん",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "まだ",
          pos: "副詞",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "で",
        },
        {
          baseForm: "いる",
          pos: "動詞",
        },
        {
          surface: "ませ",
          pos: "助動詞",
        },
        {
          surface: "ん",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "まだ食べていません",
      "まだ寝ていません",
      "私はまだ本を読んでいません",
      "宿題はまだ終わっていません",
      "バスはまだ来ていません",
    ],
  },
  {
    id: "tari-tari-suru",
    title: "～たり～たりする",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "たり",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "だり",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "たり",
        },
      ],
      [
        {
          surface: "たり",
        },
        {
          baseForm: "する",
        },
      ],
      [
        {
          surface: "だり",
        },
        {
          baseForm: "する",
        },
      ],
    ],
    tests: [
      "昨日は本を読んだり、テレビを見たりしました。",
      "休みの日は掃除をしたり、洗濯をしたりします。",
      "映画を見たり、買い物をしたりしました。",
      "この部屋は、寒かったり暑かったりします。",
      "週末はピアノを弾いたりします。",
    ],
  },
  {
    id: "kekkou",
    title: "けっこう",
    patterns: [
      [
        {
          baseForm: "結構",
        },
      ],
      [
        {
          surface: "けっこう",
        },
      ],
    ],
    tests: [
      "この料理はけっこう美味しいです。",
      "今日はけっこう寒いですね。",
      "いいえ、けっこうです。",
      "それで結構です。",
      "結構な贈り物ですね。",
    ],
  },
  {
    id: "takusan",
    title: "たくさん",
    patterns: [
      [
        {
          baseForm: "たくさん",
        },
      ],
    ],
    tests: [
      "お菓子をたくさん食べました。",
      "昨日はたくさん寝ました。",
      "公園にたくさんの人がいます。",
      "時間はたくさんあります。",
      "日本には有名な神社がたくさんある。",
    ],
  },
  {
    id: "made",
    title: "まで",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "まで",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "代名詞",
        },
        {
          surface: "まで",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "まで",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "５時までここにいます。",
      "東京駅から上野駅まで行きます。",
      "昼休みが終わるまで本を読みました。",
      "そこまで歩いて何分かかりますか。",
    ],
  },
  {
    id: "ichiban",
    title: "いちばん",
    patterns: [
      [
        {
          surface: "いちばん",
        },
      ],
      [
        {
          surface: "一番",
        },
      ],
    ],
    tests: [
      "クラスの中でいちばん背が高いです。",
      "これが一番おいしいリンゴです。",
      "スポーツの中で何が一番好きですか。",
      "いちばん近い駅はどこですか。",
      "一年で一月がいちばん寒いです。",
    ],
  },
  {
    id: "hou-ga",
    title: "～ほうが",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          surface: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "毎日運動したほうがいいです。",
      "このリンゴより、あちらのほうが甘いです。",
      "安いほうが嬉しいです。",
      "静かなほうが勉強できます。",
      "電車よりバスのほうが安いです。",
    ],
  },
  {
    id: "nanika-nanimo",
    title: "なにか・なにも",
    patterns: [
      [
        {
          baseForm: "何",
          pos: "代名詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "何",
          pos: "代名詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "カバンの中になにかありますか。",
      "何か冷たいものが飲みたいです。",
      "冷蔵庫には何もありません。",
      "昨日は忙しくて、なにも食べませんでした。",
      "部屋に誰かいますか？いいえ、なにもいません。",
    ],
  },
  {
    id: "dareka-dokoka-daremo-dokomo",
    title: "誰か・どこか・誰も・どこも",
    patterns: [
      [
        {
          baseForm: "誰",
          pos: "代名詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "どこ",
          pos: "代名詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "誰",
          pos: "代名詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "どこ",
          pos: "代名詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "外に誰かいます。",
      "休みの日はどこかへ行きたいです。",
      "部屋には誰もいませんでした。",
      "今日はどこも行きません。",
    ],
  },
  {
    id: "nakute-wa-ikenai",
    title: "～なくてはいけない",
    patterns: [
      [
        {
          surface: "なく",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          surface: "は",
          pos: "助詞",
        },
        {
          baseForm: "いけない",
        },
      ],
      [
        {
          surface: "なく",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          surface: "は",
          pos: "助詞",
        },
        {
          baseForm: "いける",
        },
      ],
      [
        {
          surface: "なく",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          surface: "は",
          pos: "助詞",
        },
        {
          surface: "いけ",
        },
        {
          surface: "ません",
        },
      ],
    ],
    tests: [
      "毎日、日本語を勉強しなくてはいけない。",
      "そろそろ家に帰らなくてはいけません。",
      "明日は早く起きなくてはいけない。",
      "部屋は静かでなくてはいけない。",
      "寒くなくてはいけない。",
      "靴を履かなくてはいけない。",
    ],
  },
  {
    id: "nakute-wa-naranai",
    title: "～なくてはならない",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なく",
        },
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          surface: "なく",
        },
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          surface: "なく",
        },
        {
          surface: "て",
        },
        {
          surface: "は",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
    ],
    tests: [
      "毎日漢字を練習しなくてはならない。",
      "明日、七時に起きなくてはならない。",
      "健康のために野菜をたべなくてはならない。",
      "これは秘密だから、静かでなくてはならない。",
      "キャプテンは彼でなくてはならない。",
    ],
  },
  {
    id: "ta-hou-ga-ii",
    title: "～たほうがいい",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "た",
          pos: "助動詞",
        },
        {
          baseForm: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "だ",
          pos: "助動詞",
        },
        {
          baseForm: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          baseForm: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
    ],
    tests: [
      "もっと野菜を食べたほうがいいですよ。",
      "今日は早く休んだほうがいい。",
      "あまり無理をしないほうがいいです。",
      "そんなに急がないほうがいいよ。",
    ],
  },
  {
    id: "nai-hou-ga-ii",
    title: "～ないほうがいい",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "ない",
          pos: "助動詞",
        },
        {
          surface: "ほう",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "いい",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "ない",
          pos: "助動詞",
        },
        {
          surface: "方",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "いい",
        },
      ],
    ],
    tests: [
      "お酒を飲まないほうがいい",
      "夜遅くに一人で歩かないほうがいいですよ",
      "甘いものをたくさん食べないほうがいい",
      "今は外に出ない方がいい",
      "あまり無理をしないほうがいいです",
    ],
  },
  {
    id: "nakucha-nakya",
    title: "～なくちゃ・～なきゃ",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なきゃ",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なくちゃ",
        },
      ],
    ],
    tests: [
      "もう帰らなきゃ。",
      "そろそろ準備しなくちゃ。",
      "毎日勉強しなきゃいけません。",
      "もっとたくさん食べなくちゃ。",
    ],
  },
  {
    id: "ta-koto-ga-aru",
    title: "～たことがある",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "た",
          pos: "助動詞",
        },
        {
          baseForm: "こと",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ある",
          pos: "動詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "だ",
          pos: "助動詞",
        },
        {
          baseForm: "こと",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ある",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "日本へ行ったことがある",
      "寿司を食べたことがあります",
      "富士山に登ったことがある",
      "その本は読んだことがあります",
    ],
  },
  {
    id: "adjective-te-conjunctive",
    title: "～くて／～で",
    patterns: [
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
      ],
    ],
    tests: [
      "この林檎は赤くて甘いです。",
      "昨日は寒くて外に出ませんでした。",
      "あの店は安くて美味しいです。",
      "ここは静かでいい公園ですね。",
      "この辞書は不便で古いです。",
      "彼は親切でハンサムです。",
    ],
  },
  {
    id: "no-ga-heta",
    title: "～のが下手（へた）",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "下手",
          pos: "形状詞",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "へた",
          pos: "形状詞",
        },
      ],
    ],
    tests: [
      "私は歌を歌うのが下手です。",
      "彼は料理を作るのがへたです。",
      "泳ぐのが下手な人はここに来てください。",
      "日本語を話すのがへたでした。",
    ],
  },
  {
    id: "no-ga-jouzu",
    title: "～のが上手（じょうず）",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "上手",
        },
      ],
    ],
    tests: [
      "彼は料理を作るのが上手です。",
      "泳ぐのがじょうずですね。",
      "母は歌を歌うのがとても上手だ。",
      "日本語を話すのが上手になりたい。",
    ],
  },
  {
    id: "no-the-one",
    title: "～の（は）",
    patterns: [
      [
        {
          pos: "形容詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          surface: "の",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "青いのが好きです。",
      "昨日買ったのはこれです。",
      "静かなのがいいです。",
      "それは私のです。",
      "大きいのはいくらですか。",
    ],
  },
  {
    id: "keredomo",
    title: "～けれども／～けれど／～けど",
    patterns: [
      [
        {
          surface: "けれども",
        },
      ],
      [
        {
          surface: "けれど",
        },
      ],
      [
        {
          surface: "けど",
        },
      ],
    ],
    tests: [
      "雨が降っていますけれども、学校へ行きます。",
      "昨日は寒かったけれど、今日は暖かいです。",
      "一生懸命走ったけれど、電車に間に合いませんでした。",
      "その鞄は高いけど、とても綺麗だ。",
      "けれども、私の名前は書きませんでした。",
    ],
  },
  {
    id: "dandan",
    title: "だんだん",
    patterns: [
      [
        {
          baseForm: "だんだん",
          pos: "副詞",
        },
      ],
      [
        {
          baseForm: "段々",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "だんだん暖かくなってきました。",
      "日本語がだんだん上手になりました。",
      "だんだん分かってきた。",
      "空が段々暗くなる。",
      "だんだん暑くなりますね。",
    ],
  },
  {
    id: "dondon",
    title: "どんどん",
    patterns: [
      [
        {
          surface: "どんどん",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "日本語がどんどん上手になります。",
      "遠慮しないでどんどん食べてください。",
      "技術がどんどん進歩している。",
      "新しい店がどんどんできている。",
      "雨がどんどん強くなってきた。",
    ],
  },
  {
    id: "dakede",
    title: "～だけで",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          pos: "代名詞",
        },
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
      ],
    ],
    tests: [
      "君の顔を見るだけで幸せだ。",
      "箸だけでご飯を食べるのは難しい。",
      "それだけで十分ですよ。",
      "大きいだけで、このバッグは重すぎる。",
      "便利なだけで、あまり可愛くない。",
    ],
  },
  {
    id: "daga-desuga",
    title: "だが・ですが",
    patterns: [
      [
        {
          surface: "だが",
          pos: "接続詞",
        },
      ],
      [
        {
          surface: "ですが",
          pos: "接続詞",
        },
      ],
      [
        {
          baseForm: "だ",
          pos: "助動詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "です",
          pos: "助動詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "彼は一生懸命勉強した。だが、不合格だった。",
      "昨日は雨でした。ですが、買い物に行きました。",
      "ここは静かですが、少し不便です。",
      "いい天気だ。だが、風が強い。",
      "それは便利ですが、高いです。",
      "頑張りました。ですが、ダメでした。",
    ],
  },
  {
    id: "nakute",
    title: "～なくて",
    patterns: [
      [
        {
          baseForm: "ない",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "なくて",
        },
      ],
    ],
    tests: [
      "お金がなくて、何も買えません。",
      "この料理は辛くなくて、美味しいです。",
      "昨日は日曜日じゃなくて、土曜日でした。",
      "朝ご飯を食べなくて、お腹が空きました。",
      "このカバンは重くなくて、持ち運びが楽だ。",
      "傘を待っていかなくて、濡れてしまった。",
    ],
  },
  {
    id: "naosu-redo",
    title: "～直す（～なおす）",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "直す",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "なおす",
        },
      ],
    ],
    tests: [
      "間違いがあったので、作文を書き直しました。",
      "計画をもう一度考え直してください。",
      "テストの答えをもう一度見直してください。",
      "最初からやり直すことにした。",
      "もう一度メールを読み直してみます。",
      "壊れたところを作り直した。",
    ],
  },
  {
    id: "to-iu-koto",
    title: "～ということ",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いう",
          pos: "動詞",
        },
        {
          surface: "こと",
          pos: "名詞",
        },
      ],
    ],
    tests: [
      "日本語を勉強するということは楽しいです。",
      "彼が独身だということを知っていますか。",
      "試験に合格したということが信じられません。",
      "美味しいということが一番大切だ。",
      "明日は休みだということを忘れていました。",
    ],
  },
  {
    id: "hajimeru",
    title: "～はじめる",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "始める",
        },
      ],
    ],
    tests: [
      "急に雨が降り始めました。",
      "10分前からご飯を食べはじめる。",
      "昨日、やっとこの本を読み始めた。",
      "赤ちゃんが泣き始めると大変です。",
      "いつからピアノを習い始めましたか。",
    ],
  },
  {
    id: "owaru-finish",
    title: "～終わる",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "終わる",
        },
      ],
    ],
    tests: [
      "この本を読み終わったら貸してください。",
      "昨日、やっとレポートを書き終わりました。",
      "昼ご飯を食べ終わるまで待ってください。",
      "そのドラマを全部見終わった。",
      "宿題をやり終わってから遊びに行きます。",
    ],
  },
  {
    id: "tou-tou",
    title: "とうとう",
    patterns: [
      [
        {
          baseForm: "とうとう",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "とうとう夏休みが終わってしまった。",
      "三年間勉強して、とうとう試験に合格した。",
      "雨が降り続いて、とうとう川が溢れた。",
      "一晩中待ったが、彼はとうとう来なかった。",
      "苦労したが、とうとう夢を叶えることができた。",
    ],
  },
  {
    id: "goto-ni",
    title: "～ごとに",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "ごとに",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "毎に",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "ごとに",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "毎に",
        },
      ],
    ],
    tests: [
      "バス停ごとに止まります。",
      "五分ごとに電車が来ます。",
      "会うごとに彼女は綺麗になる。",
      "一週間毎にレポートを出します。",
      "リンゴを三つごとに袋に入れた。",
    ],
  },
  {
    id: "narubeku",
    title: "なるべく",
    patterns: [
      [
        {
          surface: "なるべく",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "なるべく早く来てください",
      "なるべく毎日勉強します",
      "なるべく野菜を食べるようにしています",
      "明日はなるべく大きな声で話してください",
    ],
  },
  {
    id: "toka-toka",
    title: "～とか～とか",
    patterns: [
      [
        {
          surface: "とか",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "休日は、本を読めとかテレビを見るとかしています。",
      "テニスとか水泳とかのスポーツが好きです。",
      "パンとかお菓子とかを買いました。",
      "行くとか行かないとか、早く決めてください。",
      "カバンの中に、財布とか鍵とかが入っています。",
    ],
  },
  {
    id: "sou-iu",
    title: "そういう",
    patterns: [
      [
        {
          surface: "そういう",
        },
      ],
      [
        {
          surface: "そう",
        },
        {
          baseForm: "いう",
        },
      ],
    ],
    tests: [
      "そういう意味ではありません。",
      "そういう人が好きです。",
      "そういうことは言わないでください。",
      "あ、そういうことですね。",
      "どうしてそういう事をするんですか？",
    ],
  },
  {
    id: "amari-nai",
    title: "あまり～ない",
    patterns: [
      [
        {
          baseForm: "あまり",
          pos: "副詞",
        },
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "あまり",
          pos: "副詞",
        },
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "あまり",
          pos: "副詞",
        },
        {
          pos: "形状詞",
        },
        {
          surface: "では",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "あまり",
          pos: "副詞",
        },
        {
          pos: "形状詞",
        },
        {
          surface: "じゃ",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
      ],
      [
        {
          baseForm: "あまり",
          pos: "副詞",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "ませ",
          pos: "助動詞",
        },
        {
          surface: "ん",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "今日はあまり寒くないです。",
      "お酒はあまり飲まない。",
      "この店はあまり有名ではない。",
      "昨日はあまり忙しくなかったです。",
      "日本語があまり上手じゃありません。",
      "普段はあまりテレビを見ません。",
    ],
  },
  {
    id: "to-ii",
    title: "～といい",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "終止形",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
      [
        {
          pos: "助動詞",
          conjugation: "終止形",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
    ],
    tests: [
      "明日晴れるといいですね。",
      "試験が簡単だといいなあ。",
      "忘れ物がないといいが。",
      "もっと安いといいのに。",
      "病気が早く治るといい。",
    ],
  },
  {
    id: "janai-ka",
    title: "～じゃないか",
    patterns: [
      [
        {
          surface: "じゃ",
        },
        {
          surface: "ない",
        },
        {
          surface: "か",
        },
      ],
      [
        {
          surface: "で",
        },
        {
          surface: "は",
        },
        {
          surface: "ない",
        },
        {
          surface: "か",
        },
      ],
    ],
    tests: [
      "ほら、雨が降っているじゃないか。",
      "そんなの、嘘じゃないか。",
      "これでいいじゃないか。",
      "この計画は素晴らしいではないか。",
    ],
  },
  {
    id: "te-hoshii",
    title: "～てほしい",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "ほしい",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "ほしい",
        },
      ],
    ],
    tests: [
      "お父さんにタバコをやめてほしいです。",
      "先生にこの本を読んでほしい。",
      "あなたにずっとここにいてほしい。",
      "彼女に本当のことを話してほしい。",
    ],
  },
  {
    id: "to-kiita",
    title: "～と聞いた",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "聞く",
          pos: "動詞",
        },
        {
          baseForm: "た",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "聞く",
          pos: "動詞",
        },
        {
          baseForm: "ます",
          pos: "助動詞",
        },
        {
          baseForm: "た",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "明日は雨が降ると聞いた。",
      "田中さんは結婚したと聞いた。",
      "その料理は美味しいと聞いた。",
      "あのお店は有名だと聞きました。",
      "昨日の試験は簡単だったと聞きました。",
      "彼はもう日本に来ないと聞いた。",
    ],
  },
  {
    id: "kikoeru",
    title: "聞こえる",
    patterns: [
      [
        {
          baseForm: "聞こえる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "隣の部屋から声が聞こえる。",
      "テレビの音がよく聞こえますか。",
      "波の音が聞こえてきます。",
      "外がうるさくて、何も聞こえない。",
      "どこからか音楽が聞こえてきた。",
    ],
  },
  {
    id: "mieru",
    title: "～見える",
    patterns: [
      [
        {
          baseForm: "見える",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "遠くに山が見える。",
      "今日は富士山が見えません。",
      "ここから青い海が見えました。",
      "窓から綺麗な景色が見えます。",
      "電気がついているので、中がよく見える。",
    ],
  },
  {
    id: "hotondo",
    title: "ほとんど",
    patterns: [
      [
        {
          baseForm: "ほとんど",
        },
      ],
    ],
    tests: [
      "宿題はほとんど終わりました。",
      "ほとんどの人がそのニュースを知っています。",
      "最近、忙しくてほとんど寝ていません。",
      "雨が降っていたので、客がほとんど来なかった。",
      "彼はほとんど毎日公園で走っています。",
    ],
  },
  {
    id: "igai",
    title: "～以外",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          baseForm: "以外",
        },
      ],
      [
        {
          pos: "代名詞",
        },
        {
          baseForm: "以外",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          baseForm: "以外",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "いがい",
        },
      ],
    ],
    tests: [
      "日曜日以外は休みです。",
      "私以外に誰もいなかった。",
      "食べる以外にすることはない。",
      "これ以外に何かありますか？",
      "それいがい、いいかんがえがない。",
    ],
  },
  {
    id: "zutto",
    title: "ずっと",
    patterns: [
      [
        {
          baseForm: "ずっと",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "昨日からずっと雨が降っています。",
      "彼女のほうがずっと背が高いです。",
      "日本に来てから、ずっと東京に住んでいます。",
      "駅はもっとずっと先にあります。",
      "さっきからずっとあなたのことを考えていました。",
    ],
  },
  {
    id: "daitai",
    title: "だいたい",
    patterns: [
      [
        {
          surface: "だいたい",
        },
      ],
      [
        {
          surface: "大体",
        },
      ],
    ],
    tests: [
      "だいたい分かりました。",
      "宿題はだいたい終わりました。",
      "駅から家まで大体１０分です。",
      "ここにある本は、だいたい読みました。",
    ],
  },
  {
    id: "no-naka-de",
    title: "～の中で",
    patterns: [
      [
        {
          surface: "の",
          pos: "助詞",
        },
        {
          baseForm: "中",
          pos: "名詞",
        },
        {
          surface: "で",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "果物の中で、りんごが一番好きです。",
      "この三つの中でどれが一番いいですか。",
      "一年の中でいつが一番寒いですか。",
      "家族の中で、父が一番料理が上手です。",
      "日本のアニメの中で、これが有名です。",
    ],
  },
  {
    id: "you-ni-simile",
    title: "～ように (As, Like)",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
        },
        {
          baseForm: "よう",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
        },
        {
          surface: "ように",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          baseForm: "よう",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "ように",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          baseForm: "よう",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          baseForm: "よう",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "彼は猫のように静かに歩く。",
      "私が今から言うように書いてください。",
      "それはまるで夢のように美しかった。",
      "あの人がしているようにやってみて。",
    ],
  },
  {
    id: "shika-nai",
    title: "～しか～ない",
    patterns: [
      [
        {
          surface: "しか",
          pos: "助詞",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "しか",
          pos: "助詞",
        },
        {
          conjugation: "未然形",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "しか",
          pos: "助詞",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "ます",
        },
        {
          surface: "ん",
        },
      ],
      [
        {
          surface: "しか",
          pos: "助詞",
        },
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          conjugation: "未然形",
        },
        {
          baseForm: "ない",
        },
      ],
    ],
    tests: [
      "これしかない。",
      "平仮名しか書けません。",
      "私はお茶しか飲まない。",
      "百円しか持っていない。",
      "あそこには子供しかいなかった。",
    ],
  },
  {
    id: "no-hitotsu-da",
    title: "～の一つだ",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "一つ",
          pos: "名詞",
        },
        {
          baseForm: "だ",
          pos: "助動詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "ひとつ",
          pos: "名詞",
        },
        {
          baseForm: "だ",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "これは日本で最も有名な観光地の一つです。",
      "富士山は日本の象徴の一つだ。",
      "この作品は、彼が書いた物語の一つだ。",
      "環境問題は私たちが直面している大きな課題の一つです。",
    ],
  },
  {
    id: "nai-wa-nai",
    title: "～ない～はない",
    patterns: [
      [
        {
          pos: "助動詞",
          surface: "ない",
        },
        {
          pos: "名詞",
        },
        {
          surface: "は",
          pos: "助詞",
        },
        {
          baseForm: "ない",
          pos: "形容詞",
        },
      ],
      [
        {
          pos: "形容詞",
          surfaceEndsWith: "ない",
        },
        {
          pos: "名詞",
        },
        {
          surface: "は",
          pos: "助詞",
        },
        {
          baseForm: "ない",
          pos: "形容詞",
        },
      ],
    ],
    tests: [
      "できないことはない。",
      "分からない問題はない。",
      "買えないものはない。",
      "面白くない本はない。",
    ],
  },
  {
    id: "sukoshi-mo-nai",
    title: "少しも～ない",
    patterns: [
      [
        {
          baseForm: "少し",
          pos: "副詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "すこし",
          pos: "副詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          baseForm: "少し",
          pos: "名詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "少しも怖くないです。",
      "昨日の夜は少しも寝られませんでした。",
      "彼女の言ったことは少しも嘘ではない。",
      "この料理は少しも辛くない。",
      "私は彼のことを少しも知らない。",
      "すこしも分からないので、もう一度説明してください。",
      "部屋は少しも綺麗になっていない。",
    ],
  },
  {
    id: "sukunaku-nai",
    title: "～少なくない",
    patterns: [
      [
        {
          baseForm: "少ない",
          conjugation: "連用形",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          surface: "すくなく",
        },
        {
          baseForm: "ない",
        },
      ],
    ],
    tests: [
      "日本に興味がある外国人は少なくない。",
      "不満を持っている人は少なくないようです。",
      "これまでに失敗した経験は少なくない。",
      "彼が嘘をついた例はすくなくない。",
      "今年は雨の日が少なくなかった。",
    ],
  },
  {
    id: "baai-wa",
    title: "～場合は",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          baseForm: "場合",
        },
        {
          surface: "は",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          baseForm: "場合",
        },
        {
          surface: "は",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          baseForm: "場合",
        },
        {
          surface: "は",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
        },
        {
          baseForm: "場合",
        },
        {
          surface: "は",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "会議に遅れる場合は、連絡してください。",
      "雨が降った場合は、中止します。",
      "都合が悪い場合は、お知らせください。",
      "必要な場合は、コピーを渡します。",
      "火事の場合は、119番をダイヤルしてください。",
      "地震のばあいは、エレベーターを使わないでください。",
    ],
  },
  {
    id: "verb-te-casual-request",
    title: "～て",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "で",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "ちょっと待って。",
      "本を読んで。",
      "これを食べて。",
      "ここに来て。",
      "早く名前を書いて。",
    ],
  },
  {
    id: "te-yokatta",
    title: "～てよかった",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
      [
        {
          baseForm: "ない",
          surface: "なくて",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "くて",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "良い",
          surface: "よかった",
        },
      ],
    ],
    tests: [
      "日本に来てよかった。",
      "傘を持ってきてよかった。",
      "雨が降らなくてよかった。",
      "映画が面白くてよかった。",
      "静かでよかった。",
      "昨日が休みでよかった。",
    ],
  },
  {
    id: "to-itte-mo-ii",
    title: "～といってもいい",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いう",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          surface: "も",
          pos: "助詞",
        },
        {
          baseForm: "いい",
          pos: "形容詞",
        },
      ],
    ],
    tests: [
      "もう夏だといってもいい。",
      "彼はプロだといってもいいだろう。",
      "これは奇跡だといってもいい。",
      "この製品は完璧だといってもいい。",
    ],
  },
  {
    id: "te-mo",
    title: "～ても / ～でも",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "て",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "雨が降っても行きます。",
      "考えても分かりませんでした。",
      "辞書を引いても意味が載っていません。",
      "いくら安くても、そのカバンは買いません。",
      "静かでも集中できません。",
      "土曜日でも働きます。",
      "説明が簡単でも間違いやすいです。",
    ],
  },
  {
    id: "youni-te-hoshii",
    title: "ように～てほしい",
    patterns: [
      [
        {
          surface: "ように",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "ほしい",
          pos: "形容詞",
        },
      ],
      [
        {
          surface: "ように",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "で",
          pos: "助詞",
        },
        {
          baseForm: "ほしい",
          pos: "形容詞",
        },
      ],
    ],
    tests: [
      "忘れないようにしてほしい。",
      "子供がもっと野菜を食べるように工夫してほしい。",
      "彼が試験に合格できるように祈ってほしい。",
      "時間に遅れないように気をつけてほしい。",
    ],
  },
  {
    id: "te-iru-aida-ni",
    title: "～ているあいだに",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "あいだ",
        },
        {
          surface: "に",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "あいだ",
        },
        {
          surface: "に",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "間",
        },
        {
          surface: "に",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "いる",
        },
        {
          surface: "間",
        },
        {
          surface: "に",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "お母さんが寝ているあいだに、家を出ました。",
      "子供が外で遊んでいるあいだに、料理を作りました。",
      "雨が降っている間に、買い物を済ませました。",
      "音楽を聞いているあいだに、いつの間にか寝てしまった。",
    ],
  },
  {
    id: "te-sumimasen",
    title: "～てすみません",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          baseForm: "すみません",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "で",
        },
        {
          baseForm: "すみません",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
        },
        {
          baseForm: "すみません",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "すみません",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "すみません",
        },
      ],
    ],
    tests: [
      "遅れてすみません。",
      "昨日は休んですみません。",
      "返信が遅くなってすみません。",
      "字が汚くてすみません。",
      "説明が下手ですみません。",
      "急な連絡ですみません。",
    ],
  },
  {
    id: "te-kurete-arigatou",
    title: "～てくれてありがとう",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "くれる",
          surface: "くれて",
          pos: "動詞",
        },
        {
          surface: "ありがとう",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
          pos: "助詞",
        },
        {
          baseForm: "くれる",
          surface: "くれて",
          pos: "動詞",
        },
        {
          surface: "ありがとう",
        },
      ],
    ],
    tests: [
      "教えてくれてありがとう",
      "読んでくれてありがとう",
      "手伝ってくれてありがとう",
      "来てくれてありがとう",
      "待っていてくれてありがとう",
    ],
  },
  {
    id: "te-kurenai",
    title: "～てくれない",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "くれる",
          pos: "動詞",
        },
        {
          surface: "ない",
          pos: "助動詞",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "くれる",
          pos: "動詞",
        },
        {
          surface: "ない",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "窓を閉めてくれない？",
      "ちょっと手伝ってくれない？",
      "塩を取ってくれない？",
      "この本を読んでくれない？",
      "あそこに連れて行ってくれない？",
    ],
  },
  {
    id: "no-darou-ka",
    title: "～のだろうか / ～んだろうか",
    patterns: [
      [
        {
          surface: "の",
        },
        {
          baseForm: "だろう",
          pos: "助動詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "ん",
        },
        {
          baseForm: "だろう",
          pos: "助動詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "の",
        },
        {
          surface: "だろ",
        },
        {
          surface: "う",
        },
        {
          surface: "か",
        },
      ],
      [
        {
          surface: "ん",
        },
        {
          surface: "だろ",
        },
        {
          surface: "う",
        },
        {
          surface: "か",
        },
      ],
    ],
    tests: [
      "彼は今どこにいるのだろうか。",
      "明日は雨が降るんだろうか。",
      "どうしてそんなことを言ったのだろうか。",
      "日本料理は彼の口に合うのだろうか。",
      "本当にこれでいいんだろうか。",
    ],
  },
  {
    id: "o-ni-naru",
    title: "お～になる",
    patterns: [
      [
        {
          surface: "お",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "なる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "社長はもうお帰りになりました。",
      "先生、この本をお読みになりますか？",
      "あちらの席でお待ちになりますか？",
      "何をお使いになりますか？",
      "山田先生がこの資料をお作りになった。",
    ],
  },
  {
    id: "nasaru-honorific",
    title: "なさる",
    patterns: [
      [
        {
          baseForm: "なさる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "今日は何をなさいますか？",
      "先生がそのようになさいました。",
      "無理はなさらないでください。",
      "昨日は何をなさったのですか？",
      "どのようなお仕事をなさっていますか？",
      "ご趣味をなさる時間はありますか。",
    ],
  },
  {
    id: "irassharu",
    title: "いらっしゃる",
    patterns: [
      [
        {
          baseForm: "いらっしゃる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "て",
        },
        {
          baseForm: "いらっしゃる",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "で",
        },
        {
          baseForm: "いらっしゃる",
        },
      ],
    ],
    tests: [
      "先生は明日学校にいらっしゃいますか。",
      "どちらへいらっしゃるのですか。",
      "あちらに田中さんがいらっしゃいます。",
      "社長は今、新聞を読んでいらっしゃいます。",
      "先生、昨日どこへいらっしゃいましたか。",
      "ここで何をしていらっしゃるんですか。",
    ],
  },
  {
    id: "gozaimasu",
    title: "～ございます",
    patterns: [
      [
        {
          baseForm: "ござる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "お手洗いはあちらでございます。",
      "何かご不明な点はございますか。",
      "あちらに受付がございます。",
      "おはようございます。",
      "ありがとうございます。",
      "本日はお忙しい中、誠にありがとうございます。",
    ],
  },
  {
    id: "de-gozaimasu",
    title: "～でございます",
    patterns: [
      [
        {
          surface: "で",
          pos: "助詞",
        },
        {
          baseForm: "ございます",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "で",
          pos: "助詞",
        },
        {
          surface: "ござい",
          pos: "助動詞",
        },
        {
          surface: "ます",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "こちらは山田でございます。",
      "あちらがエレベーターでございます。",
      "会議室は二階でございます。",
      "それは非常に不便でございます。",
      "本日はいいお天気でございますね。",
    ],
  },
  {
    id: "o-suru-humble",
    title: "お～する",
    patterns: [
      [
        {
          surface: "お",
        },
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          baseForm: "する",
        },
      ],
      [
        {
          surface: "お",
        },
        {
          pos: "動詞",
          conjugation: "連y用形",
        },
        {
          baseForm: "いたす",
        },
      ],
    ],
    tests: [
      "重そうな荷物をお持ちします。",
      "田中先生を駅までお送りいたしました。",
      "すぐに資料をお持ちいたします。",
      "明日、改めてお電話をおかけします。",
      "この傘をお貸ししましょう。",
    ],
  },
  {
    id: "itasu",
    title: "いたす",
    patterns: [
      [
        {
          baseForm: "いたす",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "よろしくお願いいたします。",
      "昨日は失礼いたしました。",
      "私がお持ちいたします。",
      "明日、改めてご連絡いたします。",
      "喜んでお引き受けいたします。",
    ],
  },
  {
    id: "te-itadakemasen-ka",
    title: "～ていただけませんか",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "いただく",
          pos: "動詞",
        },
        {
          surface: "ませ",
          pos: "助動詞",
        },
        {
          surface: "ん",
          pos: "助動詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "連用形",
        },
        {
          surface: "で",
          pos: "助詞",
        },
        {
          baseForm: "いただく",
          pos: "動詞",
        },
        {
          surface: "ませ",
          pos: "助動詞",
        },
        {
          surface: "ん",
          pos: "助動詞",
        },
        {
          surface: "か",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "窓を閉めていただけませんか？",
      "写真を撮っていただけませんか？",
      "お名前を教えていただけませんか？",
      "塩を取っていただけませんか？",
      "この漢字の読み方を教えていただけませんか？",
      "荷物を運んでいただけませんか？",
      "日本語の辞書を貸していただけませんか？",
    ],
  },
  {
    id: "tara",
    title: "～たら",
    patterns: [
      [
        {
          surface: "たら",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "た",
          pos: "助動詞",
        },
        {
          surface: "ら",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "だ",
          pos: "助動詞",
        },
        {
          surface: "ら",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "だったら",
        },
      ],
    ],
    tests: [
      "日本に行ったら、お寿司を食べたい。",
      "寒かったら、窓を閉めてください。",
      "暇だったら、遊びに来てね。",
      "分からなかったら、先生に聞いてください。",
      "雨だったら、ピクニックは中止です。",
      "薬を飲んだら、熱が下がりました。",
    ],
  },
  {
    id: "hoka-ni",
    title: "ほかに",
    patterns: [
      [
        {
          surface: "ほか",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          surface: "他",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "りんごのほかに、バナナも買いました。",
      "日本語を勉強するほかに、スポーツも好きです。",
      "このほかに何か質問はありますか。",
      "私のほかに、誰が来ますか。",
      "ほかに何も欲しくない。",
    ],
  },
  {
    id: "ga-hitsuyou",
    title: "～が必要",
    patterns: [
      [
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "必要",
        },
      ],
    ],
    tests: [
      "外国へ行くとき、パスポートが必要です。",
      "日本で生活するにはお金が必要だ。",
      "何か必要なものがありますか。",
      "この作業には人手が必要だ。",
      "車を運転するには免許が必要になります。",
    ],
  },
  {
    id: "sonnani",
    title: "そんなに",
    patterns: [
      [
        {
          surface: "そんなに",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "そんなに食べないでください。",
      "昨日はそんなに寒くなかった。",
      "テストはそんなに難しくありません。",
      "そんなに急いでどこに行くんですか。",
      "彼はそんなに怒らなくてもいいのに。",
    ],
  },
  {
    id: "hitsuyou-ga-aru",
    title: "～必要がある",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "必要",
        },
        {
          surface: "が",
        },
        {
          baseForm: "ある",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "ひつよう",
        },
        {
          surface: "が",
        },
        {
          baseForm: "ある",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "必要",
        },
        {
          baseForm: "ある",
        },
      ],
    ],
    tests: [
      "毎日、練習する必要がある。",
      "病院に行く必要があります。",
      "確認するひつようがあった。",
      "これ、直す必要ある？",
    ],
  },
  {
    id: "tatoeba",
    title: "たとえば",
    patterns: [
      [
        {
          baseForm: "例えば",
          pos: "副詞",
        },
      ],
      [
        {
          surface: "たとえば",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "たとえば、私はりんごが好きです。",
      "例えばどうやって作りますか？",
      "果物、たとえばイチゴやメロンを買いました。",
    ],
  },
  {
    id: "n-da-kedo",
    title: "～んだけど",
    patterns: [
      [
        {
          surface: "ん",
          pos: "助詞",
        },
        {
          baseForm: "だ",
          pos: "助動詞",
        },
        {
          surface: "けど",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "明日、パーティーに行くんだけど、君も来る？",
      "このパソコン、ちょっと高いんだけど、性能はいいよ。",
      "昨日は暇だったんだけど、今日はとても忙しい。",
      "彼女はとてもきれいなんだけど、性格が少しきつい。",
      "今は仕事中なんだけど、何か急用ですか？",
    ],
  },
  {
    id: "naito-must",
    title: "～ないと",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          surface: "と",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "早く行かないと。",
      "明日はテストだから勉強しないと。",
      "毎日、野菜を食べないとだめですよ。",
      "もう寝ないと間に合わない。",
    ],
  },
  {
    id: "hazu-ga-nai",
    title: "～はずがない",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "はず",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "はず",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "な",
        },
        {
          surface: "はず",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          surface: "はず",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "ない",
        },
      ],
    ],
    tests: [
      "彼がそんなことを言うはずがない。",
      "あのおいしいレストランが、まずいはずがない。",
      "まじめな田中さんが、今日休むはずがない。",
      "昨日見たのは幽霊のはずがない。",
    ],
  },
  {
    id: "dake-denaku",
    title: "～だけでなく",
    patterns: [
      [
        {
          surface: "だけ",
        },
        {
          surface: "で",
        },
        {
          surface: "なく",
        },
      ],
    ],
    tests: [
      "日本だけでなく、外国でも有名だ。",
      "この料理は美味しいだけでなく、見た目もいい。",
      "彼は歌を歌うだけでなく、作詞もしている。",
      "ここは静かなだけでなく、景色もとてもいい。",
      "子供だけでなく大人も楽しめる映画です。",
    ],
  },
  {
    id: "kai-question-marker",
    title: "～かい",
    patterns: [
      [
        {
          surface: "かい",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "明日は暇かい？",
      "君、もう準備はできたかい？",
      "何か手伝えることはあるかい？",
      "この意味がわかるかい？",
      "本当に行くのかい？",
    ],
  },
  {
    id: "moshi",
    title: "もし",
    patterns: [
      [
        {
          surface: "もし",
          pos: "副詞",
        },
      ],
    ],
    tests: [
      "もし雨が降ったら、ピクニックは中止です。",
      "もし時間があれば、手伝ってください。",
      "もし安ければ、それを買いたいと思います。",
      "もし彼が学生なら、チケットは半額になります。",
      "もし宝くじが当たったら、何をしますか。",
      "もし困ったことがあったら、電話してください。",
    ],
  },
  {
    id: "shi-listing-reasons",
    title: "～し、～し",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "し",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "形容詞",
        },
        {
          surface: "し",
          pos: "助詞",
        },
      ],
      [
        {
          surface: "だ",
        },
        {
          surface: "し",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "助動詞",
        },
        {
          surface: "し",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "この店は安いし、おいしいです。",
      "今日は休みだし、天気もいいし、最高です。",
      "荷物も多いし、雨も降っているし、タクシーで行こう。",
      "彼は歌も上手だし、ピアノも弾けます。",
      "時間もありますし、ゆっくりしていってください。",
      "雨もやんだし、帰りましょう。",
    ],
  },
  {
    id: "de-dekiru",
    title: "～でできる",
    patterns: [
      [
        {
          surface: "で",
          pos: "助詞",
        },
        {
          baseForm: "できる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "このテーブルは木でできている。",
      "日本の家は昔、木でできていました。",
      "このカメラはほとんどプラスチックでできたおもちゃです。",
      "それは何でできていますか？",
    ],
  },
  {
    id: "to-to-dochira-ga",
    title: "～と～と、どちらが",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          pos: "名詞",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "どちら",
          pos: "代名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          pos: "名詞",
        },
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "どっち",
          pos: "代名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "りんごとバナナと、どちらが好きですか。",
      "犬と猫とどちらが飼いやすいですか。",
      "テニスとサッカーとどっちが面白いですか。",
      "東京と大阪とどちらが広いですか。",
      "これとそれと、どっちが安い？",
    ],
  },
  {
    id: "nakereba-ikenai",
    title: "～なければいけない",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なけれ",
          baseForm: "ない",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "いけない",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なけれ",
          baseForm: "ない",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          surface: "いけ",
          baseForm: "いける",
        },
      ],
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なければ",
        },
        {
          baseForm: "いけない",
        },
      ],
    ],
    tests: [
      "毎日漢字を練習しなければいけない。",
      "早く寝なければいけません。",
      "名前をここに書かなければいけなかった。",
      "薬を飲まなければいけないので、もう帰ります。",
    ],
  },
  {
    id: "nakereba-naranai",
    title: "～なければならない",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          surface: "なけれ",
          pos: "助動詞",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "形容詞",
          conjugation: "連用形",
        },
        {
          surface: "なけれ",
          pos: "助動詞",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          surface: "なけれ",
          pos: "助動詞",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          surface: "なけれ",
          pos: "助動詞",
        },
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "なる",
        },
        {
          baseForm: "ない",
        },
      ],
    ],
    tests: [
      "毎日、日本語を勉強しなければならない。",
      "明日、８時に起きなければならない。",
      "部屋は静かでなければならない。",
      "学生でなければならない。",
      "安くなければならない。",
    ],
  },
  {
    id: "you-ni-iu",
    title: "～ように言う",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "言う",
        },
      ],
      [
        {
          baseForm: "ない",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "言う",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "伝える",
        },
      ],
      [
        {
          baseForm: "ない",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "伝える",
        },
      ],
    ],
    tests: [
      "もっと早く歩くように言った。",
      "忘れ物をしないように言ってください。",
      "先生は学生に宿題をするように言いました。",
      "彼に明日、私の家に来るように伝えてください。",
      "遅れないように言われた。",
    ],
  },
  {
    id: "yotei-da",
    title: "～予定だ",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          baseForm: "予定",
        },
      ],
      [
        {
          pos: "助動詞",
          conjugation: "終止形",
        },
        {
          baseForm: "予定",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "の",
          pos: "助詞",
        },
        {
          baseForm: "予定",
        },
      ],
    ],
    tests: [
      "来年、日本へ行く予定です。",
      "明日は会議の予定だ。",
      "今日はどこへも行かない予定だ。",
      "来週の月曜日は、出張の予定です。",
      "卒業してから、先生になる予定だ。",
    ],
  },
  {
    id: "youni-inoru",
    title: "～ように祈る",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "祈る",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "ように",
        },
        {
          baseForm: "祈る",
        },
      ],
      [
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
        {
          baseForm: "祈る",
        },
      ],
      [
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          surface: "ように",
        },
        {
          baseForm: "祈る",
        },
      ],
    ],
    tests: [
      "試験に合格するように祈っています。",
      "病気が早く治るように毎日祈る。",
      "世界が平和になるように祈りましょう。",
      "大切な試合で負けないように祈ります。",
    ],
  },
  {
    id: "ka-suru",
    title: "～化する",
    patterns: [
      [
        {
          surface: "化",
        },
        {
          baseForm: "する",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "この物語を映画化する予定だ。",
      "地球の気温が上昇し、温暖化している。",
      "工場が自動化されました。",
      "情報をデジタル化するのは大変です。",
    ],
  },
  {
    id: "you-ni-purpose",
    title: "～ように",
    patterns: [
      [
        {
          pos: "動詞",
          conjugation: "終止形",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
      ],
      [
        {
          baseForm: "ない",
          pos: "助動詞",
        },
        {
          surface: "よう",
        },
        {
          surface: "に",
        },
      ],
    ],
    tests: [
      "忘れないようにメモしました。",
      "試験に合格するように、毎日勉強しています。",
      "後ろの人にも聞こえるように、大きな声で話した。",
      "風邪を引かないように、セーターを着てください。",
      "子供が野菜を食べるように、工夫しています。",
    ],
  },
  {
    id: "kashira",
    title: "～かしら",
    patterns: [
      [
        {
          surface: "かしら",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "明日は雨かしら。",
      "彼は本当に来るかしら。",
      "この料理、美味しいかしら。",
      "一人で大丈夫かしら。",
      "あのお店はまだ開いていますかしら。",
      "どうすればいいのかしら。",
    ],
  },
  {
    id: "ni-mieru",
    title: "～に見える",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "見える",
          pos: "動詞",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "に",
          pos: "助詞",
        },
        {
          baseForm: "見える",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "彼は医者に見える。",
      "この料理はきれいにみえますね。",
      "それは私には偽物に見える。",
      "彼女はいつも元気に見える。",
      "日本人は実年齢より若く見えるが、この場合は「に見える」ではない。",
      "その犬はぬいぐるみのように見える。",
    ],
  },
  {
    id: "to-mieru",
    title: "～とみえる",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "見える",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "彼はかなり疲れているとみえる。",
      "田中さんはまだ来ていないとみえる。",
      "昨日はかなり雨が降ったとみえる。",
      "どうやら彼はそのことを知らなかったとみえる。",
      "試験が難しかったとみえる、みんな元気がない。",
    ],
  },
  {
    id: "ga-mirareru",
    title: "～がみられる",
    patterns: [
      [
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "見る",
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          baseForm: "られる",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "最近、回復の兆しがみられる。",
      "患者にいくつかの副作用がみられます。",
      "調査の結果、改善の傾向が見られる。",
      "多くの場所で同じ現象がみられました。",
    ],
  },
  {
    id: "ni-ki-ga-tsuku",
    title: "～に気がつく",
    patterns: [
      [
        {
          surface: "に",
          pos: "助詞",
        },
        {
          surface: "気",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "つく",
          pos: "動詞",
        },
      ],
      [
        {
          surface: "に",
          pos: "助詞",
        },
        {
          surface: "気",
          pos: "名詞",
        },
        {
          surface: "が",
          pos: "助詞",
        },
        {
          baseForm: "付く",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "間違いに気がつく",
      "彼の変化に気がつきました",
      "忘れ物に気がついた",
      "大切なことに気が付かなかった",
    ],
  },
  {
    id: "demo-demo",
    title: "～でも～でも",
    patterns: [
      [
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
        },
        {
          pos: "名詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
        },
        {
          pos: "形状詞",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
        },
      ],
      [
        {
          pos: "名詞",
        },
        {
          surface: "でも",
        },
        {
          pos: "名詞",
        },
        {
          surface: "でも",
        },
      ],
      [
        {
          pos: "形状詞",
        },
        {
          surface: "でも",
        },
        {
          pos: "形状詞",
        },
        {
          surface: "でも",
        },
      ],
    ],
    tests: [
      "肉でも魚でも、どちらでもいいですよ。",
      "男性でも女性でも参加することができます。",
      "平日でも週末でも、その店は混んでいる。",
      "不便でも、きれいでも、この家が好きだ。",
    ],
  },
  {
    id: "sore-ni",
    title: "それに",
    patterns: [
      [
        {
          surface: "それに",
        },
      ],
      [
        {
          baseForm: "それ",
          pos: "代名詞",
        },
        {
          surface: "に",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "この店は美味しいし、それに安いです。",
      "今日はとても疲れました。それに、お腹も空いています。",
      "彼は背が高いし、それにハンサムだ。",
      "昨日は宿題がたくさんあった。それに、テスト勉強もしなければならなかった。",
    ],
  },
  {
    id: "sore-de",
    title: "それで",
    patterns: [
      [
        {
          surface: "それで",
          pos: "接続詞",
        },
      ],
      [
        {
          surface: "それ",
          pos: "代名詞",
        },
        {
          surface: "で",
          pos: "助詞",
        },
      ],
    ],
    tests: [
      "雨が降りました。それで、試合は中止になりました。",
      "昨日はとても疲れました。それで、早く寝ました。",
      "「財布を失くしたんです。」「それで、どうしましたか。」",
      "勉強しませんでした。それで、試験に落ちました。",
    ],
  },
  {
    id: "soredemo",
    title: "それでも",
    patterns: [
      [
        {
          surface: "それでも",
        },
      ],
      [
        {
          surface: "それ",
        },
        {
          surface: "で",
        },
        {
          surface: "も",
        },
      ],
    ],
    tests: [
      "外はとても寒いです。それでも彼は走ります。",
      "たくさん食べました。それでもまだお腹が空いています。",
      "雨が降っていますが、それでも行かなければなりません。",
      "一生懸命勉強した。それでも試験に落ちてしまった。",
    ],
  },
  {
    id: "tara-dou",
    title: "～たらどう",
    patterns: [
      [
        {
          pos: "動詞",
        },
        {
          surface: "たら",
          pos: "助動詞",
        },
        {
          surface: "どう",
        },
      ],
      [
        {
          pos: "動詞",
        },
        {
          surface: "だら",
          pos: "助動詞",
        },
        {
          surface: "どう",
        },
      ],
    ],
    tests: [
      "もっと早く起きたらどうですか？",
      "分からないところを先生に聞いたらどう？",
      "疲れているなら、少し休んだらどう？",
      "たまには自分にプレゼントを買ってみたらどうかな。",
      "日本に来る前に、ひらがなを覚えたらどうですか？",
    ],
  },
  {
    id: "to-kangaerarete-iru",
    title: "～と考えられている",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "考える",
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          baseForm: "られる",
          pos: "助動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "いる",
        },
      ],
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          surface: "かんがえ",
          pos: "動詞",
        },
        {
          baseForm: "られる",
          pos: "助動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "いる",
        },
      ],
    ],
    tests: [
      "日本料理は健康にいいと考えられている。",
      "この事件には別の犯人がいると考えられている。",
      "富士山は神聖な場所だとかんがえられている。",
      "新しいウイルスは動物から感染したと考えられている。",
    ],
  },
  {
    id: "to-sarete-iru",
    title: "～とされている",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "する",
          conjugation: "未然形",
        },
        {
          baseForm: "れる",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "いる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "この果物は体に良いとされている。",
      "富士山は日本で一番高い山だとされている。",
      "コーヒーを飲むことは脳にいいとされている。",
      "彼は世界一の選手だとされている。",
      "この習慣は、江戸時代から始まったとされている。",
    ],
  },
  {
    id: "to-iwarete-iru",
    title: "といわれている",
    patterns: [
      [
        {
          surface: "と",
          pos: "助詞",
        },
        {
          baseForm: "いう",
          pos: "動詞",
          conjugation: "未然形",
        },
        {
          baseForm: "れる",
          pos: "助動詞",
          conjugation: "連用形",
        },
        {
          surface: "て",
          pos: "助詞",
        },
        {
          baseForm: "いる",
          pos: "動詞",
        },
      ],
    ],
    tests: [
      "日本人は親切だといわれている。",
      "納豆は体にいいといわれている。",
      "今年は去年より暑くなるといわれている。",
      "この寺は1000年前に建てられたといわれている。",
    ],
  },
  {
    id: "ba-yokatta",
    title: "～ばよかった",
    patterns: [
      [
        {
          surfaceEndsWith: "ば",
        },
        {
          baseForm: "良い",
          surface: "よかっ",
        },
        {
          surface: "た",
          pos: "助動詞",
        },
      ],
      [
        {
          surface: "ば",
          pos: "助詞",
        },
        {
          baseForm: "良い",
          surface: "よかっ",
        },
        {
          surface: "た",
          pos: "助動詞",
        },
      ],
    ],
    tests: [
      "もっと早く起きればよかった。",
      "傘を持って来ればよかった。",
      "昨日の夜、あんなに食べなければよかった。",
      "安ければよかったのに。",
      "もっと勉強すればよかった。",
    ],
  },
];

export default GRAMMAR_RULES;
