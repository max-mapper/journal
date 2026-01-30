function processKanjiSVG(svgContent) {
  // Configuration for the coordinate transformation
  // Input: 109x109 box
  // Output: Top-Left (0, 900) to Bottom-Right (1024, -124)
  const INPUT_SIZE = 109;
  const TARGET_SIZE = 1024;
  const SCALE = TARGET_SIZE / INPUT_SIZE; // ~9.3945
  const OFFSET_Y = 900;

  /**
   * Transforms a single point (x, y) from KanjiVG space to target space.
   * Logic: x scales normally. y scales and flips (Subtract from 900).
   */
  const transformPoint = (x, y) => {
    const nx = x * SCALE;
    const ny = OFFSET_Y - y * SCALE;
    return [Math.round(nx), Math.round(ny)];
  };

  /**
   * Tokenizes an SVG path string into commands and numbers.
   */
  const tokenizePath = (d) => {
    // Regex matches single letters (commands) or numbers (including scientific notation)
    const regex = /([a-zA-Z])|([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(d)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  };

  const output = {
    strokes: [],
    medians: [],
  };

  // Extract all d attributes from <path> tags using regex
  // (Using regex is robust enough for standard XML/SVG files like KanjiVG)
  const pathMatches = svgContent.matchAll(/<path[^>]*d="([^"]+)"/g);

  for (const match of pathMatches) {
    const d = match[1];
    const tokens = tokenizePath(d);

    let currentStroke = "";
    let currentMedians = [];

    // State for path traversal
    let cursorX = 0;
    let cursorY = 0;
    // For 'M' command logic (subsequent points become L)
    let lastCmd = "";
    let idx = 0;

    while (idx < tokens.length) {
      let token = tokens[idx];
      let cmd = lastCmd;

      // If token is a letter, it's a new command
      if (/^[a-zA-Z]$/.test(token)) {
        cmd = token;
        lastCmd = token;
        idx++;
      }

      // If we have a command but the token was a number, it implies repetition (or implicit L after M)
      // Note: If lastCmd was M/m, subsequent coords are treated as L/l
      if (lastCmd === "M")
        cmd = idx === 1 || /^[a-zA-Z]$/.test(tokens[idx - 2]) ? "M" : "L";
      if (lastCmd === "m")
        cmd = idx === 1 || /^[a-zA-Z]$/.test(tokens[idx - 2]) ? "m" : "l";

      // Processing Commands
      switch (cmd) {
        case "M": {
          // Move Absolute
          const x = parseFloat(tokens[idx++]);
          const y = parseFloat(tokens[idx++]);
          const [tx, ty] = transformPoint(x, y);

          cursorX = x;
          cursorY = y;
          currentMedians.push([tx, ty]); // Start of path
          currentStroke += `M${tx},${ty}`;

          // Subsequent number pairs after M are treated as L (Absolute Line)
          lastCmd = "M"; // Reset to M for check, but logic inside loop handles conversion to L
          break;
        }
        case "m": {
          // Move Relative
          const dx = parseFloat(tokens[idx++]);
          const dy = parseFloat(tokens[idx++]);
          cursorX += dx;
          cursorY += dy;
          const [tx, ty] = transformPoint(cursorX, cursorY);

          currentMedians.push([tx, ty]);
          currentStroke += `M${tx},${ty}`; // Always output absolute M for result
          lastCmd = "m";
          break;
        }
        case "L": {
          // Line Absolute
          const x = parseFloat(tokens[idx++]);
          const y = parseFloat(tokens[idx++]);
          const [tx, ty] = transformPoint(x, y);

          cursorX = x;
          cursorY = y;
          currentMedians.push([tx, ty]); // End of segment
          currentStroke += `L${tx},${ty}`;
          break;
        }
        case "l": {
          // Line Relative
          const dx = parseFloat(tokens[idx++]);
          const dy = parseFloat(tokens[idx++]);
          cursorX += dx;
          cursorY += dy;
          const [tx, ty] = transformPoint(cursorX, cursorY);

          currentMedians.push([tx, ty]);
          currentStroke += `L${tx},${ty}`;
          break;
        }
        case "C": {
          // Cubic Bezier Absolute
          const x1 = parseFloat(tokens[idx++]);
          const y1 = parseFloat(tokens[idx++]);
          const x2 = parseFloat(tokens[idx++]);
          const y2 = parseFloat(tokens[idx++]);
          const x = parseFloat(tokens[idx++]);
          const y = parseFloat(tokens[idx++]);

          const [tx1, ty1] = transformPoint(x1, y1);
          const [tx2, ty2] = transformPoint(x2, y2);
          const [tx, ty] = transformPoint(x, y);

          cursorX = x;
          cursorY = y;
          currentMedians.push([tx, ty]);
          currentStroke += `C${tx1},${ty1} ${tx2},${ty2} ${tx},${ty}`;
          break;
        }
        case "c": {
          // Cubic Bezier Relative
          const dx1 = parseFloat(tokens[idx++]);
          const dy1 = parseFloat(tokens[idx++]);
          const dx2 = parseFloat(tokens[idx++]);
          const dy2 = parseFloat(tokens[idx++]);
          const dx = parseFloat(tokens[idx++]);
          const dy = parseFloat(tokens[idx++]);

          // Calculate absolute points for transformation
          const absX1 = cursorX + dx1;
          const absY1 = cursorY + dy1;
          const absX2 = cursorX + dx2;
          const absY2 = cursorY + dy2;
          const absX = cursorX + dx;
          const absY = cursorY + dy;

          const [tx1, ty1] = transformPoint(absX1, absY1);
          const [tx2, ty2] = transformPoint(absX2, absY2);
          const [tx, ty] = transformPoint(absX, absY);

          cursorX = absX;
          cursorY = absY;
          currentMedians.push([tx, ty]);
          // We convert relative input to absolute output for consistency
          currentStroke += `C${tx1},${ty1} ${tx2},${ty2} ${tx},${ty}`;
          break;
        }
        case "S": {
          // Smooth Cubic Absolute
          const x2 = parseFloat(tokens[idx++]);
          const y2 = parseFloat(tokens[idx++]);
          const x = parseFloat(tokens[idx++]);
          const y = parseFloat(tokens[idx++]);

          const [tx2, ty2] = transformPoint(x2, y2);
          const [tx, ty] = transformPoint(x, y);

          cursorX = x;
          cursorY = y;
          currentMedians.push([tx, ty]);
          currentStroke += `S${tx2},${ty2} ${tx},${ty}`;
          break;
        }
        case "s": {
          // Smooth Cubic Relative
          const dx2 = parseFloat(tokens[idx++]);
          const dy2 = parseFloat(tokens[idx++]);
          const dx = parseFloat(tokens[idx++]);
          const dy = parseFloat(tokens[idx++]);

          const absX2 = cursorX + dx2;
          const absY2 = cursorY + dy2;
          const absX = cursorX + dx;
          const absY = cursorY + dy;

          const [tx2, ty2] = transformPoint(absX2, absY2);
          const [tx, ty] = transformPoint(absX, absY);

          cursorX = absX;
          cursorY = absY;
          currentMedians.push([tx, ty]);
          currentStroke += `S${tx2},${ty2} ${tx},${ty}`;
          break;
        }
        case "Q": {
          // Quadratic Absolute
          const x1 = parseFloat(tokens[idx++]);
          const y1 = parseFloat(tokens[idx++]);
          const x = parseFloat(tokens[idx++]);
          const y = parseFloat(tokens[idx++]);
          const [tx1, ty1] = transformPoint(x1, y1);
          const [tx, ty] = transformPoint(x, y);
          cursorX = x;
          cursorY = y;
          currentMedians.push([tx, ty]);
          currentStroke += `Q${tx1},${ty1} ${tx},${ty}`;
          break;
        }
        case "q": {
          // Quadratic Relative
          const dx1 = parseFloat(tokens[idx++]);
          const dy1 = parseFloat(tokens[idx++]);
          const dx = parseFloat(tokens[idx++]);
          const dy = parseFloat(tokens[idx++]);
          const absX1 = cursorX + dx1;
          const absY1 = cursorY + dy1;
          const absX = cursorX + dx;
          const absY = cursorY + dy;
          const [tx1, ty1] = transformPoint(absX1, absY1);
          const [tx, ty] = transformPoint(absX, absY);
          cursorX = absX;
          cursorY = absY;
          currentMedians.push([tx, ty]);
          currentStroke += `Q${tx1},${ty1} ${tx},${ty}`;
          break;
        }
        case "Z":
        case "z": {
          currentStroke += "Z";
          // Z usually doesn't add a new point for 'medians' logic (it closes to start)
          break;
        }
        default:
          // Skip unknown commands or handle error
          break;
      }
    }

    output.strokes.push(currentStroke);
    output.medians.push(currentMedians);
  }

  return output;
}
function bufferObjectStrokes(data) {
  // 1. Initialize Paper.js with a virtual canvas (if not already active)
  if (!paper.project) {
    paper.setup(document.createElement("canvas"));
  }

  // 2. Map through the strokes
  const newStrokes = data.strokes.map((pathString) => {
    // Create the path in memory
    const path = new paper.Path({
      pathData: pathString,
      insert: false,
    });

    // 3. Perform the Buffer (Offset Stroke)
    // arg 1: The path to buffer
    // arg 2: The radius (30px buffer = 60px total width)
    // arg 3: Options for rounded ends/corners
    const bufferedPath = PaperOffset.offsetStroke(path, 20, {
      cap: "round",
      join: "round",
    });

    // 4. Extract the Resulting SVG Data
    // If the buffer created multiple islands (rare for single lines), unite them
    let resultD = "";
    if (bufferedPath) {
      // Ensure we get the path data. If it returned a compound path (multiple shapes),
      // pathData handles that automatically in modern Paper.js
      resultD = bufferedPath.pathData;

      // Cleanup the new polygon
      bufferedPath.remove();
    }

    // Cleanup the original path
    path.remove();

    return resultD;
  });

  // 5. Return modified object
  return {
    strokes: newStrokes,
    medians: data.medians,
  };
}
