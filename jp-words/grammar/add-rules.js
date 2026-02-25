import { GRAMMAR_RULES } from "./grammar-rules.js";
import { readFileSync } from "node:fs";

var out = [];
var run = async function () {
  let file = JSON.parse(readFileSync(process.argv[2]));
  file.forEach((f) => {
    var rules = [];
    for (var i = 1; i <= 6; i++) {
      var k = `rule${i}`;
      if (f[k]) rules.push(JSON.parse(f[k]));
    }
    if (!rules.length) return console.error("no rules", f);
    var url = `https://bunpro.jp/grammar_points/${encodeURIComponent(f.slug)}`;
    var idx = GRAMMAR_RULES.findIndex((e) => e.link === url);
    if (idx === -1) console.error("no match", f.slug);
    var match;
    if (idx) {
      match = GRAMMAR_RULES[idx];
      if (match) GRAMMAR_RULES.splice(idx, 1);
    }

    rules.forEach((r) => {
      // console.log(r);
      var updated = {
        ...r,
        link: url,
        description: match ? match.description : f.meaning,
      };
      out.push(updated);
    });
  });
  // console.log(out.length);
  // console.log(GRAMMAR_RULES);
  console.log(JSON.stringify(out, null, "  "));
};

run();
