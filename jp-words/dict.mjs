// UI Elements
const modal = document.getElementById("dictionary-modal");
const modalTitle = document.getElementById("modal-title");
const modalResults = document.getElementById("modal-results");
const closeBtn = document.querySelector(".close-btn");

async function fetchAndGunzip(url) {
  // 1. Fetch the compressed resource
  const response = await fetch(url);

  if (!response.body) throw new Error("No response body");

  // 2. Pipe the stream through DecompressionStream
  const ds = new DecompressionStream("gzip");
  const decompressedStream = response.body.pipeThrough(ds);

  // 3. Consume the stream and convert to Uint8Array
  // Response.blob() or Response.arrayBuffer() efficiently handles streaming data
  const blob = await new Response(decompressedStream).blob();
  return blob;
}

// Close Modal Logic
closeBtn.onclick = () => modal.classList.add("hidden");
window.onclick = (event) => {
  if (event.target == modal) modal.classList.add("hidden");
};

// Handle Word Click
document.addEventListener("click", async (e) => {
  let kanji = e.target.getAttribute("data-kanji");
  if (!kanji) return;
  openModal(kanji);
  searchDictionary(kanji);
});

function openModal(word) {
  modalTitle.textContent = `Searching for "${word}"...`;
  modalResults.innerHTML = '<p class="center">Querying database...</p>';
  modal.classList.remove("hidden");
}

function isKanji(ch) {
  return (ch >= "\u4e00" && ch <= "\u9faf") || ch === "々";
}

function isKana(char) {
  // Range covers Hiragana, Katakana, and prolonged sound mark (ー)
  return /[\u3040-\u309f\u30a0-\u30ff\u30fc]/.test(char);
}

let db;
async function searchDictionary(term) {
  if (!db) {
    let blob = await fetchAndGunzip("jpdict.json.gz");
    db = JSON.parse(await blob.text());
    window.db = db;
  }

  var idx = db.index[term];
  if (!idx) {
    console.log([term, term.length]);
    if (term.length > 1) {
      let last = term[term.length - 1];
      let lastlast = term[term.length - 2];
      console.log([lastlast, last]);

      if (isKanji(lastlast) && isKana(last)) {
        console.log("try dropping last kana", term.slice(0, term.length - 1));
        idx = db.index[term.slice(0, term.length - 1)];
      }
    } else {
      idx = [];
    }
  }
  var results = db.defs[idx[0]];
  renderSimpleResult(term, results);
}

function renderSimpleResult(term, results) {
  modalTitle.textContent = term;

  if (results) {
    let out = "";
    for (const g of results) {
      out += `<div class="entry">
        <p><i>${g.info}</i></p>
        <p>${g.gloss.join(", ")}</p>
      </div>`;
    }
    modalResults.innerHTML = out;
  } else {
    modalResults.innerHTML = `<p>No definition found for "${term}".</p>`;
  }
}
