function parseGrammarObject(data) {
  // 1. Flatten the content array into a single string
  let fullText = "";
  let extractedLink = null;

  data.content.forEach((item) => {
    if (typeof item === "string") {
      fullText += item;
    } else if (typeof item === "object") {
      if (item.tag === "span") {
        fullText += item.content;
      } else if (item.tag === "a") {
        extractedLink = item.href;
      }
    }
  });

  // 2. Helper: Extract text between two headers
  const extractSection = (text, startKey, endKey) => {
    // Regex looks for the StartKey, captures everything until EndKey
    const regex = new RegExp(`${startKey}([\\s\\S]*?)${endKey}`);
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  // 3. Extract Level
  // Looks for patterns like 【Ｎ１文法】 or 【Ｎ０文法】
  const levelMatch = fullText.match(/【(.*)文法】/);
  let level = "";
  if (levelMatch) {
    // Normalize Full-width characters (Ｎ, ０-９) to Half-width (N, 0-9)
    level = levelMatch[1].replace(/[Ｎ０-９]/g, (char) => {
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });
  }

  // 4. Extract Title
  // Remove the 【...】 part and take the rest of the first line
  const titleMatch = fullText.match(/【.*?】(.*?)\n/);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // 5. Extract Sections
  const rawConnections = extractSection(fullText, "接続", "意味");
  const connections = rawConnections
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const meaning = extractSection(fullText, "意味", "解説");
  const commentary = extractSection(fullText, "解説", "例文");

  // 6. Extract Sentences
  const sentencesBlock = extractSection(fullText, "例文", "備考");
  const sentences = [];

  // Regex Logic:
  // [（(]      -> Match opening parenthesis (full-width or half-width)
  // \d+        -> Match the number
  // [）)]      -> Match closing parenthesis
  // \s*        -> Match any whitespace (spaces/tabs) immediately following
  // ([^\n\r]+) -> Capture everything else until the end of the line (The Japanese Sentence)
  const sentenceRegex = /[（(][0-9０-９]+[）)]\s*([^\n\r]+)/g;

  let match;
  while ((match = sentenceRegex.exec(sentencesBlock)) !== null) {
    // match[1] contains the text of the line, excluding the number label
    sentences.push(match[1].trim());
  }

  // 7. Construct Result
  return {
    title: title,
    level: level,
    connections: connections,
    link: extractedLink,
    meaning: meaning,
    commentary: commentary,
    sentences: sentences,
  };
}

var fs = require("fs");

var files = [
  "./nihongo_no_sensei_grammar/term_bank_1.json",
  "./nihongo_no_sensei_grammar/term_bank_2.json",
  "./nihongo_no_sensei_grammar/term_bank_3.json",
  "./nihongo_no_sensei_grammar/term_bank_4.json",
  "./nihongo_no_sensei_grammar/term_bank_5.json",
];

var out = { rules: [] };

files.forEach((f) => {
  require(f).forEach((e) => {
    const result = parseGrammarObject(e[5][0]);
    out.rules.push(result);
  });
});
console.log(JSON.stringify(out, null, "  "));

// Execute

// Output JSON
// console.log(JSON.stringify(result, null, 4));
