var fs = require("fs");
var dict = require("./jmdict-eng-3.6.2.json");

var simple = { index: {}, defs: [] };
for (var x of dict.words) {
  var keys = [];
  for (var kanji of x.kanji) {
    keys.push(kanji.text);
  }
  for (var kana of x.kana) {
    keys.push(kana.text);
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

fs.writeFileSync("./jmdict.json", JSON.stringify(simple));
