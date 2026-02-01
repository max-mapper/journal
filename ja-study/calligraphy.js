window.Calligraphy = window.Calligraphy || {};
if (!Calligraphy.Writer) Calligraphy.Writer = {};

// --- Brush Definitions ---
Calligraphy.Writer.Brush = function (brushName, opt) {
  this.name = brushName;
  this.width = opt.width;
  this.height = opt.height;
  this.maxSize = opt.maxSize || opt.width;
  this.minSize = opt.minSize || 0;
  this.brushImageName = opt.brushImageName || brushName;
  this.image = opt.image;
  this.kasureImage = opt.kasureImage;
};
Calligraphy.Writer.Brush.prototype.draw = function (ctx, pos, size) {
  ctx.drawImage(this.image, pos.x - size / 2, pos.y - size / 2, size, size);
};
Calligraphy.Writer.Brush.prototype.clone = function () {
  return new Calligraphy.Writer.Brush(this.name, {
    width: this.width,
    height: this.height,
    maxSize: this.maxSize,
    minSize: this.minSize,
    brushImageName: this.brushImageName,
    image: this.image,
    kasureImage: this.kasureImage,
  });
};

Calligraphy.Writer.Brushes = {
  Small: new Calligraphy.Writer.Brush("Small", {
    width: 40,
    height: 40,
    maxSize: 15,
    minSize: 3,
    brushImageName: "Small",
  }),
  SmallMed: new Calligraphy.Writer.Brush("SmallMed", {
    width: 70,
    height: 70,
    maxSize: 30,
    minSize: 5,
  }),
  Medium: new Calligraphy.Writer.Brush("Medium", {
    width: 90,
    height: 90,
    maxSize: 40,
    minSize: 3,
  }),
  Large: new Calligraphy.Writer.Brush("Large", {
    width: 90,
    height: 90,
    maxSize: 60,
    minSize: 3,
    brushImageName: "Medium",
  }),
  getBrush: function (brushName) {
    if (!this[brushName].image) {
      this[brushName].image = Calligraphy.Writer.Resources.getImage(
        "Brushes",
        brushName,
      );
      this[brushName].kasureImage = Calligraphy.Writer.Resources.getImage(
        "KasureBrushes",
        brushName,
      );
    }
    return this[brushName].clone();
  },
};

Calligraphy.Writer.Resources = {
  createImage: function (url) {
    var image = document.createElement("img");
    image.src = url;
    return image;
  },
  getImage: function (category, name) {
    // Fallback logic
    if (!this[category] || !this[category][name]) {
      if (this[category] && this[category]["Small"])
        return this[category]["Small"];
    }
    return this[category][name];
  },
};

Calligraphy.Writer.StrokeManager = function (eventCaptureTarget, strokeEngine) {
  this.eventCaptureTarget = eventCaptureTarget;
  this.strokeEngine = strokeEngine;
  this.handElementSelector = "#hand-image";
  this.strokeHistory = [];
  this.isHandVisible = false;
  this.isInStroke = false;
  this.strokeBeginTime = null;
  this.isLocked = false;
};

Calligraphy.Writer.StrokeManager.StrokeOperation = {
  Stroke: 0,
  SetOpacity: 1,
  SetBrush: 2,
  SetColor: 3,
};

Calligraphy.Writer.StrokeManager.prototype.selectBrush = function (brushName) {
  if (this.isLocked) return;
  this.endStroke();
  this.strokeHistory.push({
    O: Calligraphy.Writer.StrokeManager.StrokeOperation.SetBrush,
    D: brushName,
  });
  return this.strokeEngine.selectBrush(brushName);
};

Calligraphy.Writer.StrokeManager.prototype.clearHistory = function () {
  if (this.isLocked) return;
  this.endStroke();
  this.strokeHistory = [];
  this.strokeEngine.clear();
  return this;
};

Calligraphy.Writer.StrokeManager.prototype.beginStroke = function () {
  if (this.isLocked) return;
  this.endStroke();
  this.isInStroke = true;
  this.strokeBeginTime = new Date().valueOf();
  this.currentStroke = [];
  this.strokeEngine.beginStroke();
  return this;
};

