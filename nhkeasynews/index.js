import fs from "fs";
import zlib from "zlib";
import path from "path";
import * as cheerio from "cheerio";
import { SudachiStateless, TokenizeMode } from "sudachi-wasm333";

// Helper: Converts Hiragana to Katakana
function hiraToKata(str) {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60),
  );
}

// Helper: Escapes strings for CSV format
function escapeCsv(str) {
  if (str == null) return "";
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Helper: Checks if a string contains at least one Japanese character (Hiragana, Katakana, Kanji, or 々)
function hasJapaneseChars(str) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3005]/.test(str);
}

async function run() {
  const folderPath = "./nhkeasier.epub/EPUB/text"; // <--- Change this to your folder path if needed

  // Initialize Sudachi-wasm333
  // Note: Adjust initialization if the specific version of sudachi-wasm333
  // requires 'await Sudachi.init()' or a different instantiation method.
  // 1. Read the gzipped file from the disk
  const dictPath = "/home/max/src/node/iyaku/public/dictionaries/system.dic.gz";
  const compressedBuffer = fs.readFileSync(dictPath);

  // 2. Unzip the file using Node's built-in zlib
  const decompressedBuffer = zlib.gunzipSync(compressedBuffer);

  // 3. Convert the Node Buffer to a Uint8Array for the WASM module
  const dictUint8Array = new Uint8Array(decompressedBuffer);

  // 4. Initialize Sudachi
  const sudachi = new SudachiStateless();
  await sudachi.initialize_from_bytes(dictUint8Array);

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    if (!file.endsWith(".xhtml")) continue;

    const filePath = path.join(folderPath, file);
    const html = fs.readFileSync(filePath, "utf-8");
    const $ = cheerio.load(html);

    // 1. Extract Kanji words and their furigana from <ruby> tags
    const rubyMap = new Map();
    $("ruby").each((_, el) => {
      const rb = $(el).clone();
      const rt = rb.find("rt").text().trim();
      rb.find("rt").remove();
      const kanji = rb.text().trim();
      if (kanji && rt) {
        rubyMap.set(kanji, rt);
      }
    });

    // 2. Remove <rt> tags from the real DOM so the text becomes plain Japanese
    $("rt").remove();

    // 3. Extract the clean text of the page
    let plainText = $("body").text();
    plainText = plainText.replace(/\s+/g, " ").trim();

    if (!plainText) continue;

    let tokens;
    try {
      // 4. Run text through Sudachi
      tokens = JSON.parse(
        sudachi.tokenize_stringified(plainText, TokenizeMode.A),
      );
    } catch (err) {
      console.error(`Error processing ${file} with Sudachi:`, err);
      continue;
    }

    // Prepare CSV header
    let csvData =
      "Surface,Normalized_Form,Reading_Form,Dictionary_Form,Poses,Original_Furigana,Different\n";

    // 5. Process tokens and generate CSV rows
    for (const token of tokens) {
      const surface = token.surface || "";

      // --- NEW FILTERING LOGIC ---

      const posesArr = Array.isArray(token.poses) ? token.poses : [];
      // Get the primary Part-of-Speech tag (e.g., "名詞", "補助記号")
      const primaryPos =
        posesArr[0] ||
        (typeof token.poses === "string" ? token.poses.split("-")[0] : "");

      // Skip punctuation and whitespace
      if (primaryPos === "空白" || primaryPos === "補助記号") {
        continue;
      }

      // Skip words that don't contain any Japanese characters (e.g., "16", "mm", "NHK")
      if (!hasJapaneseChars(surface)) {
        continue;
      }

      // ---------------------------

      const norm = token.normalized_form || "";
      const read = token.reading_form || "";
      const dict = token.dictionary_form || "";
      const posesStr = Array.isArray(token.poses)
        ? token.poses.join("-")
        : token.poses || "";

      let originalFurigana = "";
      let isDifferent = false;

      // A) EXACT MATCH
      if (rubyMap.has(surface)) {
        originalFurigana = rubyMap.get(surface);
        const expectedKata = hiraToKata(originalFurigana);
        isDifferent = !(read === expectedKata || dict === expectedKata);
      } else {
        // B) OKURIGANA MATCH (Stricter match from previous fix)
        let foundPartial = false;
        for (const [kanji, furi] of rubyMap.entries()) {
          if (surface.startsWith(kanji)) {
            const remainder = surface.slice(kanji.length);
            if (/^[\u3040-\u30FF]+$/.test(remainder)) {
              originalFurigana = furi;
              const expectedKata = hiraToKata(furi);
              isDifferent = !(
                read.startsWith(expectedKata) || dict.startsWith(expectedKata)
              );
              foundPartial = true;
              break;
            }
          }
        }

        // C) COMPOUND SPLIT MATCH
        if (!foundPartial) {
          for (const [kanji, furi] of rubyMap.entries()) {
            if (kanji.includes(surface)) {
              originalFurigana = furi + " (partial)";
              isDifferent = "check";
              break;
            }
          }
        }
      }

      // Append row to CSV Data
      csvData +=
        [
          escapeCsv(surface),
          escapeCsv(norm),
          escapeCsv(read),
          escapeCsv(dict),
          escapeCsv(posesStr),
          escapeCsv(originalFurigana),
          originalFurigana ? escapeCsv(isDifferent.toString()) : "",
        ].join(",") + "\n";
    }

    // 6. Save CSV file
    const csvPath = path.join(folderPath, file + ".csv");
    fs.writeFileSync(csvPath, csvData, "utf-8");
    console.log(`Saved: ${file}.csv`);
  }
}

run().catch(console.error);
