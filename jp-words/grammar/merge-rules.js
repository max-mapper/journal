import * as fs from "node:fs";

var rules = JSON.parse(fs.readFileSync("grammar/n3-grammar-rules.json"));
var updated = JSON.parse(fs.readFileSync("n3-update.json"));

var out = [];

rules.forEach((r) => {
  let upd = updated.find((e) => e.id === r.id);
  if (upd) out.push(upd);
  else out.push(r);
});
console.log(JSON.stringify(out, null, "  "));
