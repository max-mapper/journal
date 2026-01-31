/* app-utils.js */

// --- Constants & Data ---
const EXAMPLE_CSV = `"tags","kanji","readings","definition"
"1","出す","だ|す","to take out / to submit"
"1","大人","おとな","adult"
"1","見える","み|える","to be visible"
"1","出る","で|る","to go out / to exit"`;

// --- UI & Setup Helpers ---

function loadPreset() {
  const val = document.getElementById("preset-list").value;
  if (val === "example") {
    document.getElementById("csv-input").value = EXAMPLE_CSV;
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
  // document.getElementById("stat-perfect").innerText = stats.perfect;
  // document.getElementById("stat-imperfect").innerText = stats.imperfect;
  document.getElementById("stat-progress").innerText =
    `${currentWordIndex}/${totalWords}`;
}

function updateWordProgress(kanjiArray, currentIndex) {
  const container = document.getElementById("word-progress-display");
  container.innerHTML = "";
  kanjiArray.forEach((char, idx) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (idx < currentIndex) span.className = "correct";
    else if (idx === currentIndex) span.className = "current-char-highlight";
    else if (isKana(char)) span.className = "kana-char";
    else span.className = "pending-char";

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
  if (!isFinish) {
    startIndex = Math.max(0, currentWordIndex - 10);
  }

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

  try {
    Calligraphy.Writer.Shared.StrokeEngine =
      new Calligraphy.Writer.StrokeEngine(
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
    Calligraphy.Writer.Shared.StrokeManager.setBrushOpacity(1);
  } catch (e) {
    console.error("Engine Error", e);
  }
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

function toggleOutline(writerInstance) {
  if (writerInstance) {
    writerInstance.showOutline();
    setTimeout(() => writerInstance.hideOutline(), 1000);
  }
}
