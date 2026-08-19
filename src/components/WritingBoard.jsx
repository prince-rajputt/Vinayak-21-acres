import React from "react";
import "./writingBoard.css";

const STORAGE_KEY = "vinayak_writing_board_docs";
const PEN_COLORS = ["#2b2620", "#c0392b", "#1f5fbf", "#1f8a4c", "#bfa054"];

function loadDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function newDoc() {
  return {
    id: `doc-${Date.now()}`,
    title: "Untitled Document",
    html: "",
    drawing: null,
    updatedAt: Date.now(),
  };
}

export function WritingBoard({ onClose }) {
  const [docs, setDocs] = React.useState(loadDocs);
  const [activeId, setActiveId] = React.useState(null);
  const [mode, setMode] = React.useState("write"); // "write" | "draw"
  const [penColor, setPenColor] = React.useState(PEN_COLORS[0]);
  const [penSize, setPenSize] = React.useState(3);
  const [isEraser, setIsEraser] = React.useState(false);
  const editorRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const editorWrapRef = React.useRef(null);
  const isDrawingRef = React.useRef(false);

  const activeDoc = docs.find((d) => d.id === activeId) || null;

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    if (editorRef.current && activeDoc && editorRef.current.innerHTML !== activeDoc.html) {
      editorRef.current.innerHTML = activeDoc.html;
    }
    setupCanvas();
    loadDrawingOntoCanvas(activeDoc?.drawing);
  }, [activeId]);

  React.useEffect(() => {
    function onResize() {
      const dataUrl = getCanvasDataUrl();
      setupCanvas();
      loadDrawingOntoCanvas(dataUrl || activeDoc?.drawing);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId]);

  function setupCanvas() {
    const canvas = canvasRef.current;
    const wrap = editorWrapRef.current;
    if (!canvas || !wrap) return;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
  }

  function loadDrawingOntoCanvas(dataUrl) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = dataUrl;
  }

  function getCanvasDataUrl() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  }

  function persist(nextDocs) {
    setDocs(nextDocs);
    saveDocs(nextDocs);
  }

  function handleNew() {
    const doc = newDoc();
    const next = [doc, ...docs];
    persist(next);
    setActiveId(doc.id);
    setMode("write");
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        editorRef.current.focus();
      }
      setupCanvas();
      loadDrawingOntoCanvas(null);
    });
  }

  function handleSelect(id) {
    setActiveId(id);
    setMode("write");
  }

  function handleDelete(id) {
    const next = docs.filter((d) => d.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  function handleTitleChange(e) {
    if (!activeDoc) return;
    const title = e.target.value;
    const next = docs.map((d) => (d.id === activeDoc.id ? { ...d, title, updatedAt: Date.now() } : d));
    persist(next);
  }

  function handleEditorInput() {
    if (!activeDoc || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const next = docs.map((d) => (d.id === activeDoc.id ? { ...d, html, updatedAt: Date.now() } : d));
    persist(next);
  }

  function format(command, value) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  }

  function saveDrawing() {
    if (!activeDoc) return;
    const dataUrl = getCanvasDataUrl();
    const next = docs.map((d) => (d.id === activeDoc.id ? { ...d, drawing: dataUrl, updatedAt: Date.now() } : d));
    persist(next);
  }

  function getPointerPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function handlePointerDown(e) {
    if (mode !== "draw" || !activeDoc) return;
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (mode !== "draw" || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPointerPos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (mode !== "draw" || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveDrawing();
  }

  function handleClearDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawing();
  }

  function handleDownload() {
    if (!activeDoc) return;
    const text = editorRef.current?.innerText || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDoc.title || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    if (!editorRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const drawingImg = activeDoc?.drawing
      ? `<img src="${activeDoc.drawing}" style="max-width:100%;margin-top:20px;" />`
      : "";
    printWindow.document.write(
      `<html><head><title>${activeDoc?.title || "Document"}</title></head><body>${editorRef.current.innerHTML}${drawingImg}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  const sortedDocs = [...docs].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="writing-board-overlay" role="dialog" aria-modal="true">
      <div className="writing-board">
        <button className="wb-close" type="button" onClick={onClose} aria-label="Close writing board">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <aside className="wb-sidebar">
          <div className="wb-sidebar-head">
            <h3>My Documents</h3>
            <button className="wb-new-btn" type="button" onClick={handleNew}>
              + New
            </button>
          </div>
          <div className="wb-doc-list">
            {sortedDocs.length === 0 && <p className="wb-empty">No documents yet. Tap "+ New" to start writing.</p>}
            {sortedDocs.map((d) => (
              <div key={d.id} className={`wb-doc-item ${d.id === activeId ? "is-active" : ""}`} onClick={() => handleSelect(d.id)}>
                <span className="wb-doc-title">{d.title || "Untitled Document"}</span>
                <button
                  className="wb-doc-delete"
                  type="button"
                  aria-label="Delete document"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(d.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="wb-main">
          {activeDoc ? (
            <>
              <input
                className="wb-title-input"
                type="text"
                value={activeDoc.title}
                onChange={handleTitleChange}
                placeholder="Document title"
              />

              <div className="wb-mode-switch">
                <button
                  type="button"
                  className={mode === "write" ? "is-active" : ""}
                  onClick={() => setMode("write")}
                >
                  ✎ Write
                </button>
                <button
                  type="button"
                  className={mode === "draw" ? "is-active" : ""}
                  onClick={() => setMode("draw")}
                >
                  ✏ Pen / Pencil
                </button>
              </div>

              {mode === "write" ? (
                <div className="wb-toolbar">
                  <button type="button" onClick={() => format("bold")} title="Bold"><b>B</b></button>
                  <button type="button" onClick={() => format("italic")} title="Italic"><i>I</i></button>
                  <button type="button" onClick={() => format("underline")} title="Underline"><u>U</u></button>
                  <span className="wb-toolbar-divider" />
                  <button type="button" onClick={() => format("insertUnorderedList")} title="Bullet list">• List</button>
                  <button type="button" onClick={() => format("insertOrderedList")} title="Numbered list">1. List</button>
                  <span className="wb-toolbar-divider" />
                  <button type="button" onClick={() => format("justifyLeft")} title="Align left">Left</button>
                  <button type="button" onClick={() => format("justifyCenter")} title="Align center">Center</button>
                  <button type="button" onClick={() => format("justifyRight")} title="Align right">Right</button>
                  <span className="wb-toolbar-divider" />
                  <button type="button" onClick={() => format("undo")} title="Undo">Undo</button>
                  <button type="button" onClick={() => format("redo")} title="Redo">Redo</button>
                  <span className="wb-toolbar-spacer" />
                  <button type="button" className="wb-action-btn" onClick={handleDownload}>Download</button>
                  <button type="button" className="wb-action-btn" onClick={handlePrint}>Print</button>
                </div>
              ) : (
                <div className="wb-toolbar wb-pen-toolbar">
                  <span className="wb-pen-label">Color</span>
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
                  <span className="wb-pen-label">Size</span>
                  <input
                    className="wb-pen-size"
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={penSize}
                    onChange={(e) => setPenSize(parseInt(e.target.value, 10))}
                    aria-label="Pen size"
                  />
                  <span className="wb-toolbar-divider" />
                  <button
                    type="button"
                    className={isEraser ? "is-active" : ""}
                    onClick={() => setIsEraser((v) => !v)}
                    title="Eraser"
                  >
                    Eraser
                  </button>
                  <button type="button" onClick={handleClearDrawing} title="Clear drawing">
                    Clear
                  </button>
                  <span className="wb-toolbar-spacer" />
                  <button type="button" className="wb-action-btn" onClick={handleDownload}>Download</button>
                  <button type="button" className="wb-action-btn" onClick={handlePrint}>Print</button>
                </div>
              )}

              <div className="wb-editor-wrap" ref={editorWrapRef}>
                <div
                  ref={editorRef}
                  className="wb-editor"
                  contentEditable={mode === "write"}
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  data-placeholder="Start writing your letter, application, or document here..."
                />
                <canvas
                  ref={canvasRef}
                  className={`wb-canvas ${mode === "draw" ? "is-active" : ""}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>
            </>
          ) : (
            <div className="wb-placeholder">
              <p>Select a document from the left, or create a new one to start writing.</p>
              <button className="wb-new-btn" type="button" onClick={handleNew}>
                + New Document
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
