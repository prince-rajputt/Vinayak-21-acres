import React from "react";
import { ArrowLeft, Eraser, Trash2, X } from "lucide-react";

const PEN_COLORS = ["#e2352b", "#1f5fbf", "#1f8a4c", "#f2b705", "#ffffff"];
const RAIL_WIDTH = 140;

function getContainedImageRect(containerWidth, containerHeight, naturalWidth, naturalHeight) {
  const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const left = (containerWidth - width) / 2;
  const top = (containerHeight - height) / 2;
  return { left, top, width, height };
}

// Fullscreen viewer for a tower plan + its unit plans, with a pen/pencil
// annotation layer over whichever image is active. Drawings are kept
// in-memory per unit for the lifetime of the popup (cleared on close).
export function TowerPlanViewer({ towerId, overviewSrc, unitImages, onClose }) {
  const unitKeys = Object.keys(unitImages);
  const [activeKey, setActiveKey] = React.useState("overview");
  const [tabsRevealed, setTabsRevealed] = React.useState(false);
  const [penColor, setPenColor] = React.useState(PEN_COLORS[0]);
  const [penSize, setPenSize] = React.useState(4);
  const [isEraser, setIsEraser] = React.useState(false);
  const [isDrawMode, setIsDrawMode] = React.useState(false);
  const [imageRect, setImageRect] = React.useState(null);

  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const isDrawingRef = React.useRef(false);
  const drawingsRef = React.useRef({}); // key -> dataURL

  const activeSrc = activeKey === "overview" ? overviewSrc : unitImages[activeKey];

  React.useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (activeKey !== "overview") {
        setActiveKey("overview");
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, activeKey]);

  const recomputeRect = React.useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth) return;
    const availableWidth = container.clientWidth - (tabsRevealed ? RAIL_WIDTH : 0);
    setImageRect(
      getContainedImageRect(availableWidth, container.clientHeight, img.naturalWidth, img.naturalHeight)
    );
  }, [tabsRevealed]);

  React.useEffect(() => {
    recomputeRect();
    window.addEventListener("resize", recomputeRect);
    return () => window.removeEventListener("resize", recomputeRect);
  }, [recomputeRect]);

  // Size the canvas to the rendered image rect, then restore this unit's saved drawing.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRect || imageRect.width === 0) return;
    canvas.width = imageRect.width;
    canvas.height = imageRect.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = drawingsRef.current[activeKey];
    if (saved) {
      const im = new Image();
      im.onload = () => ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
      im.src = saved;
    }
  }, [imageRect, activeKey]);

  function saveCurrentDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingsRef.current[activeKey] = canvas.toDataURL("image/png");
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function handlePointerDown(e) {
    if (!isDrawMode) return;
    const canvas = canvasRef.current;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore — some environments report no active pointer for the given id.
    }
    isDrawingRef.current = true;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (!isDrawMode || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = isEraser ? penSize * 5 : penSize;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawMode || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveCurrentDrawing();
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    delete drawingsRef.current[activeKey];
  }

  // Back/Cross step back one level at a time: unit plan -> tower overview -> close
  // (back to the master plan's tower indicators), mirroring how you drill in.
  function closeAndStop(e) {
    e.stopPropagation();
    if (activeKey !== "overview") {
      setActiveKey("overview");
      return;
    }
    onClose();
  }

  function handleOverviewImageClick() {
    if (isDrawMode || activeKey !== "overview" || unitKeys.length === 0) return;
    setTabsRevealed(true);
    setActiveKey(unitKeys[0]);
  }

  return (
    <div className="location-popup tower-plan-popup" role="dialog" aria-modal="true" onClick={closeAndStop}>
      <button className="popup-close popup-close-neumorphism" type="button" onClick={closeAndStop} aria-label={`Close ${towerId} plan`}>
        <X size={26} strokeWidth={2.5} />
      </button>

      <div className="popup-content" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <img
          ref={imgRef}
          className={`popup-image ${activeKey === "overview" && !isDrawMode && unitKeys.length > 0 ? "is-clickable" : ""}`}
          src={activeSrc}
          alt={activeKey === "overview" ? `${towerId} plan` : `${towerId} Type ${activeKey}`}
          decoding="async"
          onLoad={recomputeRect}
          onClick={handleOverviewImageClick}
          style={
            imageRect
              ? {
                  position: "absolute",
                  left: imageRect.left,
                  top: imageRect.top,
                  width: imageRect.width,
                  height: imageRect.height,
                }
              : undefined
          }
        />

        {imageRect && (
          <canvas
            ref={canvasRef}
            className={`tower-draw-canvas ${isDrawMode ? "is-active" : ""}`}
            style={{ left: imageRect.left, top: imageRect.top }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}

        {imageRect && activeKey === "overview" && !isDrawMode && unitKeys.length > 0 && !tabsRevealed && (
          <button
            type="button"
            className="tower-click-hint"
            style={{
              left: imageRect.left + imageRect.width - 4,
              top: imageRect.top + 4,
            }}
            onClick={handleOverviewImageClick}
          >
            <span className="tower-click-hint-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74" />
                <path d="M14 10.5V6a2.5 2.5 0 0 1 5 0v9a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-5.6-3.85l-2.29-6a2 2 0 0 1 1.3-2.55c1-.3 1.9.2 2.3 1.1l1.4 3.1" />
              </svg>
            </span>
            Click to see unit plans
          </button>
        )}

        <button type="button" className="tower-back-btn" onClick={closeAndStop} aria-label="Back to master plan">
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Back</span>
        </button>

        <div className="tower-pen-toolbar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`tower-pen-toggle ${isDrawMode ? "is-active" : ""}`}
            onClick={() => setIsDrawMode((v) => !v)}
          >
            ✏ {isDrawMode ? "Drawing" : "Pen / Pencil"}
          </button>

          {isDrawMode && (
            <>
              <span className="wb-toolbar-divider" />
              {PEN_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`wb-color-swatch ${!isEraser && penColor === c ? "is-active" : ""}`}
                  style={{ background: c }}
                  aria-label={`Pen color ${c}`}
                  onClick={() => {
                    setPenColor(c);
                    setIsEraser(false);
                  }}
                />
              ))}
              <span className="wb-toolbar-divider" />
              <input
                className="wb-pen-size"
                type="range"
                min="2"
                max="16"
                step="1"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value, 10))}
                aria-label="Pen size"
              />
              <button type="button" className={isEraser ? "is-active" : ""} onClick={() => setIsEraser((v) => !v)} title="Eraser">
                <Eraser size={16} />
              </button>
              <button type="button" onClick={handleClear} title="Clear drawing">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        {tabsRevealed && (
          <div className="tower-unit-rail" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`tower-unit-rail-item ${activeKey === "overview" ? "is-active" : ""}`}
              onClick={() => setActiveKey("overview")}
            >
              <img src={overviewSrc} alt={`${towerId} plan thumbnail`} decoding="async" />
              <span>Tower Plan</span>
            </button>
            {unitKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={`tower-unit-rail-item ${activeKey === key ? "is-active" : ""}`}
                onClick={() => setActiveKey(key)}
              >
                <img src={unitImages[key]} alt={`${towerId} Type ${key} thumbnail`} decoding="async" />
                <span>Type {key}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