Calligraphy.Writer.StrokeManager.prototype.undoStroke = function () {
  /// <summary>Undo Stroke</summary>
  /// <return>Calligraphy.Writer.StrokeManager</return>
  if (this.isLocked) return this;

  // If there is no history, there is nothing to undo
  if (this.strokeHistory.length === 0) return this;

  // 1. Remove the last operation from the history
  this.strokeHistory.pop();

  // 2. Clear the entire engine (both the active buffer and the composited canvas)
  this.strokeEngine.clear();

  // 3. Reset the engine to default states before replaying history.
  // This ensures we don't carry over settings (like low opacity) into the replay
  // if the history doesn't explicitly set them at the start.
  // this.strokeEngine.brushOpacity = 1;
  // this.strokeEngine.canvas.css("opacity", 1);
  // this.strokeEngine.brushColor = 0x000000;
  // this.strokeEngine.selectBrush("Medium");

  // 4. Replay the remaining history
  for (var i = 0; i < this.strokeHistory.length; i++) {
    var op = this.strokeHistory[i];

    switch (op.O) {
      case Calligraphy.Writer.StrokeManager.StrokeOperation.SetBrush:
        // Op Data (D) contains the brush name
        this.strokeEngine.selectBrush(op.D);
        break;

      case Calligraphy.Writer.StrokeManager.StrokeOperation.SetOpacity:
        // Op Data (D) contains the opacity value
        this.strokeEngine.setBrushOpacity(op.D);
        break;

      case Calligraphy.Writer.StrokeManager.StrokeOperation.SetColor:
        // Op Data (D) contains the color hex
        this.strokeEngine.brushColor = op.D;
        this.strokeEngine.refreshBrush();
        break;

      case Calligraphy.Writer.StrokeManager.StrokeOperation.Stroke:
        // Op Data (D) contains the array of points {X, Y, T, P}
        var points = op.D;
        if (!points || points.length === 0) continue;

        this.strokeEngine.beginStroke();
        for (var j = 0; j < points.length; j++) {
          var p = points[j];
          // The engine expects lowercase keys {x, y, t, p}
          var pos = {
            x: p.X,
            y: p.Y,
            t: p.T,
            p: p.P,
          };
          this.strokeEngine.addStrokePosition(pos);

          // Vital: We must manually trigger draw() here.
          // In live drawing, StrokeManager.addStrokePosition calls engine.draw().
          // Engine.addStrokePosition only pushes data to the buffer.
          this.strokeEngine.draw();
        }
        this.strokeEngine.endStroke();
        break;
    }
  }

  return this;
};

Calligraphy.Writer.StrokeManager.prototype.addStrokePosition = function (
  x,
  y,
  pressure,
) {
  if (this.isLocked) return;
  var pos = {
    x: x,
    y: y,
    t: new Date().valueOf() - this.strokeBeginTime,
    p: pressure,
  };
  this.currentStroke.push(pos);
  this.strokeEngine.addStrokePosition(pos);
  this.strokeEngine.draw();
  return this;
};

Calligraphy.Writer.StrokeManager.prototype.setBrushOpacity = function (value) {
  /// <summary>set a brush opacity.</summary>
  if (this.isLocked) return;

  this.endStroke();
  this.strokeHistory.push({
    O: Calligraphy.Writer.StrokeManager.StrokeOperation.SetOpacity,
    D: value,
  });

  return this.strokeEngine.setBrushOpacity(value);
};

Calligraphy.Writer.StrokeManager.prototype.endStroke = function () {
  if (this.isLocked) return;
  if (!this.isInStroke) return;
  this.strokeHistory.push({
    O: Calligraphy.Writer.StrokeManager.StrokeOperation.Stroke,
    D: this.currentStroke.map(function (e) {
      return { X: e.x, Y: e.y, T: e.t, P: e.p };
    }),
  });
  this.isInStroke = false;
  this.currentStroke = null;
  this.strokeEngine.endStroke();
  return this;
};

