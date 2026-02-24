const testCases = [
  {
    input: "ジュースを友達にあげます。",
    expected: [
      {
        type: "word",
        isMatch: true,
        surface: "ジュース",
        tokens: [{ surface: "ジュース", reading: "じゅーす" }],
        pos: "名詞",
        dictForm: "ジュース",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "を",
        tokens: [{ surface: "を", reading: "を" }],
        pos: "助詞",
        dictForm: "を",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "友達",
        tokens: [{ surface: "友達", reading: "ともだち" }],
        pos: "名詞",
        dictForm: "友達",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "に",
        tokens: [{ surface: "に", reading: "に" }],
        pos: "助詞",
        dictForm: "に",
        tense: null,
      },
      {
        type: "grammar",
        ruleData: {
          id: "giving-verbs",
          level: "N5",
          title: "あげる",
          description: "To give (away), To present, To provide",
          link: "https://bunpro.jp/grammar_points/%E3%81%82%E3%81%92%E3%82%8B",
          patterns: [
            [{ baseForm: "あげる", pos: "動詞" }],
            [{ baseForm: "やる", pos: "動詞" }],
            [{ baseForm: "差し上げる", pos: "動詞" }],
            [{ surface: "差し" }, { baseForm: "上げる" }],
          ],
          tests: [
            "友達にお菓子をあげました。",
            "花に水をやりに行く。",
            "ご来店いただいた先着１００名様にプレゼントを差し上げます。",
          ],
        },
        tokens: [
          { surface: "あげ", reading: "あげ" },
          { surface: "ます", reading: "ます" },
        ],
        innerWords: [
          {
            kanji: "あげる",
            surface: "あげます",
            pos: "動詞",
            tense: [
              {
                name: "Polite (Masu)",
                description:
                  "Standard polite form used in general conversation.",
              },
            ],
          },
        ],
      },
      {
        type: "word",
        isMatch: false,
        surface: "。",
        tokens: [{ surface: "。", reading: "。" }],
        pos: "補助記号",
        dictForm: "。",
        tense: null,
      },
    ],
  },
  {
    input: "ながれてきた",
    expected: [
      {
        type: "grammar",
        ruleData: {
          id: "verb-te-casual-request",
          title: "Verb[て]",
          description: "Please do for me (Casual request)",
          link: "https://bunpro.jp/grammar_points/verb%E3%81%A6-request",
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
        tokens: [
          {
            surface: "ながれ",
            reading: "ながれ",
          },
          {
            surface: "て",
            reading: "て",
          },
        ],
        innerWords: [
          {
            kanji: "ながれる",
            surface: "ながれて",
            pos: "動詞",
            tense: [
              {
                name: "Te-Form",
                description:
                  "Connective form for requests, linking verbs, etc.",
              },
            ],
          },
        ],
      },
      {
        type: "word",
        isMatch: true,
        surface: "きた",
        tokens: [
          {
            surface: "き",
            reading: "き",
          },
          {
            surface: "た",
            reading: "た",
          },
        ],
        pos: "動詞",
        dictForm: "くる",
        tense: [
          {
            name: "Past (Ta)",
            description: "Casual past tense.",
          },
        ],
      },
    ],
  },
  {
    input: "明日は雨がふると思います。",
    expected: [
      {
        type: "word",
        isMatch: true,
        surface: "明日",
        tokens: [
          {
            surface: "明日",
            reading: "あす",
          },
        ],
        pos: "名詞",
        dictForm: "明日",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "は",
        tokens: [
          {
            surface: "は",
            reading: "は",
          },
        ],
        pos: "助詞",
        dictForm: "は",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "雨",
        tokens: [
          {
            surface: "雨",
            reading: "あめ",
          },
        ],
        pos: "名詞",
        dictForm: "雨",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "が",
        tokens: [
          {
            surface: "が",
            reading: "が",
          },
        ],
        pos: "助詞",
        dictForm: "が",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "ふる",
        tokens: [
          {
            surface: "ふる",
            reading: "ふる",
          },
        ],
        pos: "動詞",
        dictForm: "ふる",
        tense: [
          {
            name: "Dictionary Form",
            description:
              "The basic, non-conjugated form found in dictionaries.",
          },
        ],
      },
      {
        type: "grammar",
        ruleData: {
          id: "to-omou",
          title: "とおもう",
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
          link: "https://bunpro.jp/grammar_points/%E3%81%A8%E3%81%8A%E3%82%82%E3%81%86",
          description: "I think",
        },
        tokens: [
          {
            surface: "と",
            reading: "と",
          },
          {
            surface: "思い",
            reading: "おもい",
          },
          {
            surface: "ます",
            reading: "ます",
          },
        ],
        innerWords: [
          {
            kanji: "思う",
            surface: "思います",
            pos: "動詞",
            tense: [
              {
                name: "Polite (Masu)",
                description:
                  "Standard polite form used in general conversation.",
              },
            ],
          },
        ],
      },
      {
        type: "word",
        isMatch: false,
        surface: "。",
        tokens: [
          {
            surface: "。",
            reading: "。",
          },
        ],
        pos: "補助記号",
        dictForm: "。",
        tense: null,
      },
    ],
  },
  {
    input: "パンを食べました。お腹が空いたからです。",
    expected: [
      {
        type: "word",
        isMatch: true,
        surface: "パン",
        tokens: [
          {
            surface: "パン",
            reading: "ぱん",
          },
        ],
        pos: "名詞",
        dictForm: "パン",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "を",
        tokens: [
          {
            surface: "を",
            reading: "を",
          },
        ],
        pos: "助詞",
        dictForm: "を",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "食べました",
        tokens: [
          {
            surface: "食べ",
            reading: "たべ",
          },
          {
            surface: "まし",
            reading: "まし",
          },
          {
            surface: "た",
            reading: "た",
          },
        ],
        pos: "動詞",
        dictForm: "食べる",
        tense: [
          {
            name: "Polite Past (Mashita)",
            description: "Polite past tense form.",
          },
        ],
      },
      {
        type: "word",
        isMatch: false,
        surface: "。",
        tokens: [
          {
            surface: "。",
            reading: "。",
          },
        ],
        pos: "補助記号",
        dictForm: "。",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "お腹",
        tokens: [
          {
            surface: "お腹",
            reading: "おなか",
          },
        ],
        pos: "名詞",
        dictForm: "お腹",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "が",
        tokens: [
          {
            surface: "が",
            reading: "が",
          },
        ],
        pos: "助詞",
        dictForm: "が",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "空いた",
        tokens: [
          {
            surface: "空い",
            reading: "あい",
          },
          {
            surface: "た",
            reading: "た",
          },
        ],
        pos: "動詞",
        dictForm: "空く",
        tense: [
          {
            name: "Past (Ta)",
            description: "Casual past tense.",
          },
        ],
      },
      {
        type: "grammar",
        ruleData: {
          id: "kara-reason",
          title: "から",
          description: "Because, Since",
          link: "https://bunpro.jp/grammar_points/%E3%81%8B%E3%82%89-because",
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
        tokens: [
          {
            surface: "から",
            reading: "から",
          },
          {
            surface: "です",
            reading: "です",
          },
        ],
        innerWords: [],
      },
      {
        type: "word",
        isMatch: false,
        surface: "。",
        tokens: [
          {
            surface: "。",
            reading: "。",
          },
        ],
        pos: "補助記号",
        dictForm: "。",
        tense: null,
      },
    ],
  },
  {
    input: "ゲームをしましょう。",
    expected: [
      {
        type: "word",
        isMatch: true,
        surface: "ゲーム",
        tokens: [
          {
            surface: "ゲーム",
            reading: "げーむ",
          },
        ],
        pos: "名詞",
        dictForm: "ゲーム",
        tense: null,
      },
      {
        type: "word",
        isMatch: true,
        surface: "を",
        tokens: [
          {
            surface: "を",
            reading: "を",
          },
        ],
        pos: "助詞",
        dictForm: "を",
        tense: null,
      },
      {
        type: "grammar",
        ruleData: {
          id: "mashou",
          title: "ましょう",
          patterns: [
            [
              {
                pos: "動詞",
                conjugation: "連用形",
              },
              {
                surface: "ましょ",
              },
              {
                surface: "う",
              },
            ],
            [
              {
                pos: "動詞",
                conjugation: "連用形",
              },
              {
                surface: "ましょう",
              },
            ],
          ],
          tests: ["元気出しましょう。", "また会いましょう。"],
          description: "Let's, Shall we (Polite volitional)",
          link: "https://bunpro.jp/grammar_points/%E3%81%BE%E3%81%97%E3%82%87%E3%81%86",
        },
        tokens: [
          {
            surface: "し",
            reading: "し",
          },
          {
            surface: "ましょう",
            reading: "ましょう",
          },
        ],
        innerWords: [
          {
            kanji: "する",
            surface: "しましょう",
            pos: "動詞",
            tense: [
              {
                name: "Polite Volitional (Mashou)",
                description: 'Polite suggestion or invitation ("Let\'s...").',
              },
            ],
          },
        ],
      },
      {
        type: "word",
        isMatch: false,
        surface: "。",
        tokens: [
          {
            surface: "。",
            reading: "。",
          },
        ],
        pos: "補助記号",
        dictForm: "。",
        tense: null,
      },
    ],
  },
];

export { testCases };
