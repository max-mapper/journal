/* app-utils.js */

// --- UI & Setup Helpers ---

function animCJKLoader(char, onComplete, onError) {
  fetch(`animcjk/${char}.json`)
    .then((res) => res.json())
    .then(onComplete)
    .catch(onError);
}

function kanjiVGCharDataLoader(char, onComplete, onError) {
  const codePoint = char.codePointAt(0);
  let filename = codePoint.toString(16).toLowerCase().padStart(5, "0");
  if (isKana(char)) {
    // kanjivg kana is broken
    animCJKLoader(char, onComplete, onError);
    return;
  }
  fetch(`kanjivg/${filename}.svg`)
    .then(async (res) => {
      if (!res.ok) throw new Error("Not found");
      let svg = await res.text();
      let json = processKanjiSVG(svg);
      return bufferObjectStrokes(json);
    })
    .then(onComplete)
    .catch(onError);
}

// Helper to forward events to Hanzi Writer's SVG
function dispatchToHanziWriter(type, e, x, y) {
  const svg = document.querySelector("#character-target svg");
  if (!svg) return;

  // Create a MouseEvent or TouchEvent to dispatch
  // HanziWriter typically listens to mouse/touch events on the SVG
  // We need to construct a synthetic event.
  // Note: HanziWriter relies on clientX/clientY in the event object

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  // Create the event
  const eventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: clientX,
    clientY: clientY,
    screenX: clientX,
    screenY: clientY,
  };

  let simEvent;
  // Determine event type mapping
  if (type === "mousedown") simEvent = new MouseEvent("mousedown", eventInit);
  else if (type === "mousemove")
    simEvent = new MouseEvent("mousemove", eventInit);
  else if (type === "mouseup") simEvent = new MouseEvent("mouseup", eventInit);
  else if (type === "touchstart")
    simEvent = new TouchEvent("touchstart", {
      ...eventInit,
      touches: e.touches,
      targetTouches: e.touches,
      changedTouches: e.changedTouches,
    });
  else if (type === "touchmove")
    simEvent = new TouchEvent("touchmove", {
      ...eventInit,
      touches: e.touches,
      targetTouches: e.touches,
      changedTouches: e.changedTouches,
    });
  else if (type === "touchend")
    simEvent = new TouchEvent("touchend", {
      ...eventInit,
      touches: e.touches,
      targetTouches: e.touches,
      changedTouches: e.changedTouches,
    });
  if (simEvent) svg.dispatchEvent(simEvent);
}

function updateStatus(content, color) {
  let statusEl = document.getElementById("status-text");
  statusEl.classList.toggle("pulse-on-change");
  statusEl.textContent = content;
  if (color) statusEl.style.color = color;
}

function loadPreset() {
  const val = document.getElementById("preset-list").value;
  if (val === "kanken9" && typeof kanken9 !== "undefined") {
    document.getElementById("csv-input").value = kanken9;
  } else if (val === "kanken10" && typeof kanken10 !== "undefined") {
    document.getElementById("csv-input").value = kanken10;
  } else {
    document.getElementById("csv-input").value = "";
  }
}

function toggleGuides() {
  const container = document.getElementById("canvas-container");
  const checkbox = document.getElementById("guide-toggle");
  if (checkbox.checked) container.classList.add("show-guides");
  else container.classList.remove("show-guides");
}

function restart() {
  location.reload();
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const data = [];
  const parseLine = (line) => {
    const result = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuote = !inQuote;
      else if (char === "," && !inQuote) {
        result.push(current);
        current = "";
      } else current += char;
    }
    result.push(current);
    return result;
  };

  lines.forEach((line) => {
    if (!line.trim()) return;
    const cols = parseLine(line).map((c) => c.trim());
    if (cols.length >= 4 && cols[1] !== "kanji") {
      data.push({
        tags: cols[0],
        kanji: cols[1],
        readingRaw: cols[2],
        def: cols[3],
      });
    }
  });
  return data;
}

function isKana(char) {
  // Range covers Hiragana, Katakana, and prolonged sound mark (ー)
  return /[\u3040-\u309f\u30a0-\u30ff\u30fc]/.test(char);
}

// --- Display Rendering ---