Calligraphy.Writer.StrokeManager.prototype.start = function () {
  var handCanvasObject = $(this.eventCaptureTarget);
  var self = this;
  var isMouseDown = false;
  var handE = $(this.handElementSelector);
  var offset = handCanvasObject.offset();

  setTimeout(() => {
    offset = handCanvasObject.offset();
  }, 500); // initial redraw

  $(window).on("resize scroll", function () {
    offset = handCanvasObject.offset();
  });

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
    else if (type === "mouseup")
      simEvent = new MouseEvent("mouseup", eventInit);
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

  function onStart(e) {
    e.preventDefault();
    isMouseDown = true;
    var pageX = e.pageX;
    var pageY = e.pageY;
    if (e.touches && e.touches.length > 0) {
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    }
    var x = pageX - offset.left;
    var y = pageY - offset.top;

    handE.css("top", y).css("left", x);
    if (self.isHandVisible) handE.fadeIn("fast");
    self.beginStroke();

    // Dispatch to Hanzi Writer
    dispatchToHanziWriter(
      e.type === "touchstart" ? "touchstart" : "mousedown",
      e,
      x,
      y,
    );
  }

  function onDraw(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isMouseDown) return;
    var pageX = e.pageX;
    var pageY = e.pageY;
    if (e.touches && e.touches.length > 0) {
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    } else if (e.changedTouches) {
      pageX = e.changedTouches[0].pageX;
      pageY = e.changedTouches[0].pageY;
    }
    var x = pageX - offset.left;
    var y = pageY - offset.top;

    self.addStrokePosition(x, y);
    handE.css("top", y).css("left", x);

    // Dispatch to Hanzi Writer
    dispatchToHanziWriter(
      e.type === "touchmove" ? "touchmove" : "mousemove",
      e,
      x,
      y,
    );
  }

  function onEnd(e) {
    e.preventDefault();
    if (!isMouseDown) return;
    isMouseDown = false;
    self.endStroke();
    if (self.isHandVisible) handE.fadeOut("fast");

    // Dispatch to Hanzi Writer
    dispatchToHanziWriter(
      e.type === "touchend" ? "touchend" : "mouseup",
      e,
      0,
      0,
    );
  }

  handCanvasObject
    .on("mousedown", onStart)
    .on("mousemove", onDraw)
    .on("mouseup", onEnd)
    .on("mouseleave", onEnd);

  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    handCanvasObject[0].addEventListener("touchstart", onStart, {
      passive: false,
    });
    handCanvasObject[0].addEventListener("touchmove", onDraw, {
      passive: false,
    });
    handCanvasObject[0].addEventListener("touchend", onEnd, {
      passive: false,
    });
  }
};

// --- Stroke Engine ---
Calligraphy.Writer.StrokeEngine = function (
  width,
  height,
  canvas,
  compositedCanvas,
) {
  this.velocityPressureCoff = 5;
  this.canvas = $(canvas);
  this.width = width;
  this.height = height;
  this.canvasContext = this.canvas.get(0).getContext("2d");
  this.backgroundImage = null; // No background image
  this.brushOpacity = 1;
  this.brushColor = 0x000000;
  this.selectBrush("SmallMed");
  this.bufferingSize = 4;
  this.strokeBuffer = [];
  this.splineBuffer = [];
  this.previousPosition = null;
  this.previousBrushSize = null;
  this.previousVelocity = 0;
  this.previousDistance = 0;
  this.expectedNextPosition = null;
  this.accelerate = 0;
  this.compositedCanvas = compositedCanvas;
  this.compositedCanvasContext = this.compositedCanvas.getContext("2d");
  this.clear();
};

Calligraphy.Writer.StrokeEngine.prototype.clear = function () {
  this.canvasContext.clearRect(0, 0, this.width, this.height);
  this.compositedCanvasContext.save();
  this.compositedCanvasContext.clearRect(0, 0, this.width, this.height);
  this.compositedCanvasContext.restore();
};

Calligraphy.Writer.StrokeEngine.prototype.createColoredBrushImage = function (
  originalBrushImage,
  brushColor,
  width,
  height,
) {
  if (brushColor === 0x000000) return originalBrushImage;
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  var ctx = tmpCanvas.getContext("2d");
  ctx.drawImage(originalBrushImage, 0, 0);
  var imageData = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
  for (var i = 0, n = imageData.data.length / 4; i < n; i++) {
    imageData.data[i * 4] = (brushColor & 0xff0000) >> 16;
    imageData.data[i * 4 + 1] = (brushColor & 0x00ff00) >> 8;
    imageData.data[i * 4 + 2] = brushColor & 0x0000ff;
  }
  ctx.putImageData(imageData, 0, 0);
  var img = document.createElement("img");
  img.src = tmpCanvas.toDataURL();
  return img;
};

