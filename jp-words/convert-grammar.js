var fs = require("fs");

var files = [
  "./nihongo_no_sensei_grammar/term_bank_1.json",
  "./nihongo_no_sensei_grammar/term_bank_2.json",
  "./nihongo_no_sensei_grammar/term_bank_3.json",
  "./nihongo_no_sensei_grammar/term_bank_4.json",
  "./nihongo_no_sensei_grammar/term_bank_5.json",
];

var out = {};

files.forEach((f) => {
  require(f).forEach((e) => {
    var pt = {
      pattern: e[2],
      level: e[7].split("―")[1],
    };
    out[pt.pattern] = pt.level;
  });
});
console.log(JSON.stringify(out, null, "  "));
