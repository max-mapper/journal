import { IyakuMatcher } from "./iyaku-matcher.js";
import { POS_LABEL_MAP, JMDICT_TAG_MAP } from "./mappings.js";
import { SAMPLE_SENTENCES } from "./sample-sentences.js";

// 1. Register the Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) =>
      console.log("Service Worker Registered with scope:", registration.scope),
    )
    .catch((error) =>
      console.error("Service Worker registration failed:", error),
    );
}

const inputText = document.getElementById("input-text");
inputText.innerHTML = SAMPLE_SENTENCES;
// inputText.innerHTML = "ジュースを友達にあげます。";
const outputDisplay = document.getElementById("output-display");
const statusBar = document.getElementById("status-bar");
const tooltip = document.getElementById("grammar-tooltip");
const tooltipContent = tooltip.querySelector(".tooltip-content");
const filterInputs = document.querySelectorAll(".pos-filter");
const toggleGrammar = document.getElementById("toggle-grammar");
const toggleFurigana = document.getElementById("toggle-furigana");
const btnPaste = document.getElementById("btn-paste");
const btnClear = document.getElementById("btn-clear");

// Instantiate matcher state globally
const matcher = new IyakuMatcher();
window.matcher = matcher;

async function initResources() {
  try {
    statusBar.innerText = "Loading dictionaries...";
    await matcher.initialize();
    statusBar.innerText = "Ready (Offline Capable)";
    runAnalysis();
  } catch (err) {
    statusBar.innerText = "Error: " + err.message;
    console.error(err);
  }
}

function generateRuby(surface, reading) {
  if (!reading || surface === reading || !/[\u4e00-\u9faf]/.test(surface))
    return surface;
  let sEnd = surface.length,
    rEnd = reading.length;
  while (sEnd > 0 && rEnd > 0 && surface[sEnd - 1] === reading[rEnd - 1]) {
    sEnd--;
    rEnd--;
  }
  let sStart = 0,
    rStart = 0;
  while (
    sStart < sEnd &&
    rStart < rEnd &&
    surface[sStart] === reading[rStart]
  ) {
    sStart++;
    rStart++;
  }
  const prefix = surface.substring(0, sStart);
  const suffix = surface.substring(sEnd);
  const coreS = surface.substring(sStart, sEnd);
  const coreR = reading.substring(rStart, rEnd);
  return coreS
    ? `${prefix}<ruby>${coreS}<rt>${coreR}</rt></ruby>${suffix}`
    : surface;
}

function renderBlocksToHTML(blocks) {
  let html = "";
  for (const block of blocks) {
    if (block.type === "grammar") {
      const content = block.tokens
        .map((t) => generateRuby(t.surface, t.reading))
        .join("");
      const innerJson =
        block.innerWords.length > 0
          ? encodeURIComponent(JSON.stringify(block.innerWords))
          : "";

      html += `<span class="grammar-match" 
                     data-type="grammar"
                     data-title="${block.ruleData.title}" 
                     data-desc="${block.ruleData.description}" 
                     data-link="${block.ruleData.link || "#"}"
                     data-inner-defs="${innerJson}">${content}</span>`;
    } else if (block.type === "word") {
      const content = block.tokens
        .map((t) => generateRuby(t.surface, t.reading))
        .join("");
      if (block.isMatch) {
        const tenseAttr = block.tense
          ? `data-tense="${encodeURIComponent(JSON.stringify(block.tense))}"`
          : "";

        html += `<span class="dict-match" 
                       data-type="dict"
                       data-kanji="${block.dictForm}"
                       data-surface="${block.surface}"
                       data-pos="${block.pos}"
                       ${tenseAttr}>${content}</span>`;
      } else {
        html += content;
      }
    }
  }
  return html;
}

function runAnalysis() {
  const text = inputText.value;
  if (!text.trim()) {
    outputDisplay.innerHTML = "";
    return;
  }

  const activePOS = new Set();
  filterInputs.forEach((input) => {
    if (input.checked) activePOS.add(input.value);
  });

  const isGrammarEnabled = toggleGrammar.checked;
  const blocks = matcher.match(text, { activePOS, isGrammarEnabled });
  outputDisplay.innerHTML = renderBlocksToHTML(blocks);
}

function generateDictHTML(
  surface,
  dictForm,
  reading,
  pos,
  entryGroups,
  tenseData = null,
) {
  if (!entryGroups || entryGroups.length === 0) return "";
  let out = `<div class="dict-header-container"><div class="dict-header-left">`;
  const titleHtml = generateRuby(surface, reading);

  out += `<h3>${titleHtml}</h3><div class="badge-container">`;
  const englishPos = POS_LABEL_MAP[pos] || pos;
  if (englishPos) out += `<span class="pos-badge">${englishPos}</span>`;
  if (dictForm && dictForm !== surface) {
    out += `<span class="pos-badge dict-ref">Dict: ${dictForm}</span>`;
  }
  out += `</div></div>`;

  if (tenseData && tenseData.length > 0) {
    out += `<div class="dict-header-right"><div class="conjugation-group">`;
    tenseData.forEach((t) => {
      out += `<div class="conjugation-item">
                <span class="conjugation-tag">${t.name}</span>
                <span class="conjugation-desc">${t.description}</span>
              </div>`;
    });
    out += `</div></div>`;
  }
  out += `</div>`;

  entryGroups.forEach((senses, index) => {
    out += `<div class="dict-entry-group">`;
    if (entryGroups.length > 1) out += `<h4>Entry ${index + 1}</h4>`;
    senses.forEach((sense) => {
      const decodedPos =
        sense.partOfSpeech && sense.partOfSpeech.length
          ? sense.partOfSpeech
              .map((code) => JMDICT_TAG_MAP[code] || code)
              .join(", ")
          : "";
      out += `<div class="entry">
                ${decodedPos ? `<span class="pos-tag-decoded">[${decodedPos}]</span><br/>` : ""}
                ${sense.info && sense.info.length ? `<span style="color:#e67e22; font-size:0.9em;">[${sense.info.join(", ")}]</span><br/>` : ""}
                ${sense.gloss.join(", ")}
              </div>`;
    });
    out += `</div>`;
  });

  out += `<a class="ext-link" href="${`https://jotoba.de/search/0/${encodeURIComponent(dictForm)}`}" target="_blank">View on Jotoba</a>`;
  return out;
}