Calligraphy.Writer.StrokeEngine.prototype.refreshBrush = function () {
  var newBrush = Calligraphy.Writer.Brushes.getBrush(this.brushName);
  newBrush.image = this.createColoredBrushImage(
    newBrush.image,
    this.brushColor,
    newBrush.width,
    newBrush.height,
  );
  newBrush.kasureImage = this.createColoredBrushImage(
    newBrush.kasureImage,
    this.brushColor,
    newBrush.width,
    newBrush.height,
  );
  this.currentBrush = newBrush;
};

Calligraphy.Writer.StrokeEngine.prototype.getImage = function (
  withoutBackground,
) {
  // Always transparent background for merging
  return this.compositedCanvas;
};

Calligraphy.Writer.StrokeEngine.prototype.compositeCanvas = function () {
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = this.width;
  tmpCanvas.height = this.height;
  var tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.globalAlpha = this.brushOpacity;
  tmpCtx.drawImage(this.canvas.get(0), 0, 0);
  this.compositedCanvasContext.drawImage(tmpCanvas, 0, 0);
  this.canvasContext.clearRect(0, 0, this.width, this.height);
};

Calligraphy.Writer.StrokeEngine.prototype.selectBrush = function (brushName) {
  this.brushName = brushName;
  this.refreshBrush();
};

Calligraphy.Writer.StrokeEngine.prototype.beginStroke = function () {
  this.strokeBuffer = [];
  this.splineBuffer = [];
  this.previousPosition = null;
  this.previousBrushSize = null;
  this.previousVelocity = 0;
  this.previousDistance = 0;
  this.expectedNextPosition = null;
  this.accelerate = 0;
};

Calligraphy.Writer.StrokeEngine.prototype.addStrokePosition = function (pos) {
  this.strokeBuffer.push(pos);
};

Calligraphy.Writer.StrokeEngine.prototype.endStroke = function () {
  if (this.accelerate > 1) {
    var pos = {
      x: this.expectedNextPosition.x,
      y: this.expectedNextPosition.y,
      t:
        this.accelerate / (this.previousDistance * this.previousVelocity) +
        this.previousPosition.t,
      p:
        this.previousPosition.p *
        Math.min(
          this.accelerate / (this.previousDistance * this.previousVelocity),
          1,
        ),
    };
    for (var i = 0, n = this.bufferingSize; i < n; i++)
      this.strokeBuffer.push(pos);
    this.draw(true);
  }
  this.compositeCanvas();
};

Calligraphy.Writer.StrokeEngine.prototype.getInterlatePos = function (
  p0,
  p1,
  moveLen,
) {
  var x = p0.x + (p1.x - p0.x) * moveLen;
  var y = p0.y + (p1.y - p0.y) * moveLen;
  return { x: x, y: y };
};

Calligraphy.Writer.StrokeEngine.prototype.getDistance = function (p0, p1) {
  var distance = (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y);
  return distance == 0 ? distance : Math.sqrt(distance);
};

Calligraphy.Writer.StrokeEngine.prototype.getBufferedCurrentPosition =
  function () {
    var pos = { x: 0, y: 0, t: 0, p: 0 };
    var bufferingSize = Math.min(this.bufferingSize, this.strokeBuffer.length);
    if (bufferingSize == 0) return null;
    for (var i = 1; i < bufferingSize + 1; i++) {
      var p = this.strokeBuffer[this.strokeBuffer.length - i];
      pos.x += p.x;
      pos.y += p.y;
      pos.t += p.t;
      pos.p += p.p;
    }
    pos.x /= bufferingSize;
    pos.y /= bufferingSize;
    pos.t /= bufferingSize;
    pos.p /= bufferingSize;
    return pos;
  };

