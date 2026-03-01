import { POS_LABEL_MAP, JMDICT_TAG_MAP } from "./mappings.js";

export function generateRuby(surface, reading) {
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

export async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

export async function fetchGzip(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  const ds = new DecompressionStream("gzip");
  const stream = response.body.pipeThrough(ds);
  return await new Response(stream).blob();
}

export function generateDictHTML(
  surface,
  dictForm,
  dictReading,
  surfaceReading,
  pos,
  entryGroups,
  tenseData = null,
) {
  if (!entryGroups || entryGroups.length === 0) return "";
  let out = `<div class="dict-header-container"><div class="dict-header-left">`;
  const titleHtml = generateRuby(dictForm, dictReading);

  out += `<h3 class="dict-header-title">${titleHtml}</h3>`;
  out += `<div class="badge-container">`;
  const englishPos = POS_LABEL_MAP[pos] || pos;
  if (englishPos) out += `<span class="pos-badge">${englishPos}</span>`;
  out += `</div></div>`;

  if (tenseData && tenseData.length > 0) {
    const surfaceTitleHtml = generateRuby(surface, surfaceReading);

    out += `<div class="dict-header-right">
    <h3 class="dict-header-title">${surfaceTitleHtml}</h3>
    <div class="conjugation-group">`;
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

  out += `<a class="ext-link" href="https://jotoba.de/search/0/${encodeURIComponent(dictForm)}" target="_blank">View on Jotoba</a>`;
  return out;
}

export function buildAnnotatedHTML(blocks, overlapClass, baseClass) {
  let maxIndex = 0;
  for (const b of blocks) {
    if (b.endIndex > maxIndex) maxIndex = b.endIndex;
  }

  const baseTokens = new Array(maxIndex);
  for (const b of blocks) {
    for (let i = 0; i < b.endIndex - b.startIndex; i++) {
      baseTokens[b.startIndex + i] = b.tokens[i];
    }
  }

  const matchBlocks = blocks.filter(
    (b) => b.type === "grammar" || (b.type === "word" && b.isMatch),
  );
  matchBlocks.forEach((b, i) => (b._id = i));

  const tokenGroups = [];
  let currentGroup = null;

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

  let html = "";
  for (const group of tokenGroups) {
    const content = group.tokens
      .map((t) => generateRuby(t.surface, t.reading))
      .join("");

    if (group.overlapping.length > 0) {
      html += `<span class="${overlapClass}" data-start="${group.startIndex}" data-end="${group.endIndex}">${content}</span>`;
    } else {
      html += `<span class="${baseClass}" data-start="${group.startIndex}" data-end="${group.endIndex}">${content}</span>`;
    }
  }
  return html;
}

export function buildTooltipData(
  hoverStart,
  hoverEnd,
  currentAnalysisBlocks,
  matcher,
) {
  let minStart = hoverStart;
  let maxEnd = hoverEnd;

  const matchBlocks = currentAnalysisBlocks.filter(
    (b) => b.type === "grammar" || (b.type === "word" && b.isMatch),
  );

  let changed = true;
  const connectedBlocks = new Set();

  while (changed) {
    changed = false;
    for (const block of matchBlocks) {
      if (connectedBlocks.has(block)) continue;
      if (block.startIndex < maxEnd && block.endIndex > minStart) {
        connectedBlocks.add(block);
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
    return { html: null, activeTabIndex: 0, groupedItems: [] };
  }

  const overlappingBlocks = Array.from(connectedBlocks);
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

      if (block.innerWords && block.innerWords.length > 0) {
        block.innerWords.forEach((word) => {
          const innerText = word.surface || word.kanji;
          const syntheticWordBlock = {
            type: "word",
            dictForm: word.kanji,
            surface: innerText,
            pos: word.pos,
            posArray: word.posArray,
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

    const isDuplicate = existingGroup.items.some((existingItem) => {
      if (existingItem.type !== item.type) return false;
      if (item.type === "word") {
        return existingItem.block.dictForm === item.block.dictForm;
      } else {
        return existingItem.block.ruleData.id === item.block.ruleData.id;
      }
    });

    if (!isDuplicate) existingGroup.items.push(item);

    existingGroup.startIndex = Math.min(
      existingGroup.startIndex,
      item.startIndex,
    );
    existingGroup.endIndex = Math.max(existingGroup.endIndex, item.endIndex);
  });

  // Sort logically: Priority to earlier start indexes, then longer spans
  groupedItems.sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    return b.endIndex - a.endIndex;
  });

  let activeTabIndex = 0;

  // 1. Longest match starting exactly at the hovered token
  // Because the array is sorted by startIndex ASC, then endIndex DESC (longest first),
  // finding the first one that matches the hover start will inherently find the longest.
  let bestMatchIdx = groupedItems.findIndex((g) => g.startIndex === hoverStart);

  if (bestMatchIdx !== -1) {
    activeTabIndex = bestMatchIdx;
  } else {
    // 2. If hovering over a middle element, default to the shortest encompassing match.
    // This allows the user to drill down easily into smaller tokens inside of a larger structure.
    let shortestEncompassingIdx = -1;
    let minLength = Infinity;

    for (let i = 0; i < groupedItems.length; i++) {
      const g = groupedItems[i];
      if (g.startIndex <= hoverStart && g.endIndex >= hoverEnd) {
        const length = g.endIndex - g.startIndex;
        if (length < minLength) {
          minLength = length;
          shortestEncompassingIdx = i;
        }
      }
    }

    if (shortestEncompassingIdx !== -1) {
      activeTabIndex = shortestEncompassingIdx;
    }
  }

  let headerHtml = `<div class="tooltip-tabs">`;
  groupedItems.forEach((group, idx) => {
    const activeClass = idx === activeTabIndex ? "active" : "";
    const isGrammar = group.items.some((item) => item.type === "grammar");
    const typeClass = isGrammar ? "grammar" : "dictionary";

    headerHtml += `<button class="tab-btn ${typeClass} ${activeClass}" data-idx="${idx}">
      ${group.text}
    </button>`;
  });
  headerHtml += `</div>`;

  let panelsHtml = `<div class="tooltip-panels">`;
  groupedItems.forEach((group, idx) => {
    const activeClass = idx === activeTabIndex ? "active" : "";
    panelsHtml += `<div class="tab-panel ${activeClass}" id="tab-panel-${idx}" data-start="${group.startIndex}" data-end="${group.endIndex}">`;

    group.items.forEach((item, itemIdx) => {
      if (itemIdx > 1) panelsHtml += `<hr class="panel-separator" />`;
      const block = item.block;

      if (item.type === "grammar") {
        panelsHtml += `
          <div class="grammar-section">
            <h3 class="grammar-title">
              ${block.ruleData.title}
              <span class="badge-container">
                <span class="pos-badge">
                  ${block.ruleData.link !== "#" ? `<a href="${block.ruleData.link}" target="_blank">Grammar Point</a>` : "(Grammar Point)"}
                </span>
              </span>
            </h3>
            <p class="grammar-desc">${block.ruleData.description}</p>
            
          </div>
        `;
      } else if (item.type === "word") {
        const surface = block.surface;
        const dictForm = block.dictForm;
        const pos = block.pos;
        const posArray = block.posArray || [pos];
        const entryGroups = matcher.searchDictionary(dictForm, posArray);

        let tenseData = block.tense ? block.tense : null;

        if (entryGroups && entryGroups.length > 0) {
          const dictReading = matcher.getReading(dictForm);
          const surfaceReading = matcher.getReading(surface);
          panelsHtml += generateDictHTML(
            surface,
            dictForm,
            dictReading,
            surfaceReading,
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

  return { html: headerHtml + panelsHtml, activeTabIndex, groupedItems };
}
