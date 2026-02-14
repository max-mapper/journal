import { runBatchJob } from "./batch-ai.js";
import GRAMMAR_RULES from "./grammar-rules.js";

async function run() {
  var prompt = ``;

  var groups = chunkArray(GRAMMAR_RULES, 5);
  var results = await runBatchJob(groups, prompt, "./bunpron4n5.csv");
  var out = [];
  results.forEach((r) => {
    out = out.concat(r);
  });
  console.log(JSON.stringify(results, null, "  "));
}

function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

run();