Calligraphy.Writer.StrokeEngine.prototype.draw = function (isEnding) {
  var pos = this.getBufferedCurrentPosition();
  if (pos == null) return;
  if (this.previousPosition == null) this.previousPosition = pos;

  var t = pos.t - this.previousPosition.t;
  var distance = this.getDistance(pos, this.previousPosition);
  var velocity = distance / Math.max(1, t);
  var accelerate =
    this.previousVelocity == 0 ? 0 : velocity / this.previousVelocity;

  var curve = function (t, b, c, d) {
    return (c * t) / d + b;
  };
  var brushSize = Math.max(
    this.currentBrush.minSize,
    curve(
      velocity,
      this.currentBrush.maxSize,
      -this.currentBrush.maxSize - this.currentBrush.minSize,
      this.velocityPressureCoff,
    ),
  );
  if (pos.p > 0)
    brushSize = Math.max(
      this.currentBrush.minSize,
      this.currentBrush.maxSize * pos.p,
    );
  pos.s = brushSize;

  var ctx = this.canvasContext;
  ctx.save();
  this.drawStroke(
    ctx,
    this.previousPosition,
    pos,
    brushSize,
    distance,
    velocity,
  );
  this.drawStrokeSpline(
    ctx,
    this.previousPosition,
    pos,
    brushSize,
    distance,
    velocity,
  );
  ctx.restore();

  this.accelerate = accelerate;
  this.expectedNextPosition = this.getInterlatePos(
    this.previousPosition,
    pos,
    1 + this.accelerate,
  );
  this.previousPosition = pos;
  this.previousBrushSize = brushSize;
  this.previousVelocity = velocity;
  this.previousDistance = distance;
};

Calligraphy.Writer.StrokeEngine.prototype.setBrushOpacity = function (
  brushOpacity,
) {
  /// <summary>Set a brush opacity.</summary>
  // set new opacity
  this.brushOpacity = brushOpacity;
  //this.createBrushWithOpacity(this.currentBrush.name, brushOpacity);
  this.canvas.css("opacity", this.brushOpacity);
};

Calligraphy.Writer.StrokeEngine.prototype.drawStroke = function (
  ctx,
  startPos,
  endPos,
  brushSize,
  distance,
) {
  var t = 0;
  var brushDelta = brushSize - this.previousBrushSize;
  while (t < 1) {
    var brushSizeCur = Math.min(
      this.previousBrushSize + brushDelta * t,
      this.currentBrush.maxSize,
    );
    var pos = this.getInterlatePos(startPos, endPos, t);
    if (Math.random() > 0.1) {
      var jitter =
        (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * 1.2, 10);
      var px = pos.x - brushSizeCur / 2 + jitter;
      var py = pos.y - brushSizeCur / 2 + jitter;
      try {
        ctx.drawImage(
          this.currentBrush.kasureImage,
          px,
          py,
          brushSizeCur,
          brushSizeCur,
        );
      } catch (e) {}
    }
    t += 1 / Math.max(distance, 1);
  }
};

Calligraphy.Writer.StrokeEngine.prototype.drawStrokeSpline = function (
  ctx,
  startPos,
  endPos,
  brushSize,
  distance,
  velocity,
) {
  this.splineBuffer.push(endPos);
  if (this.splineBuffer.length > 3) {
    var segCount = 40;
    var points = Array.apply(null, this.splineBuffer);
    points = points.slice(points.length - 4);
    points.unshift(points[0]);
    points.push(points[points.length - 1]);

    for (var j = 0, m = points.length - 3; j < m; j++) {
      var p0 = points[j],
        p1 = points[j + 1],
        p2 = points[j + 2],
        p3 = points[j + 3];
      var v0 = { x: (p2.x - p0.x) / 2, y: (p2.y - p0.y) / 2 };
      var v1 = { x: (p3.x - p1.x) / 2, y: (p3.y - p1.y) / 2 };

      var tmp1 = 2 * p1.x - 2 * p2.x + v0.x + v1.x;
      var tmp2 = -3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x;
      var tmp3 = 2 * p1.y - 2 * p2.y + v0.y + v1.y;
      var tmp4 = -3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y;

      for (var i = 1, n = segCount + 1; i <= n; i++) {
        var seg = i / segCount;
        var tX =
          tmp1 * Math.pow(seg, 3) + tmp2 * Math.pow(seg, 2) + v0.x * seg + p1.x;
        var tY =
          tmp3 * Math.pow(seg, 3) + tmp4 * Math.pow(seg, 2) + v0.y * seg + p1.y;
        var tS =
          this.previousBrushSize +
          ((brushSize - this.previousBrushSize) / segCount) * i;

        if (this.previousBrushSize == brushSize && Math.random() < 0.3)
          continue;
        ctx.drawImage(
          this.currentBrush.image,
          tX - tS / 2,
          tY - tS / 2,
          tS,
          tS,
        );
      }
    }
  }
};

Calligraphy.Writer.Shared = { StrokeEngine: null, StrokeManager: null };
