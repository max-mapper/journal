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

// Store the latest analysis in memory to avoid heavy DOM serialization
let currentAnalysisBlocks = [];

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
      html += `<span class="sentence-token overlapping-match" 
                     data-start="${group.startIndex}"
                     data-end="${group.endIndex}">${content}</span>`;
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

  // Store results globally to bypass placing heavy JSON strings into the DOM
  currentAnalysisBlocks = matcher.matchAll(text, {
    activePOS,
    isGrammarEnabled,
  });
  outputDisplay.innerHTML = renderOverlappingBlocksToHTML(
    currentAnalysisBlocks,
  );
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

  out += `<h3 class="dict-header-title">${titleHtml}</h3>`;
  out += `<div class="badge-container">`;
  const englishPos = POS_LABEL_MAP[pos] || pos;
  if (englishPos) out += `<span class="pos-badge">${englishPos}</span>`;
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
                ${sense.info && sense.info.length ? `<span class="dict-sense-info">[${sense.info.join(", ")}]</span><br/>` : ""}
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
      span.classList.add("highlighted-token");
    } else {
      span.classList.remove("highlighted-token");
    }
  });
}

function clearHighlight() {
  const spans = outputDisplay.querySelectorAll(".sentence-token");
  spans.forEach((span) => {
    span.classList.remove("highlighted-token");
  });
}

async function showTooltip(el) {
  tooltip.classList.add("visible");
  tooltipContent.innerHTML = "Loading...";

  const rect = el.getBoundingClientRect();
  const tooltipWidth = 320;
  let top = window.scrollY + rect.bottom + 5;
  let left = window.scrollX + rect.left;
  if (left + tooltipWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - tooltipWidth - 20;
  }
  if (left < 10) left = 10;

  // Dynamic coordinates must remain handled by JS
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  // Start with the hovered element's boundaries
  let minStart = parseInt(el.dataset.start);
  let maxEnd = parseInt(el.dataset.end);

  // Filter only matching blocks from our in-memory cache
  const matchBlocks = currentAnalysisBlocks.filter(
    (b) => b.type === "grammar" || (b.type === "word" && b.isMatch),
  );

  let changed = true;
  const connectedBlocks = new Set();

  // Find the complete connected component of overlapping blocks directly from memory
  while (changed) {
    changed = false;
    for (const block of matchBlocks) {
      if (connectedBlocks.has(block)) continue;

      // If the block overlaps with our current continuous chunk
      if (block.startIndex < maxEnd && block.endIndex > minStart) {
        connectedBlocks.add(block);

        // Expand chunk bounds if necessary
        if (block.startIndex < minStart) {
          minStart = block.startIndex;
          changed = true;
        }
        if (block.endIndex > maxEnd) {
          maxEnd = block.endIndex;
          changed = true;
        }
      }
    }
  }

  if (connectedBlocks.size === 0) {
    hideTooltip();
    return;
  }

  const overlappingBlocks = Array.from(connectedBlocks);
  const extractedItems = [];

  // Flatten normal blocks and "innerWords" into a unified items array
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
  let headerHtml = `<div class="tooltip-tabs">`;
  groupedItems.forEach((group, idx) => {
    const activeClass = idx === 0 ? "active" : "";
    headerHtml += `<button class="tab-btn ${activeClass}" data-idx="${idx}">
      ${group.text}
    </button>`;
  });
  headerHtml += `</div>`;

  // 2. Build Tab Content Panels
  let panelsHtml = `<div class="tooltip-panels">`;
  groupedItems.forEach((group, idx) => {
    const activeClass = idx === 0 ? "active" : "";
    panelsHtml += `<div class="tab-panel ${activeClass}" id="tab-panel-${idx}" data-start="${group.startIndex}" data-end="${group.endIndex}">`;

    group.items.forEach((item, itemIdx) => {
      // Separator if a single tab contains multiple results (e.g. Dict + Grammar)
      if (itemIdx > 0) {
        panelsHtml += `<hr class="panel-separator" />`;
      }

      const block = item.block;

      if (item.type === "grammar") {
        panelsHtml += `
          <div class="grammar-section">
            <h3 class="grammar-title">
              ${block.ruleData.title} <span class="grammar-badge">(Grammar)</span>
            </h3>
            <p class="grammar-desc">${block.ruleData.description}</p>
            ${block.ruleData.link !== "#" ? `<a class="ext-link" href="${block.ruleData.link}" target="_blank">Check Bunpro &rarr;</a>` : ""}
          </div>
        `;
        // Inner words have been hoisted to their own tabs; no need to render here.
      } else if (item.type === "word") {
        const dictForm = block.dictForm;
        const pos = block.pos;
        const entryGroups = matcher.searchDictionary(dictForm, pos);

        let tenseData = null;
        if (block.tense) {
          tenseData = block.tense;
        }

        if (entryGroups && entryGroups.length > 0) {
          const dictReading = matcher.getReading(dictForm);
          panelsHtml += generateDictHTML(
            dictForm, // Using the dictForm in the header display
            dictForm,
            dictReading, // Reading of dictForm
            pos,
            entryGroups,
            tenseData,
          );
        } else {
          panelsHtml += `
            <div class="dict-header-container">
              <h3 class="dict-fallback-title">${dictForm}</h3>
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

      // Update Tab Styling via Classes
      tabBtns.forEach((b, i) => {
        if (i === idx) b.classList.add("active");
        else b.classList.remove("active");
      });

      // Update Panel Visibility via Classes
      panels.forEach((p, i) => {
        if (i === idx) p.classList.add("active");
        else p.classList.remove("active");
      });

      // Update Highlight Range
      const start = parseInt(panels[idx].dataset.start);
      const end = parseInt(panels[idx].dataset.end);
      highlightRange(start, end);
    });
  });
}

function hideTooltip() {
  tooltip.classList.remove("visible");
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