function updateStatsUI(stats, currentWordIndex, totalWords) {
  document.getElementById("stat-progress").innerText =
    `${currentWordIndex}/${totalWords}`;
}

function updateWordProgress(kanjiArray, currentIndex, activeKanjiSet) {
  const container = document.getElementById("word-progress-display");
  container.innerHTML = "";
  kanjiArray.forEach((char, idx) => {
    const span = document.createElement("span");
    span.textContent = char;

    if (idx < currentIndex) {
      span.className = "correct";
    } else if (idx === currentIndex) {
      span.className = "current-char-highlight";
    } else {
      // Future character
      if (isKana(char)) {
        span.className = "kana-char";
      } else if (activeKanjiSet && !activeKanjiSet.includes(char)) {
        // It is a Kanji, but not in the active set -> Skipped
        span.className = "non-level-kanji";
      } else {
        // It is a Kanji and is in the set (or no set active) -> Quiz
        span.className = "pending-char";
      }
    }

    container.appendChild(span);
  });
}

function showReviewScreen(
  isFinish,
  currentWordIndex,
  studyList,
  sessionResults,
) {
  document.getElementById("study-section").style.display = "none";
  document.getElementById("review-section").style.display = "flex";

  const grid = document.getElementById("review-grid");
  grid.innerHTML = "";

  const title = document.getElementById("review-title");
  title.textContent = isFinish ? "Session Complete!" : "Review Checkpoint";

  const btn = document.getElementById("review-continue-btn");
  btn.style.display = isFinish ? "none" : "block";

  let startIndex = 0;
  const limit = currentWordIndex;

  for (let i = startIndex; i < limit; i++) {
    const data = studyList[i];
    const res = sessionResults[i];
    if (!res) continue;

    const card = document.createElement("div");
    card.className = `review-card ${res.perfect ? "perfect" : "imperfect"}`;

    let readingDisp = data.readingRaw.replace("|", "");

    card.innerHTML = `
        <div class="review-kanji">${data.kanji}</div>
        <div class="review-reading">${readingDisp}</div>
        <div class="review-def">${data.def}</div>
        <div class="review-stats">${
          res.perfect ? "Perfect" : "Review Needed"
        }</div>
      `;

    card.onclick = () => {
      window.open(
        `https://jotoba.de/search/0/${encodeURIComponent(data.kanji)}`,
        "_blank",
      );
    };

    grid.appendChild(card);
  }
}

// --- Calligraphy Engine Wrappers ---

function initCalligraphy(width, height) {
  var canvas = $("#write-canvas");
  var layeredCanvas = $("#layered-canvas");
  var handCanvas = $("#hand-canvas");
  var canvasE = canvas.get(0);
  var layeredCanvasE = layeredCanvas.get(0);

  canvasE.width = width;
  canvasE.height = height;
  layeredCanvasE.width = width;
  layeredCanvasE.height = height;
  handCanvas[0].width = width;
  handCanvas[0].height = height;

  Calligraphy.Writer.Shared.StrokeEngine = new Calligraphy.Writer.StrokeEngine(
    canvasE.width,
    canvasE.height,
    canvas,
    layeredCanvasE,
  );
  Calligraphy.Writer.Shared.StrokeManager =
    new Calligraphy.Writer.StrokeManager(
      handCanvas,
      Calligraphy.Writer.Shared.StrokeEngine,
    );
  Calligraphy.Writer.Shared.StrokeManager.isHandVisible = false;
  Calligraphy.Writer.Shared.StrokeManager.start();
}

function clearCanvas() {
  if (Calligraphy.Writer.Shared.StrokeManager) {
    Calligraphy.Writer.Shared.StrokeManager.clearHistory();
  }
}

function undoStroke() {
  if (Calligraphy.Writer.Shared.StrokeManager) {
    Calligraphy.Writer.Shared.StrokeManager.undoStroke();
  }
}

function setBrush(name) {
  if (Calligraphy.Writer.Shared.StrokeManager) {
    Calligraphy.Writer.Shared.StrokeManager.selectBrush(name);
  }
}

function setBrushOpacity(val) {
  if (Calligraphy.Writer.Shared.StrokeManager) {
    Calligraphy.Writer.Shared.StrokeManager.setBrushOpacity(val);
  }
}