let hoverTimeout;
let activeElement = null;

async function showTooltip(el) {
  const type = el.dataset.type;
  tooltip.style.display = "block";
  tooltipContent.innerHTML = "Loading...";

  const rect = el.getBoundingClientRect();
  const tooltipWidth = 320;
  let top = window.scrollY + rect.bottom + 5;
  let left = window.scrollX + rect.left;
  if (left + tooltipWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - tooltipWidth - 20;
  }
  if (left < 10) left = 10;
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  if (type === "grammar") {
    let content = `
      <div class="grammar-section">
        <h3>${el.dataset.title}</h3>
        <p>${el.dataset.desc}</p>
        ${el.dataset.link !== "#" ? `<a class="ext-link" href="${el.dataset.link}" target="_blank">Check Bunpro &rarr;</a>` : ""}
      </div>
    `;

    if (el.dataset.innerDefs) {
      try {
        const innerDefs = JSON.parse(decodeURIComponent(el.dataset.innerDefs));
        let hasDict = false;
        for (const word of innerDefs) {
          const entryGroups = matcher.searchDictionary(word.kanji, word.pos);
          if (entryGroups) {
            if (!hasDict) {
              content += `<div class="embedded-dict-header">Words in this pattern:</div>`;
              hasDict = true;
            }

            const reading = matcher.getReading(word.surface || word.kanji);
            console.log(
              "Words in this pattern getReading",
              word.surface || word.kanji,
              { word, reading },
            );
            content += `<div class="embedded-dict-section">`;
            content += generateDictHTML(
              word.surface || word.kanji,
              word.kanji,
              reading,
              word.pos,
              entryGroups,
              word.tense,
            );
            content += `</div>`;
          }
        }
      } catch (e) {
        console.error("Failed to parse inner defs", e);
      }
    }
    tooltipContent.innerHTML = content;
  } else {
    const dictForm = el.dataset.kanji;
    const surface = el.dataset.surface;
    const pos = el.dataset.pos;
    const entryGroups = matcher.searchDictionary(dictForm, pos);

    if (activeElement !== el) return;
    let contentHtml = "";
    let tenseData = null;

    if (el.dataset.tense) {
      try {
        tenseData = JSON.parse(decodeURIComponent(el.dataset.tense));
      } catch (e) {
        console.error("Failed to parse tense data", e);
      }
    }

    if (entryGroups && entryGroups.length > 0) {
      const reading = matcher.getReading(surface);
      contentHtml += generateDictHTML(
        surface,
        dictForm,
        reading,
        pos,
        entryGroups,
        tenseData,
      );
    } else {
      contentHtml += "No definitions found matching this part of speech.";
    }
    tooltipContent.innerHTML = contentHtml;
  }
}

function hideTooltip() {
  tooltip.style.display = "none";
  if (activeElement) {
    activeElement.classList.remove("active");
    activeElement = null;
  }
}

function scheduleHide() {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(hideTooltip, 200);
}

function cancelHide() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
}

outputDisplay.addEventListener("mouseover", (e) => {
  const match = e.target.closest(".grammar-match, .dict-match");
  if (match) {
    cancelHide();
    if (activeElement !== match) {
      if (activeElement) activeElement.classList.remove("active");
      activeElement = match;
      activeElement.classList.add("active");
      showTooltip(match);
    }
  }
});

outputDisplay.addEventListener("mouseout", (e) => {
  const match = e.target.closest(".grammar-match, .dict-match");
  if (match) {
    if (e.relatedTarget && match.contains(e.relatedTarget)) return;
    scheduleHide();
  }
});

tooltip.addEventListener("mouseenter", cancelHide);
tooltip.addEventListener("mouseleave", scheduleHide);

btnPaste.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    runAnalysis();
  } catch (err) {
    alert("Failed to read clipboard contents: " + err);
  }
});

btnClear.addEventListener("click", () => {
  inputText.value = "";
  runAnalysis();
});

const allToggles = [...filterInputs, toggleGrammar];
allToggles.forEach((input) => {
  input.addEventListener("change", runAnalysis);
});

toggleFurigana.addEventListener("change", (e) => {
  if (e.target.checked) document.body.classList.remove("hide-furigana");
  else document.body.classList.add("hide-furigana");
});

let timeout;
inputText.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(runAnalysis, 400);
});

// Boot the application
initResources();
