import { runBatchJob } from "./batch-ai.js";
import * as fs from "node:fs";

// var rules = JSON.parse(fs.readFileSync("grammar/n5-grammar-rules.json"));
// var rules = JSON.parse(fs.readFileSync("grammar/n4-grammar-rules.json"));
// var rules = JSON.parse(fs.readFileSync("grammar/n3-grammar-rules.json"));
// var rules = JSON.parse(
//   fs.readFileSync("/home/max/src/node/iyaku/public/grammar/n1_rules.json"),
// );
// var rules = [...n5Rules]; //, ...n4Rules, ...n3Rules];
var rules = [
  {
    failure: "No match found",
    sentence: "努力のいかんにかかわらず、結果は保証できない。",
    tokenDump:
      "努力(名詞:*) | の(助詞:*) | いかん(名詞:*) | に(助詞:*) | かかわら(動詞:未然形-一般) | ず(助動詞:連用形-一般) | 、(補助記号:*) | 結果(名詞:*) | は(助詞:*) | 保証(名詞:*) | でき(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "ikan",
      title: "如何",
      matchAllConjugations: true,
      patterns: [
        [
          {
            pos: "名詞",
          },
          {
            surface: "の",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "如何|いかん",
          },
          {
            surface: "だ|で",
          },
          {
            surface: "は|も",
            pos: "助詞",
            match: "end",
          },
        ],
        [
          {
            pos: "名詞",
          },
          {
            surface: "如何|いかん",
            match: "start",
          },
          {
            surface: "だ|で",
          },
          {
            surface: "は|も",
            pos: "助詞",
            match: "end",
          },
        ],
        [
          {
            pos: "名詞",
          },
          {
            surface: "の",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "如何|いかん",
          },
          {
            surface: "だ|で",
            match: "end",
          },
        ],
        [
          {
            pos: "名詞",
          },
          {
            surface: "如何|いかん",
            match: "start",
          },
          {
            surface: "だ|で",
            match: "end",
          },
        ],
        [
          {
            pos: "名詞",
          },
          {
            surface: "の",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "如何|いかん",
          },
          {
            surface: "にかかわらず|によっては|にかわらず",
            match: "end",
          },
        ],
      ],
      tests: [
        "面接の結果{いかんでは}、採用が決まる。",
        "努力の{いかんにかかわらず}、結果は保証できない。",
        "これからの成績{如何だ}ね。",
      ],
      level: "n1",
      description: "Depending on",
      link: "https://bunpro.jp/grammar_points/%E5%A6%82%E4%BD%95",
    },
  },
  {
    failure:
      '"このような状況にあっても冷静でいなければならない。" -> Matched text was "あって" but expected "あっても"',
    sentence: "このような状況にあっても冷静でいなければならない。",
    tokenDump:
      "この(連体詞:*) | よう(形状詞:*) | な(助動詞:連体形-一般) | 状況(名詞:*) | に(助詞:*) | あっ(動詞:連用形-促音便) | て(助詞:*) | も(助詞:*) | 冷静(名詞:*) | で(助動詞:連用形-一般) | い(動詞:未然形-一般) | なけれ(助動詞:仮定形-一般) | ば(助詞:*) | なら(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "ni-atte",
      title: "にあって",
      matchAllConjugations: true,
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
            baseForm: "ある",
            pos: "動詞",
            conjugation: "any",
            match: "exact",
          },
        ],
      ],
      tests: [
        "不況に{あって}、売り上げを伸ばしている企業もある。",
        "このような状況に{あっても}冷静でいなければならない。",
      ],
      level: "n1",
      description:
        "At, In the (place or situation), Under ~ conditions or circumstances, During, Suited to",
      link: "https://bunpro.jp/grammar_points/%E3%81%AB%E3%81%82%E3%81%A3%E3%81%E3%81%E3%81%E3%81%A7",
    },
  },
  {
    failure:
      '"資金不足により、計画は中止を余儀なくされた。" -> Matched text was "を余儀なくされ" but expected "を余儀なくされた"',
    sentence: "資金不足により、計画は中止を余儀なくされた。",
    tokenDump:
      "資金(名詞:*) | 不足(名詞:*) | に(助詞:*) | より(動詞:連用形-一般) | 、(補助記号:*) | 計画(名詞:*) | は(助詞:*) | 中止(名詞:*) | を(助詞:*) | 余儀(名詞:*) | なく(形容詞:連用形-一般) | さ(動詞:未然形-サ) | れ(助動詞:連用形-一般) | た(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "wo-yogi-naku-sareru",
      title: "を余儀なくされる",
      level: "n1",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "を",
            pos: "助詞",
            match: "start",
          },
          {
            baseForm: "余儀ない",
            pos: "形容詞",
          },
          {
            baseForm: "する",
            pos: "動詞",
          },
          {
            baseForm: "れる|られる",
            pos: "助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "を",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "余儀",
            pos: "名詞",
          },
          {
            surface: "なく",
          },
          {
            baseForm: "する",
            pos: "動詞",
          },
          {
            baseForm: "れる|られる",
            pos: "助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "を",
            pos: "助詞",
            match: "start",
          },
          {
            baseForm: "余儀ない",
            pos: "形容詞",
          },
          {
            baseForm: "する",
            pos: "動詞",
          },
          {
            baseForm: "れる|られる",
            pos: "助動詞",
          },
          {
            baseForm: "た",
            pos: "助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "を",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "余儀",
            pos: "名詞",
          },
          {
            surface: "なく",
          },
          {
            baseForm: "する",
            pos: "動詞",
          },
          {
            baseForm: "れる|られる",
            pos: "助動詞",
          },
          {
            baseForm: "た",
            pos: "助動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "資金不足により、計画は中止{を余儀なくされた}。",
        "豪雨で多くの人が避難{を余儀なくされる}だろう。",
      ],
      description: "To be forced to do something",
      link: "https://bunpro.jp/grammar_points/%E3%82%92%E4%BD%99%E5%84%80%E3%81%AA%E3%81%8F%E3%81%95%E3%82%8C%E3%82%8B",
    },
  },
  {
    failure: "No match found",
    sentence: "彼をおいてほかに適任者はいない。",
    tokenDump:
      "彼(代名詞:*) | を(助詞:*) | おい(動詞:連用形-イ音便) | て(助詞:*) | ほか(名詞:*) | に(助詞:*) | 適任(名詞:*) | 者(接尾辞:*) | は(助詞:*) | い(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "をおいてほかに-ない",
      title: "をおいてほかに〜ない",
      matchAllConjugations: true,
      patterns: [
        [
          {
            pos: "名詞|代名詞",
          },
          {
            surface: "を",
            match: "start",
          },
          {
            surface: "おい|置い|措い|於い",
            pos: "動詞",
          },
          {
            surface: "て",
            pos: "助詞",
          },
          {
            baseForm: "ほか|他",
          },
          {
            surface: "に",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
        [
          {
            pos: "名詞|代名詞",
          },
          {
            surface: "を",
            match: "start",
          },
          {
            surface: "おい|置い|措い|於い",
            pos: "動詞",
          },
          {
            surface: "て",
            pos: "助詞",
          },
          {
            baseForm: "ほか|他",
          },
          {
            surface: "に",
          },
          {
            surface: "は",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
      ],
      tests: [
        "彼{をおいてほかに適任者はいない}。",
        "彼{をおいてほかにはいない}。",
      ],
      level: "n1",
      description: "No...but, Nothing else but, None other than",
      link: "https://bunpro.jp/grammar_points/%E3%82%92%E3%81%8A%E3%81%A4%E3%81%A6%E3%81%BB%E3%81%8B%E3%81%AB-%E3%81%AA%E3%81%84",
    },
  },
  {
    failure: "No match found",
    sentence: "晴天であれ雨天であれ、明日のイベントは予定通り行われます。",
    tokenDump:
      "晴天(名詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 雨天(名詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 、(補助記号:*) | 明日(名詞:*) | の(助詞:*) | イベント(名詞:*) | は(助詞:*) | 予定(名詞:*) | 通り(名詞:*) | 行わ(動詞:未然形-一般) | れ(助動詞:連用形-一般) | ます(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "de-are-de-are",
      title: "であれ〜であれ",
      level: "n1",
      matchAllConjugations: false,
      patterns: [
        [
          {
            pos: "名詞|代名詞|形状詞",
            match: "start",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
          },
          {
            wildcard: true,
          },
          {
            pos: "名詞|代名詞|形状詞",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "{晴天であれ雨天であれ}、明日のイベントは予定通り行われます。",
        "{大人であれ子供であれ}、法律は皆平等に守る必要があります。",
        "{簡単であれ複雑であれ}、一度申請した書類は訂正できません。",
      ],
      description: "Whether or, Or, No matter which, In either case",
      link: "https://bunpro.jp/grammar_points/%E3%81%A7%E3%81%82%E3%82%8C-%E3%81%A7%E3%81%82%E3%82%8C",
    },
  },
  {
    failure: "No match found",
    sentence: "大人であれ子供であれ、法律は皆平等に守る必要があります。",
    tokenDump:
      "大人(名詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 子供(名詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 、(補助記号:*) | 法律(名詞:*) | は(助詞:*) | 皆(名詞:*) | 平等(名詞:*) | に(助動詞:連用形-ニ) | 守る(動詞:連体形-一般) | 必要(名詞:*) | が(助詞:*) | あり(動詞:連用形-一般) | ます(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "de-are-de-are",
      title: "であれ〜であれ",
      level: "n1",
      matchAllConjugations: false,
      patterns: [
        [
          {
            pos: "名詞|代名詞|形状詞",
            match: "start",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
          },
          {
            wildcard: true,
          },
          {
            pos: "名詞|代名詞|形状詞",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "{晴天であれ雨天であれ}、明日のイベントは予定通り行われます。",
        "{大人であれ子供であれ}、法律は皆平等に守る必要があります。",
        "{簡単であれ複雑であれ}、一度申請した書類は訂正できません。",
      ],
      description: "Whether or, Or, No matter which, In either case",
      link: "https://bunpro.jp/grammar_points/%E3%81%A7%E3%81%82%E3%82%8C-%E3%81%A7%E3%81%82%E3%82%8C",
    },
  },
  {
    failure: "No match found",
    sentence: "簡単であれ複雑であれ、一度申請した書類は訂正できません。",
    tokenDump:
      "簡単(形状詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 複雑(名詞:*) | で(助動詞:連用形-一般) | あれ(動詞:命令形) | 、(補助記号:*) | 一(名詞:*) | 度(名詞:*) | 申請(名詞:*) | し(動詞:連用形-一般) | た(助動詞:連体形-一般) | 書類(名詞:*) | は(助詞:*) | 訂正(名詞:*) | でき(動詞:連用形-一般) | ませ(助動詞:未然形-一般) | ん(助動詞:終止形-撥音便) | 。(補助記号:*)",
    ruleJson: {
      id: "de-are-de-are",
      title: "であれ〜であれ",
      level: "n1",
      matchAllConjugations: false,
      patterns: [
        [
          {
            pos: "名詞|代名詞|形状詞",
            match: "start",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
          },
          {
            wildcard: true,
          },
          {
            pos: "名詞|代名詞|形状詞",
          },
          {
            surface: "で",
            pos: "助動詞",
          },
          {
            surface: "あれ",
            pos: "動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "{晴天であれ雨天であれ}、明日のイベントは予定通り行われます。",
        "{大人であれ子供であれ}、法律は皆平等に守る必要があります。",
        "{簡単であれ複雑であれ}、一度申請した書類は訂正できません。",
      ],
      description: "Whether or, Or, No matter which, In either case",
      link: "https://bunpro.jp/grammar_points/%E3%81%A7%E3%81%82%E3%82%8C-%E3%81%A7%E3%81%82%E3%82%8C",
    },
  },
  {
    failure: "No match found",
    sentence: "気に入らないなら気に入らないではっきりと伝えてほしい。",
    tokenDump:
      "気(名詞:*) | に(助詞:*) | 入ら(動詞:未然形-一般) | ない(助動詞:終止形-一般) | なら(助動詞:仮定形-一般) | 気(名詞:*) | に(助詞:*) | 入ら(動詞:未然形-一般) | ない(助動詞:終止形-一般) | で(助詞:*) | はっきり(副詞:*) | と(助詞:*) | 伝え(動詞:連用形-一般) | て(助詞:*) | ほしい(形容詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "nara-de",
      title: "なら〜で",
      level: "n1",
      description: "If ~ should, Before ~ should",
      link: "https://bunpro.jp/grammar_points/%E3%81%AA%E3%82%89-%E3%81%A7",
      matchAllConjugations: false,
      patterns: [
        [
          {
            pos: "動詞|形容詞|形状詞|名詞|代名詞|助動詞",
          },
          {
            surface: "なら",
            match: "start",
          },
          {
            wildcard: true,
          },
          {
            surface: "で",
            pos: "助詞",
            match: "end",
          },
        ],
        [
          {
            pos: "動詞|形容詞|形状詞|名詞|代名詞|助動詞",
          },
          {
            surface: "の",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "なら",
            pos: "助動詞",
          },
          {
            wildcard: true,
          },
          {
            surface: "で",
            pos: "助詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "お金がない{ならないで}、なんとか工夫してやっていける。",
        "気に入らない{なら気に入らないで}はっきりと伝えてほしい。",
      ],
    },
  },
  {
    failure:
      '"彼にガン見された。" -> Matched text was "ガン見さ" but expected "ガン見"',
    sentence: "彼にガン見された。",
    tokenDump:
      "彼(代名詞:*) | に(助詞:*) | ガン(副詞:*) | 見さ(動詞:未然形-一般) | れ(助動詞:連用形-一般) | た(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "gan-totally",
      title: "ガン～",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "ガン|がん",
            match: "start",
          },
          {
            pos: "動詞|名詞|接尾辞",
            match: "end",
          },
        ],
        [
          {
            surface: "ガン見|がん見|ガン無視|がん無視|ガン飛ばし|がん飛ばし",
            match: "exact",
          },
        ],
      ],
      tests: ["彼に{ガン見}された。", "昨日あいつに{ガン無視}された。"],
      link: "https://bunpro.jp/grammar_points/%E3%81%8C%E3%82%93-totally",
      description: "Totally, Seriously, Completely, Furiously, Majorly",
      level: "n1",
    },
  },
  {
    failure: "No match found",
    sentence: "これは秘密demo-nan-demo-naiですよ。",
    tokenDump:
      "これ(代名詞:*) | は(助詞:*) | 秘密(名詞:*) | demo(名詞:*) | -(補助記号:*) | nan(名詞:*) | -(補助記号:*) | demo(名詞:*) | -(補助記号:*) | nai(名詞:*) | です(助動詞:終止形-一般) | よ(助詞:*) | 。(補助記号:*)",
    ruleJson: {
      id: "demo-nan-demo-nai",
      title: "でもなんでもない",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "でも",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "でも",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "でも",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "でも",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "これは秘密{demo-nan-demo-nai}ですよ。",
        "あの人は天才{demo-nan-demo-nai}。ただ努力しただけだ。",
      ],
      description:
        "Not at all, By no means, Definitely not, Nothing like that, Not really",
      link: "https://bunpro.jp/grammar_points/%E3%81%9E%E3%82%82%E3%81%AA%E3%82%93%E3%81%A7%E3%82%82%E3%81%AA%E3%81%AF",
      level: "n1",
    },
  },
  {
    failure: "No match found",
    sentence: "あの人は天才demo-nan-demo-nai。ただ努力しただけだ。",
    tokenDump:
      "あの(連体詞:*) | 人(名詞:*) | は(助詞:*) | 天才(名詞:*) | demo(名詞:*) | -(補助記号:*) | nan(名詞:*) | -(補助記号:*) | demo(名詞:*) | -(補助記号:*) | nai(名詞:*) | 。(補助記号:*) | ただ(接続詞:*) | 努力(名詞:*) | し(動詞:連用形-一般) | た(助動詞:連体形-一般) | だけ(助詞:*) | だ(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "demo-nan-demo-nai",
      title: "でもなんでもない",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "でも",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "でも",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "でも",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|なに|何",
            pos: "代名詞|名詞|連体詞",
          },
          {
            surface: "でも",
            pos: "助詞",
          },
          {
            baseForm: "ない|無い",
            pos: "形容詞|助動詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "これは秘密{demo-nan-demo-nai}ですよ。",
        "あの人は天才{demo-nan-demo-nai}。ただ努力しただけだ。",
      ],
      description:
        "Not at all, By no means, Definitely not, Nothing like that, Not really",
      link: "https://bunpro.jp/grammar_points/%E3%81%9E%E3%82%82%E3%81%AA%E3%82%93%E3%81%A7%E3%82%82%E3%81%AA%E3%81%AF",
      level: "n1",
    },
  },
  {
    failure:
      '"安く家を買うことができたが、訳ありの物件に違いない。" -> Matched text was "訳ありの" but expected "訳あり"',
    sentence: "安く家を買うことができたが、訳ありの物件に違いない。",
    tokenDump:
      "安く(形容詞:連用形-一般) | 家(名詞:*) | を(助詞:*) | 買う(動詞:連体形-一般) | こと(名詞:*) | が(助詞:*) | でき(動詞:連用形-一般) | た(助動詞:終止形-一般) | が(助詞:*) | 、(補助記号:*) | 訳あり(名詞:*) | の(助詞:*) | 物件(名詞:*) | に(助詞:*) | 違い(名詞:*) | ない(形容詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "wake-ari",
      title: "訳あり(訳あって)",
      level: "n1",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "訳あり|わけあり|ワケあり|ワケアリ",
            pos: "名詞",
            match: "start",
          },
          {
            surface: "の|な|で",
            pos: "助詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "訳あり|わけあり|ワケあり|ワケアリ",
            pos: "名詞",
            match: "exact",
          },
        ],
        [
          {
            surface: "訳|わけ|ワケ",
            pos: "名詞",
            match: "start",
          },
          {
            surface: "あり|有り",
            pos: "動詞|接尾辞|名詞",
          },
          {
            surface: "の|な|で",
            pos: "助詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "訳|わけ|ワケ",
            pos: "名詞",
            match: "start",
          },
          {
            surface: "あり|有り",
            pos: "動詞|接尾辞|名詞",
            match: "end",
          },
        ],
        [
          {
            surface: "訳|わけ|ワケ",
            pos: "名詞",
            match: "start",
          },
          {
            surface: "あっ",
            baseForm: "ある",
            pos: "動詞",
          },
          {
            surface: "て",
            pos: "助詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "これはちょっと{訳ありの}商品なんですよ。",
        "彼女は{訳あって}、来月急にアメリカへ引っ越すことになった。",
        "安く家を買うことができたが、{訳あり}の物件に違いない。",
      ],
      description:
        "～ with reasons, Due to reasons, Defective, Problematic, Unique",
      link: "https://bunpro.jp/grammar_points/%E8%A8%B3%E3%81%82%E3%82%8A",
    },
  },
  {
    failure: "No match found",
    sentence: "こんなの、痛くもなんともない。",
    tokenDump:
      "こんな(連体詞:*) | の(助詞:*) | 、(補助記号:*) | 痛く(形容詞:連用形-一般) | も(助詞:*) | なん(代名詞:*) | と(助詞:*) | も(助詞:*) | ない(形容詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "い-adj-く-もなんともない",
      title: "い-Adj[く] + もなんともない",
      matchAllConjugations: true,
      patterns: [
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|何",
            pos: "代名詞|名詞",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|何",
            pos: "代名詞|名詞",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なんとも|何とも",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
      ],
      tests: [
        "こんなの、{痛くもなんともない}。",
        "試験の前の日だけど、緊張してないから、{怖くもなんともない}。",
      ],
      level: "n1",
      description:
        "Not... or anything, Not at all, Not, By no means, Definitely not, Nothing like that",
      link: "https://bunpro.jp/grammar_points/%E3%81%84-adj-%E3%81%8F-%E3%82%82%E3%81%AA%E3%82%93%E3%81%A8%E3%82%82%E3%81%AA%E3%81%84",
    },
  },
  {
    failure: "No match found",
    sentence: "試験の前の日だけど、緊張してないから、怖くもなんともない。",
    tokenDump:
      "試験(名詞:*) | の(助詞:*) | 前(名詞:*) | の(助詞:*) | 日(名詞:*) | だ(助動詞:終止形-一般) | けど(助詞:*) | 、(補助記号:*) | 緊張(名詞:*) | し(動詞:連用形-一般) | て(助動詞:未然形-一般) | ない(助動詞:終止形-一般) | から(助詞:*) | 、(補助記号:*) | 怖く(形容詞:連用形-一般) | も(助詞:*) | なん(代名詞:*) | と(助詞:*) | も(助詞:*) | ない(形容詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "い-adj-く-もなんともない",
      title: "い-Adj[く] + もなんともない",
      matchAllConjugations: true,
      patterns: [
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|何",
            pos: "代名詞|名詞",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なん|何",
            pos: "代名詞|名詞",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
        [
          {
            pos: "形容詞",
            conjugation: "連用形.*",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "なんとも|何とも",
          },
          {
            baseForm: "ない",
            match: "end",
          },
        ],
      ],
      tests: [
        "こんなの、{痛くもなんともない}。",
        "試験の前の日だけど、緊張してないから、{怖くもなんともない}。",
      ],
      level: "n1",
      description:
        "Not... or anything, Not at all, Not, By no means, Definitely not, Nothing like that",
      link: "https://bunpro.jp/grammar_points/%E3%81%84-adj-%E3%81%8F-%E3%82%82%E3%81%AA%E3%82%93%E3%81%A8%E3%82%82%E3%81%AA%E3%81%84",
    },
  },
  {
    failure:
      '"彼女こそプロでなくてなんだろうか。" -> Matched text was "でなくてなんだろう" but expected "でなくてなんだろうか"',
    sentence: "彼女こそプロでなくてなんだろうか。",
    tokenDump:
      "彼女(代名詞:*) | こそ(助詞:*) | プロ(名詞:*) | で(助動詞:連用形-一般) | なく(形容詞:連用形-一般) | て(助詞:*) | な(助動詞:連体形-一般) | ん(助詞:*) | だろう(助動詞:意志推量形) | か(助詞:*) | 。(補助記号:*)",
    ruleJson: {
      id: "でなくてなんだろう",
      title: "でなくてなんだろう",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "なく",
          },
          {
            surface: "て",
          },
          {
            surface: "なん|何|なに",
          },
          {
            surface: "だ|であ",
          },
          {
            surface: "ろう",
            match: "end",
          },
        ],
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "なく",
          },
          {
            surface: "て",
          },
          {
            surface: "な",
          },
          {
            surface: "ん",
          },
          {
            surface: "だろう",
            match: "end",
          },
        ],
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "なく",
          },
          {
            surface: "て",
          },
          {
            surface: "なん|何|なに",
          },
          {
            surface: "だ|であ",
          },
          {
            surface: "ろう",
          },
          {
            surface: "か",
            match: "end",
          },
        ],
        [
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "start",
          },
          {
            surface: "なく",
          },
          {
            surface: "て",
          },
          {
            surface: "な",
          },
          {
            surface: "ん",
          },
          {
            surface: "ろう",
          },
          {
            surface: "か",
            match: "end",
          },
        ],
      ],
      tests: [
        "これこそが運命{でなくてなんだろう}。",
        "彼女こそプロ{でなくてなんだろうか}。",
      ],
      level: "n1",
      description: "If … is not … then what is?",
      link: "https://bunpro.jp/grammar_points/%E3%81%A7%E3%81%AA%E3%81%8F%E3%81%A6%E3%81%AA%E3%82%93%E3%81%A0%E3%82%8B%E3%81%86",
    },
  },
  {
    failure:
      '"私がやってみせます。" -> Matched text was "てみせます" but expected "みせます"',
    sentence: "私がやってみせます。",
    tokenDump:
      "私(代名詞:*) | が(助詞:*) | やっ(動詞:連用形-促音便) | て(助詞:*) | みせ(動詞:連用形-一般) | ます(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "verb-te-miseru",
      title: "Verb[て] + みせる",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "て|で",
            pos: "助詞",
            match: "start",
          },
          {
            baseForm: "見せる|みせる",
            pos: "動詞",
            conjugation: "any",
            match: "end",
          },
        ],
        [
          {
            surface: "て|で",
            pos: "助詞",
          },
          {
            baseForm: "見せる|みせる",
            pos: "動詞",
            conjugation: "any",
            match: "exact",
          },
        ],
      ],
      tests: ["今度の試合、絶対に勝っ{てみせる}！", "私がやって{みせます}。"],
      level: "n1",
      link: "https://bunpro.jp/grammar_points/verb-%E3%81%A6-%E3%81%BF%E3%81%9B%E3%82%8B",
      description:
        "I will definitely, I will certainly, Just watch, Whatever it takes, I swear, for sure",
    },
  },
  {
    failure:
      '"何にもまして健康が一番大切だ。" -> Matched text was "何にもまして" but expected "にもまして"',
    sentence: "何にもまして健康が一番大切だ。",
    tokenDump:
      "何に(代名詞:*) | も(助詞:*) | まして(副詞:*) | 健康(名詞:*) | が(助詞:*) | 一番(副詞:*) | 大切(形状詞:*) | だ(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "ni-mo-mashite",
      title: "にもまして",
      level: "n1",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "に",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            baseForm: "増す|ます",
            surface: "まし|増し",
          },
          {
            surface: "て",
            pos: "助詞",
            match: "end",
          },
        ],
        [
          {
            surface: "に",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "まして|増して",
            match: "end",
          },
        ],
        [
          {
            surface: "何に",
            pos: "代名詞|名詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "まして|増して",
            match: "end",
          },
        ],
      ],
      tests: [
        "今年のアニメは、去年{にもまして}面白い作品が多い。",
        "何{にもまして}健康が一番大切だ。",
        "いつ{にもまして}美しいですね。",
      ],
      description:
        "Even -er than, Even more than, More than anything, More than anybody, More than ever",
      link: "https://bunpro.jp/grammar_points/%E3%81%AF%E3%81%A1",
    },
  },
  {
    failure: "No match found",
    sentence:
      "仕事は忙しいわ、プライベートは問題山積みだわで、全く休まらない。",
    tokenDump:
      "仕事(名詞:*) | は(助詞:*) | 忙しい(形容詞:終止形-一般) | わ(助詞:*) | 、(補助記号:*) | プライベート(名詞:*) | は(助詞:*) | 問題(名詞:*) | 山積み(名詞:*) | だ(助動詞:終止形-一般) | わ(助詞:*) | で(助動詞:連用形-一般) | 、(補助記号:*) | 全く(副詞:*) | 休まら(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "wa-wa-de",
      title: "わ〜わ（で）",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "わ",
            pos: "助詞",
            match: "start",
          },
          {
            wildcard: true,
          },
          {
            surface: "わ",
            pos: "助詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "わ",
            pos: "助詞",
            match: "start",
          },
          {
            wildcard: true,
          },
          {
            surface: "わ",
            pos: "助詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "仕事は忙しい{わ、プライベートは問題山積みだわで}、全く休まらない。",
        "お金はない{わ、時間は足りないわ}、一体どうすればいいのだろう。",
      ],
      description: "And...so, And...because, Since",
      link: "https://bunpro.jp/grammar_points/%E3%82%8F-%E3%82%8F%E3%81%A7",
      level: "n1",
    },
  },
  {
    failure: "No match found",
    sentence: "お金はないわ、時間は足りないわ、一体どうすればいいのだろう。",
    tokenDump:
      "お(接頭辞:*) | 金(名詞:*) | は(助詞:*) | ない(形容詞:終止形-一般) | わ(助詞:*) | 、(補助記号:*) | 時間(名詞:*) | は(助詞:*) | 足り(動詞:未然形-一般) | ない(助動詞:終止形-一般) | わ(助詞:*) | 、(補助記号:*) | 一体(副詞:*) | どう(副詞:*) | すれ(動詞:仮定形-一般) | ば(助詞:*) | いい(形容詞:連体形-一般) | の(助詞:*) | だろう(助動詞:意志推量形) | 。(補助記号:*)",
    ruleJson: {
      id: "wa-wa-de",
      title: "わ〜わ（で）",
      matchAllConjugations: false,
      patterns: [
        [
          {
            surface: "わ",
            pos: "助詞",
            match: "start",
          },
          {
            wildcard: true,
          },
          {
            surface: "わ",
            pos: "助詞",
          },
          {
            surface: "で",
            pos: "助詞|助動詞",
            match: "end",
          },
        ],
        [
          {
            surface: "わ",
            pos: "助詞",
            match: "start",
          },
          {
            wildcard: true,
          },
          {
            surface: "わ",
            pos: "助詞",
            match: "end",
          },
        ],
      ],
      tests: [
        "仕事は忙しい{わ、プライベートは問題山積みだわで}、全く休まらない。",
        "お金はない{わ、時間は足りないわ}、一体どうすればいいのだろう。",
      ],
      description: "And...so, And...because, Since",
      link: "https://bunpro.jp/grammar_points/%E3%82%8F-%E3%82%8F%E3%81%A7",
      level: "n1",
    },
  },
  {
    failure: "No match found",
    sentence: "締め切りまでは一秒たりとも無駄にはできない。",
    tokenDump:
      "締め切り(名詞:*) | まで(助詞:*) | は(助詞:*) | 一(名詞:*) | 秒(名詞:*) | たり(助動詞:終止形-一般) | とも(助詞:*) | 無駄(名詞:*) | に(助動詞:連用形-ニ) | は(助詞:*) | でき(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "1-tari-tomo-nai",
      title: "１～たりとも～ない",
      level: "n1",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "一|１|1|壱",
          },
          {
            pos: "接尾辞|名詞|助数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surface: "一|１|1|壱",
          },
          {
            pos: "接尾辞|名詞|助数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surfaceStartsWith: "一|１|1|壱",
            pos: "名詞|数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surfaceStartsWith: "一|１|1|壱",
            pos: "名詞|数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
      ],
      tests: [
        "締め切りまでは一秒{たりとも無駄にはできない}。",
        "敵の前では、一歩{たりとも後退してはならない}。",
      ],
      description: "Not even one, Not a single, No (at all)",
      link: "https://bunpro.jp/grammar_points/%EF%BC%91-%E3%82%8A%E3%81%A8%E3%82%82-%E3%81%AA%E3%81%84",
    },
  },
  {
    failure: "No match found",
    sentence: "敵の前では、一歩たりとも後退してはならない。",
    tokenDump:
      "敵(名詞:*) | の(助詞:*) | 前(名詞:*) | で(助詞:*) | は(助詞:*) | 、(補助記号:*) | 一(名詞:*) | 歩(名詞:*) | たり(助詞:*) | と(助詞:*) | も(助詞:*) | 後退(名詞:*) | し(動詞:連用形-一般) | て(助詞:*) | は(助詞:*) | なら(動詞:未然形-一般) | ない(助動詞:終止形-一般) | 。(補助記号:*)",
    ruleJson: {
      id: "1-tari-tomo-nai",
      title: "１～たりとも～ない",
      level: "n1",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "一|１|1|壱",
          },
          {
            pos: "接尾辞|名詞|助数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surface: "一|１|1|壱",
          },
          {
            pos: "接尾辞|名詞|助数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surfaceStartsWith: "一|１|1|壱",
            pos: "名詞|数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "とも",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
        [
          {
            surfaceStartsWith: "一|１|1|壱",
            pos: "名詞|数詞",
          },
          {
            surface: "たり",
            pos: "助詞|助動詞|接続助詞",
            match: "start",
          },
          {
            surface: "と",
            pos: "助詞",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            wildcard: true,
          },
          {
            baseForm: "ない|ぬ|ず|得ない|不可",
            match: "end",
          },
        ],
      ],
      tests: [
        "締め切りまでは一秒{たりとも無駄にはできない}。",
        "敵の前では、一歩{たりとも後退してはならない}。",
      ],
      description: "Not even one, Not a single, No (at all)",
      link: "https://bunpro.jp/grammar_points/%EF%BC%91-%E3%82%8A%E3%81%A8%E3%82%82-%E3%81%AA%E3%81%84",
    },
  },
  {
    failure:
      '"このまま使っても差し支えないでしょう。" -> Matched text was "ても差し支えないでしょう" but expected "ても差し支えない"',
    sentence: "このまま使っても差し支えないでしょう。",
    tokenDump:
      "この(連体詞:*) | まま(名詞:*) | 使っ(動詞:連用形-促音便) | て(助詞:*) | も(助詞:*) | 差し(動詞:連用形-一般) | 支え(動詞:未然形-一般) | ない(助動詞:終止形-一般) | でしょう(助動詞:意志推量形) | 。(補助記号:*)",
    ruleJson: {
      id: "te-mo-sashitsukaenai",
      title: "ても差し支えない",
      level: "n1",
      matchAllConjugations: true,
      patterns: [
        [
          {
            surface: "て|で",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "差し|さし",
            pos: "動詞|名詞",
          },
          {
            surface: "支え|つかえ",
            pos: "動詞|名詞|接尾辞",
          },
          {
            baseForm: "ない|ある|ござる",
            match: "end",
          },
        ],
        [
          {
            surface: "て|で",
            pos: "助詞",
            match: "start",
          },
          {
            surface: "も",
            pos: "助詞",
          },
          {
            surface: "差し支え|さしつかえ",
            pos: "動詞|名詞",
          },
          {
            baseForm: "ない|ある|ござる",
            match: "end",
          },
        ],
      ],
      tests: [
        "少し遅れ{ても差し支えありません}。",
        "このまま使っ{ても差し支えない}でしょう。",
      ],
      description: "May, Is it a bother if, Do you mind if, Is it a problem if",
      link: "https://bunpro.jp/grammar_points/%E3%81%A6%E3%82%82%E5%B7%AE%E3%81%97%E6%94%AF%E3%81%88%E3%81%AA%E3%81%84",
    },
  },
];

async function run() {
  // var prompt = `Take the JSON objects and create a grammar rule for each object as per the attached spec. Deeply analyze the "casual_structure" rules to ensure your rule is correct. Include the "description", "link" and "level" properties from the input JSON. Return an array of updated rules (just the rules, no other output)`;
  var prompt = `These rules are currently failing. The failure message, input sentence, sudachi output for that sentence, and rule JSON are included. Fix the rules as per the attached spec and included sudachi output, and return an array of updated rules (just the rules, no other output)`;
  var groups = chunkArray(rules, 5);
  var results = await runBatchJob(groups, prompt, "./grammar/grammar.txt");
  var out = [];
  results.forEach((r) => {
    out = out.concat(r);
  });
  console.log(JSON.stringify(out, null, "  "));
}

function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

run();
