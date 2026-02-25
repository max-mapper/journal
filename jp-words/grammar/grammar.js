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

function renderOverlappingBlocksToHTML(blocks) {
  // First, figure out the total length of the tokens array from the blocks
  let maxIndex = 0;
  for (const b of blocks) {
    if (b.endIndex > maxIndex) maxIndex = b.endIndex;
  }

  // Reconstruct the base tokens
  const baseTokens = new Array(maxIndex);
  for (const b of blocks) {
    for (let i = 0; i < b.endIndex - b.startIndex; i++) {
      baseTokens[b.startIndex + i] = b.tokens[i];
    }
  }

  // Pre-filter just to matching blocks and assign a unique ID so we can group identical overlaps
  const matchBlocks = blocks.filter(
    (b) => b.type === "grammar" || (b.type === "word" && b.isMatch),
  );
  matchBlocks.forEach((b, i) => (b._id = i));

  const tokenGroups = [];
  let currentGroup = null;

  // Group adjacent tokens logically if they exactly share the same matching blocks
  for (let i = 0; i < baseTokens.length; i++) {
    const token = baseTokens[i];
    if (!token) continue;

    const overlapping = matchBlocks.filter(
      (b) => i >= b.startIndex && i < b.endIndex,
    );
    const overlappingIds = overlapping.map((b) => b._id).join(",");

    if (currentGroup && currentGroup.overlappingIds === overlappingIds) {
      currentGroup.tokens.push(token);
      currentGroup.endIndex = i + 1;
    } else {
      currentGroup = {
        tokens: [token],
        overlapping,
        overlappingIds,
        startIndex: i,
        endIndex: i + 1,
      };
      tokenGroups.push(currentGroup);
    }
  }

  // Finally, render HTML
  let html = "";
  for (const group of tokenGroups) {
    const content = group.tokens
      .map((t) => generateRuby(t.surface, t.reading))
      .join("");

    if (group.overlapping.length > 0) {
      const blocksJson = encodeURIComponent(JSON.stringify(group.overlapping));
      html += `<span class="sentence-token overlapping-match" 
                     data-start="${group.startIndex}"
                     data-end="${group.endIndex}"
                     data-blocks="${blocksJson}"
                     style="text-decoration: underline; text-decoration-color: blue; text-decoration-thickness: 2px; text-underline-offset: 3px; cursor: pointer;">${content}</span>`;
    } else {
      html += `<span class="sentence-token" data-start="${group.startIndex}" data-end="${group.endIndex}">${content}</span>`;
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
  const blocks = matcher.matchAll(text, { activePOS, isGrammarEnabled });
  outputDisplay.innerHTML = renderOverlappingBlocksToHTML(blocks);
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

  out += `<h3 style="margin-top: 0;">${titleHtml}</h3>`;
  out += `<div class="badge-container">`;
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

function highlightRange(start, end) {
  const spans = outputDisplay.querySelectorAll(".sentence-token");
  spans.forEach((span) => {
    const spanStart = parseInt(span.dataset.start);
    const spanEnd = parseInt(span.dataset.end);
    if (spanStart >= start && spanEnd <= end) {
      span.style.backgroundColor = "rgba(46, 204, 113, 0.4)"; // Light green highlight
      span.style.borderRadius = "3px";
    } else {
      span.style.backgroundColor = "";
    }
  });
}

function clearHighlight() {
  const spans = outputDisplay.querySelectorAll(".sentence-token");
  spans.forEach((span) => {
    span.style.backgroundColor = "";
  });
}

async function showTooltip(el) {
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

  if (!el.dataset.blocks) return;
  const overlappingBlocks = JSON.parse(decodeURIComponent(el.dataset.blocks));

  // Flatten normal blocks and "innerWords" into a unified items array
  const extractedItems = [];
  overlappingBlocks.forEach((block) => {
    if (block.type === "grammar") {
      const text = block.tokens.map((t) => t.surface).join("");
      extractedItems.push({
        text: text,
        type: "grammar",
        block: block,
        startIndex: block.startIndex,
        endIndex: block.endIndex,
      });

      // Extract inner words to elevate them to the top-level tabs
      if (block.innerWords && block.innerWords.length > 0) {
        block.innerWords.forEach((word) => {
          const innerText = word.surface || word.kanji;
          const syntheticWordBlock = {
            type: "word",
            dictForm: word.kanji,
            surface: innerText,
            pos: word.pos,
            tense: word.tense,
            startIndex: block.startIndex,
            endIndex: block.endIndex,
          };
          extractedItems.push({
            text: innerText,
            type: "word",
            block: syntheticWordBlock,
            startIndex: block.startIndex,
            endIndex: block.endIndex,
          });
        });
      }
    } else if (block.type === "word") {
      extractedItems.push({
        text: block.surface,
        type: "word",
        block: block,
        startIndex: block.startIndex,
        endIndex: block.endIndex,
      });
    }
  });

  // Group items by their text to avoid duplicate tabs
  const groupedItems = [];
  extractedItems.forEach((item) => {
    let existingGroup = groupedItems.find((g) => g.text === item.text);
    if (!existingGroup) {
      existingGroup = {
        text: item.text,
        items: [],
        startIndex: item.startIndex,
        endIndex: item.endIndex,
      };
      groupedItems.push(existingGroup);
    }

    // Prevent duplicate dictionary or grammar entries within the same tab
    const isDuplicate = existingGroup.items.some((existingItem) => {
      if (existingItem.type !== item.type) return false;
      if (item.type === "word") {
        return existingItem.block.dictForm === item.block.dictForm;
      } else {
        return existingItem.block.ruleData.id === item.block.ruleData.id;
      }
    });

    if (!isDuplicate) {
      existingGroup.items.push(item);
    }

    // Expand highlight range if this item covers more
    existingGroup.startIndex = Math.min(
      existingGroup.startIndex,
      item.startIndex,
    );
    existingGroup.endIndex = Math.max(existingGroup.endIndex, item.endIndex);
  });

  // 1. Build Tab Navigation Header
  let headerHtml = `<div class="tooltip-tabs" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">`;
  groupedItems.forEach((group, idx) => {
    // Default to the first tab being active
    const bg = idx === 0 ? "#3498db" : "#ecf0f1";
    const color = idx === 0 ? "#fff" : "#2c3e50";
    const border = idx === 0 ? "#2980b9" : "#bdc3c7";

    headerHtml += `<button class="tab-btn" data-idx="${idx}" 
      style="cursor: pointer; padding: 4px 10px; border: 1px solid ${border}; border-radius: 12px; 
             background-color: ${bg}; color: ${color}; font-size: 0.85em; font-weight: 600; 
             transition: all 0.2s ease;">
      ${group.text}
    </button>`;
  });
  headerHtml += `</div>`;

  // 2. Build Tab Content Panels
  let panelsHtml = `<div class="tooltip-panels">`;
  groupedItems.forEach((group, idx) => {
    panelsHtml += `<div class="tab-panel" id="tab-panel-${idx}" data-start="${group.startIndex}" data-end="${group.endIndex}" style="display: ${idx === 0 ? "block" : "none"};">`;

    group.items.forEach((item, itemIdx) => {
      // Separator if a single tab contains multiple results (e.g. Dict + Grammar)
      if (itemIdx > 0) {
        panelsHtml += `<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;" />`;
      }

      const block = item.block;

      if (item.type === "grammar") {
        panelsHtml += `
          <div class="grammar-section">
            <h3 style="color: #2ecc71; margin-top: 0; margin-bottom: 5px;">
              ${block.ruleData.title} <span style="font-size: 0.6em; color: #7f8c8d; font-weight: normal; vertical-align: middle;">(Grammar)</span>
            </h3>
            <p style="margin: 0 0 10px 0;">${block.ruleData.description}</p>
            ${block.ruleData.link !== "#" ? `<a class="ext-link" href="${block.ruleData.link}" target="_blank">Check Bunpro &rarr;</a>` : ""}
          </div>
        `;
        // Inner words have been hoisted to their own tabs; no need to render here.
      } else if (item.type === "word") {
        const dictForm = block.dictForm;
        const surface = block.surface;
        const pos = block.pos;
        const entryGroups = matcher.searchDictionary(dictForm, pos);

        let tenseData = null;
        if (block.tense) {
          tenseData = block.tense;
        }

        if (entryGroups && entryGroups.length > 0) {
          const reading = matcher.getReading(surface);
          panelsHtml += generateDictHTML(
            surface,
            dictForm,
            reading,
            pos,
            entryGroups,
            tenseData,
          );
        } else {
          panelsHtml += `
            <div class="dict-header-container">
              <h3 style="color: #3498db; margin-top: 0;">${surface}</h3>
            </div>
            <p>No definitions found matching this part of speech.</p>`;
        }
      }
    });

    panelsHtml += `</div>`;
  });
  panelsHtml += `</div>`;

  tooltipContent.innerHTML = headerHtml + panelsHtml;

  // Initial highlight for the first tab
  if (groupedItems.length > 0) {
    highlightRange(groupedItems[0].startIndex, groupedItems[0].endIndex);
  }

  // 3. Attach Event Listeners to Tabs
  const tabBtns = tooltipContent.querySelectorAll(".tab-btn");
  const panels = tooltipContent.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.idx);

      // Update Tab Styling
      tabBtns.forEach((b, i) => {
        if (i === idx) {
          b.style.backgroundColor = "#3498db";
          b.style.color = "#fff";
          b.style.borderColor = "#2980b9";
        } else {
          b.style.backgroundColor = "#ecf0f1";
          b.style.color = "#2c3e50";
          b.style.borderColor = "#bdc3c7";
        }
      });

      // Update Panel Visibility
      panels.forEach((p, i) => {
        p.style.display = i === idx ? "block" : "none";
      });

      // Update Highlight Range
      const start = parseInt(panels[idx].dataset.start);
      const end = parseInt(panels[idx].dataset.end);
      highlightRange(start, end);
    });
  });
}

function hideTooltip() {
  tooltip.style.display = "none";
  if (activeElement) {
    activeElement.classList.remove("active");
    activeElement = null;
  }
  clearHighlight();
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
  const match = e.target.closest(".overlapping-match");
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
  const match = e.target.closest(".overlapping-match");
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
