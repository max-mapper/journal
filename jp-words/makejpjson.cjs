var fs = require("fs");
var dict = require("./jmdict-eng-common-3.6.2.json");

var simple = { index: {}, defs: [] };
for (var x of dict.words) {
  var keys = [];
  for (var kanji of x.kanji) {
    if (kanji.common) keys.push(kanji.text);
  }
  for (var kana of x.kana) {
    if (kana.common) keys.push(kana.text);
  }
  var val = x.sense.map((s) => {
    return {
      info: s.info,
      partOfSpeech: s.partOfSpeech,
      gloss: s.gloss.map((g) => {
        return g.text;
      }),
    };
  });

  simple.defs.push(val);
  var idx = simple.defs.length - 1;
  for (var k of keys) {
    if (!simple.index[k]) simple.index[k] = [];
    simple.index[k].push(idx);
  }
}

fs.writeFileSync("./jpdict.json", JSON.stringify(simple));
