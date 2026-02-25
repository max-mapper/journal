import { runBatchJob } from "./batch-ai.js";
import * as fs from "node:fs";

// var rules = JSON.parse(fs.readFileSync("grammar/n5-grammar-rules.json"));
// var rules = JSON.parse(fs.readFileSync("grammar/n4-grammar-rules.json"));
var rules = [
  {
    failure: "No match found",
    sentence: "私にとって",
    tokenDump:
      "私(代名詞:*) | に(助詞:*) | とっ(動詞:連用形-促音便) | て(助詞:*)",
    ruleJson: {
      id: "ni-totte",
      title: "にとって",
      patterns: [
        [
          {
            pos: "名詞|代名詞|接尾辞",
          },
          {
            surface: "に",
            match: "start",
          },
          {
            baseForm: "取る",
            conjugation: "連用形",
          },
          {
            surface: "て",
            match: "end",
          },
        ],
      ],
      tests: ["私{にとって}"],
      link: "https://bunpro.jp/grammar_points/%E3%81%AB%E5%8F%96%E3%81%A3%E3%81%A6",
      description: "To, For, Concerning",
    },
  },
  {
    failure: "No match found",
    sentence: "行こうとしない",
    tokenDump:
      "行こう(動詞:意志推量形) | と(助詞:*) | し(動詞:未然形-一般) | ない(助動詞:終止形-一般)",
    ruleJson: {
      id: "youto-shinai",
      title: "ようとしない",
      patterns: [
        [
          {
            pos: "動詞",
            conjugation: "未然形|意志推量形",
          },
          {
            surface: "よう|う",
            match: "start",
          },
          {
            surface: "と",
          },
          {
            baseForm: "する",
            conjugation: "未然形",
          },
          {
            surface: "ない",
            match: "end",
          },
        ],
      ],
      tests: ["行こ{うとしない}"],
      link: "https://bunpro.jp/grammar_points/-%E3%82%88%E3%81%86%E3%81%A8%E3%81%97%E3%81%AA%E3%81%84",
      description:
        "Not willing to, Not make an effort to, To not attempt or try to, Volitional + としない",
    },
  },
  {
    failure:
      '"もしかしたら来るかもしれない" -> Matched text was "もしかしたら来る" but expected "もしかしたら"',
    sentence: "もしかしたら来るかもしれない",
    tokenDump:
      "もし(副詞:*) | か(助詞:*) | し(動詞:連用形-一般) | たら(助動詞:仮定形-一般) | 来る(動詞:終止形-一般) | か(助詞:*) | も(助詞:*) | しれ(動詞:未然形-一般) | ない(助動詞:終止形-一般)",
    ruleJson: {
      id: "moshikashitara",
      title: "もしかしたら",
      patterns: [
        [
          {
            surface: "もし",
            match: "start",
          },
          {
            surface: "か",
          },
          {
            surface: "し",
          },
          {
            surface: "たら",
            match: "end",
          },
        ],
      ],
      tests: ["{もしかしたら}来るかもしれない"],
      link: "https://bunpro.jp/grammar_points/%E3%82%82%E3%81%97%E3%81%8B%E3%81%97%E3%81%9F%E3%82%89",
      description: "Perhaps, Maybe, Possibly",
    },
  },
  {
    failure: "No match found",
    sentence: "めったに見ない",
    tokenDump:
      "めった(形状詞:*) | に(助動詞:連用形-ニ) | 見(動詞:未然形-一般) | ない(助動詞:終止形-一般)",
    ruleJson: {
      id: "mettani-nai",
      title: "めったに〜ない",
      patterns: [
        [
          {
            surface: "めった",
            match: "start",
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
      ],
      tests: ["{めったに見ない}"],
      link: "https://bunpro.jp/grammar_points/%E3%82%81%E3%81%A3%E3%81%9F%E3%81%AB-%E3%81%AA%E3%81%84",
      description: "Hardly, Rarely, Seldom",
    },
  },
  {
    failure: "No match found",
    sentence: "行こうとする",
    tokenDump: "行こう(動詞:意志推量形) | と(助詞:*) | する(動詞:終止形-一般)",
    ruleJson: {
      id: "outo-suru",
      title: "ようとする",
      patterns: [
        [
          {
            pos: "動詞",
            conjugation: "未然形|意志推量形",
          },
          {
            surface: "よう|う",
            match: "start",
          },
          {
            surface: "と",
          },
          {
            baseForm: "する",
            match: "end",
          },
        ],
      ],
      tests: ["行こ{うとする}"],
      link: "https://bunpro.jp/grammar_points/verb-volitional%E3%81%A8%E3%81%99%E3%82%8B",
      description: "Try to, Attempt to, To be about to",
    },
  },
  {
    failure: "No match found",
    sentence: "行こうとした",
    tokenDump:
      "行こう(動詞:意志推量形) | と(助詞:*) | し(動詞:連用形-一般) | た(助動詞:終止形-一般)",
    ruleJson: {
      id: "outo-shita",
      title: "ようとした",
      patterns: [
        [
          {
            pos: "動詞",
            conjugation: "未然形|意志推量形",
          },
          {
            surface: "よう|う",
            match: "start",
          },
          {
            surface: "と",
          },
          {
            baseForm: "する",
            conjugation: "連用形",
          },
          {
            surface: "た",
            match: "end",
          },
        ],
      ],
      tests: ["行こ{うとした}"],
      link: "https://bunpro.jp/grammar_points/verb-volitional%E3%81%A8%E3%81%99%E3%82%8B",
      description: "Try to, Attempt to, To be about to",
    },
  },
  {
    failure: "No match found",
    sentence: "行こうとしたが",
    tokenDump:
      "行こう(動詞:意志推量形) | と(助詞:*) | し(動詞:連用形-一般) | た(助動詞:終止形-一般) | が(助詞:*)",
    ruleJson: {
      id: "outo-shita-ga",
      title: "ようとしたが",
      patterns: [
        [
          {
            pos: "動詞",
            conjugation: "未然形|意志推量形",
          },
          {
            surface: "よう|う",
            match: "start",
          },
          {
            surface: "と",
          },
          {
            baseForm: "する",
            conjugation: "連用形",
          },
          {
            surface: "た",
          },
          {
            surface: "が",
            match: "end",
          },
        ],
      ],
      tests: ["行こ{うとしたが}"],
      link: "https://bunpro.jp/grammar_points/verb-volitional-%E3%81%A8%E3%81%97%E3%81%9F%E3%81%8C",
      description:
        "Tried to ~ but ~, Was about to ~ but ~, Was going to ~ but ~",
    },
  },
  {
    failure: "No match found",
    sentence: "行こうとしたら",
    tokenDump:
      "行こう(動詞:意志推量形) | と(助詞:*) | し(動詞:連用形-一般) | たら(助動詞:仮定形-一般)",
    ruleJson: {
      id: "outo-shitara",
      title: "ようとしたら",
      patterns: [
        [
          {
            pos: "動詞",
            conjugation: "未然形|意志推量形",
          },
          {
            surface: "よう|う",
            match: "start",
          },
          {
            surface: "と",
          },
          {
            baseForm: "する",
            conjugation: "連用形",
          },
          {
            surface: "たら",
            match: "end",
          },
        ],
      ],
      tests: ["行こ{うとしたら}"],
      link: "https://bunpro.jp/grammar_points/verb-volitional-%E3%81%A8%E3%81%97%E3%81%9F%E3%81%8C",
      description:
        "Tried to ~ but ~, Was about to ~ but ~, Was going to ~ but ~",
    },
  },
  {
    failure: '"それもありだ" -> Matched text was "ありだ" but expected "あり"',
    sentence: "それもありだ",
    tokenDump:
      "それ(代名詞:*) | も(助詞:*) | あり(動詞:連用形-一般) | だ(助動詞:終止形-一般)",
    ruleJson: {
      id: "ari",
      title: "あり",
      patterns: [
        [
          {
            surface: "あり",
            pos: "名詞|動詞",
            match: "exact",
          },
        ],
      ],
      tests: ["それも{あり}だ"],
      link: "https://bunpro.jp/grammar_points/%E3%81%92%E3%82%8A",
      description: "Possibility, To have, With",
    },
  },
  {
    failure:
      '"食べかけだ" -> Matched text was "食べかけだ" but expected "かけだ"',
    sentence: "食べかけだ",
    tokenDump: "食べかけ(名詞:*) | だ(助動詞:終止形-一般)",
    ruleJson: {
      id: "kake-da",
      title: "かけだ",
      patterns: [
        [
          {
            surfaceEndsWith: "かけ",
            match: "start",
          },
          {
            baseForm: "だ",
            pos: "助動詞",
            match: "end",
          },
        ],
      ],
      tests: ["食べ{かけだ}"],
      link: "https://bunpro.jp/grammar_points/%E3%81%8B%E3%81%91",
      description: "Half-, Not yet finished, About to, Begin to",
    },
  },
  {
    failure: '"焼きたて" -> Matched text was "焼きたて" but expected "たて"',
    sentence: "焼きたて",
    tokenDump: "焼きたて(名詞:*)",
    ruleJson: {
      id: "tate",
      title: "たて",
      patterns: [
        [
          {
            surfaceEndsWith: "たて",
            pos: "名詞",
            match: "exact",
          },
        ],
      ],
      tests: ["焼き{たて}"],
      link: "https://bunpro.jp/grammar_points/%E3%81%9F%E3%81%A6",
      description: "Freshly ~ed, Just ~ed",
    },
  },
  {
    failure:
      '"出来たてのパン" -> Matched text was "出来たての" but expected "たての"',
    sentence: "出来たてのパン",
    tokenDump: "出来たて(名詞:*) | の(助詞:*) | パン(名詞:*)",
    ruleJson: {
      id: "tate-no",
      title: "たての",
      patterns: [
        [
          {
            surfaceEndsWith: "たて",
            pos: "名詞",
            match: "start",
          },
          {
            surface: "の",
            match: "end",
          },
        ],
      ],
      tests: ["出来{たての}パン"],
      link: "https://bunpro.jp/grammar_points/%E3%81%9F%E3%81%A6",
      description: "Freshly ~ed, Just ~ed",
    },
  },
  {
    failure:
      '"できたら行く" -> Matched text was "できたら行く" but expected "できたら"',
    sentence: "できたら行く",
    tokenDump:
      "でき(動詞:連用形-一般) | たら(助動詞:仮定形-一般) | 行く(動詞:終止形-一般)",
    ruleJson: {
      id: "dekitara",
      title: "できたら",
      patterns: [
        [
          {
            surface: "でき",
            pos: "動詞",
            match: "start",
          },
          {
            surface: "たら",
            pos: "助詞|助動詞",
            match: "end",
          },
        ],
      ],
      tests: ["{できたら}行く"],
      link: "https://bunpro.jp/grammar_points/%E3%81%A7%E3%81%8D%E3%82%8C%E3%81%B0-%E3%81%A7%E3%81%8D%E3%81%9F%E3%82%89",
      description: "If possible",
    },
  },
  {
    failure: '"安っぽい" -> Matched text was "安っぽい" but expected "っぽい"',
    sentence: "安っぽい",
    tokenDump: "安っぽい(形容詞:終止形-一般)",
    ruleJson: {
      id: "ppoi-iadj",
      title: "っぽい",
      patterns: [
        [
          {
            surfaceEndsWith: "っぽい",
            pos: "形容詞",
            match: "exact",
          },
        ],
      ],
      tests: ["安{っぽい}"],
      link: "https://bunpro.jp/grammar_points/%E3%81%A3%E3%81%BD%E3%81%84",
      description: "-ish, -like, Characteristic of, Typical of, Tendency to",
    },
  },
];
// var rules = JSON.parse(fs.readFileSync("grammar/n3-grammar-rules.json"));
// var rules = [...n5Rules]; //, ...n4Rules, ...n3Rules];

async function run() {
  // var prompt = `Take these rules and mark the correct "match" keys in the patterns based on the tests. Double check the rules are consistent with the spec document. Print only the updated JSON, nothing else.`;
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
