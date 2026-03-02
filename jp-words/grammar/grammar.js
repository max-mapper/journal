import { IyakuMatcher } from "./iyaku-matcher.js";
import { SAMPLE_SENTENCES } from "./sample-sentences.js";
import {
  buildAnnotatedHTML,
  buildTooltipData,
  fetchGzip,
  fetchJson,
} from "./ui-utils.js";

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
const outputDisplay = document.getElementById("output-display");
const statusBar = document.getElementById("status-bar");
const tooltip = document.getElementById("grammar-tooltip");
const tooltipContent = tooltip.querySelector(".tooltip-content");
const filterInputs = document.querySelectorAll(".pos-filter");
const toggleGrammar = document.getElementById("toggle-grammar");
const toggleFurigana = document.getElementById("toggle-furigana");
const btnPaste = document.getElementById("btn-paste");
const btnClear = document.getElementById("btn-clear");

inputText.innerHTML = SAMPLE_SENTENCES;

var n5Rules = await fetchJson("n5-grammar-rules.json");
var n4Rules = await fetchJson("n4-grammar-rules.json");
var n3Rules = await fetchJson("n3-grammar-rules.json");
var rules = [...n5Rules, ...n4Rules, ...n3Rules];
var sudachiUrl = "system.dic.gz";
var jmdictUrl = "jmdict.json.gz";

const sudachiDictBlob = await fetchGzip(sudachiUrl);
const jmdictBlob = await fetchGzip(jmdictUrl);

// Instantiate matcher state globally
const matcher = new IyakuMatcher();
window.matcher = matcher;

// Store the latest analysis in memory to avoid heavy DOM serialization
let currentAnalysisBlocks = [];

async function initResources() {
  try {
    statusBar.innerText = "Loading dictionaries...";
    await matcher.initialize({ sudachiDictBlob, jmdictBlob, rules });
    statusBar.innerText = "Ready (Offline Capable)";
    runAnalysis();
  } catch (err) {
    statusBar.innerText = "Error: " + err.message;
    console.error(err);
  }
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

  outputDisplay.innerHTML = buildAnnotatedHTML(
    currentAnalysisBlocks,
    "sentence-token overlapping-match",
    "sentence-token",
  );
}

let hoverTimeout;
let activeElement = null;

function highlightRange(start, end, fullStart = start, fullEnd = end) {
  const spans = outputDisplay.querySelectorAll(".sentence-token");
  spans.forEach((span) => {
    const spanStart = parseInt(span.dataset.start);
    const spanEnd = parseInt(span.dataset.end);

    // Clear previous highlights
    span.classList.remove("highlighted-token", "highlighted-full-token");

    // Primary highlight takes precedence
    if (spanStart >= start && spanEnd <= end) {
      span.classList.add("highlighted-token");
    }
    // Apply secondary full context highlight to remaining tokens
    else if (spanStart >= fullStart && spanEnd <= fullEnd) {
      span.classList.add("highlighted-full-token");
    }
  });
}

function clearHighlight() {
  const spans = outputDisplay.querySelectorAll(".sentence-token");
  spans.forEach((span) => {
    span.classList.remove("highlighted-token", "highlighted-full-token");
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

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  const hoverStart = parseInt(el.dataset.start);
  const hoverEnd = parseInt(el.dataset.end);

  const { html, activeTabIndex, groupedItems } = buildTooltipData(
    hoverStart,
    hoverEnd,
    currentAnalysisBlocks,
    matcher,
  );

  if (!html) {
    hideTooltip();
    return;
  }

  tooltipContent.innerHTML = html;

  if (groupedItems.length > 0) {
    const activeItem = groupedItems[activeTabIndex];
    highlightRange(
      activeItem.startIndex,
      activeItem.endIndex,
      activeItem.fullStartIndex ?? activeItem.startIndex,
      activeItem.fullEndIndex ?? activeItem.endIndex,
    );
  }

  // Attach Event Listeners to Tabs
  const tabBtns = tooltipContent.querySelectorAll(".tab-btn");
  const panels = tooltipContent.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", (e) => {
      const idx = parseInt(e.target.dataset.idx);

      tabBtns.forEach((b, i) => b.classList.toggle("active", i === idx));
      panels.forEach((p, i) => p.classList.toggle("active", i === idx));

      // Extract accurate values directly from the logical array instead of just DOM attributes
      const item = groupedItems[idx];
      highlightRange(
        item.startIndex,
        item.endIndex,
        item.fullStartIndex ?? item.startIndex,
        item.fullEndIndex ?? item.endIndex,
      );
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
  hoverTimeout = setTimeout(hideTooltip, 200000);
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
