import React from "react";
import { ChevronLeft, ChevronRight, Home, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { brochurePdfUrl } from "../../data/site";
import { useExitPassword } from "../../components/ExitPasswordContext";
import "./brochure.css";

// Configure local worker to avoid CORS / CDN blocking
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const MAX_CACHED_PAGES = 60;
const TURN_FEEDBACK_MS = 110;

export function BrochurePage() {
  const { handleLogoTap } = useExitPassword();
  const [pdfDoc, setPdfDoc] = React.useState(null);
  const [numPages, setNumPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [turningDir, setTurningDir] = React.useState(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const leftCanvasRef = React.useRef(null);
  const rightCanvasRef = React.useRef(null);
  const pageCacheRef = React.useRef(new Map());
  const pageRenderTasksRef = React.useRef(new Map());
  const preloadQueueRef = React.useRef([]);
  const isPreloadingRef = React.useRef(false);
  const renderTokenRef = React.useRef(0);

  // Swipe Gesture Tracking Refs
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const isMouseDown = React.useRef(false);
  const mouseStartX = React.useRef(0);
  const suppressPageClickRef = React.useRef(false);

  // Load PDF Document
  React.useEffect(() => {
    let isSubscribed = true;
    setLoading(true);

    const loadingTask = pdfjsLib.getDocument(brochurePdfUrl);
    loadingTask.promise
      .then((doc) => {
        if (!isSubscribed) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading PDF:", err);
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
      loadingTask.destroy?.();
    };
  }, []);

  // Render Left & Right Pages on Canvas
  const getRenderScale = React.useCallback(() => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    return pixelRatio > 1 ? 1.15 : 1.05;
  }, []);

  const drawCachedPage = React.useCallback((sourceCanvas, targetCanvas) => {
    const ctx = targetCanvas.getContext("2d", { alpha: false });
    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;
    ctx.drawImage(sourceCanvas, 0, 0);
  }, []);

  const renderPageToCache = React.useCallback(
    async (pageNum) => {
      if (!pdfDoc || !pageNum || pageNum > numPages) return null;
      const cache = pageCacheRef.current;
      if (cache.has(pageNum)) return cache.get(pageNum);
      if (pageRenderTasksRef.current.has(pageNum)) {
        return pageRenderTasksRef.current.get(pageNum);
      }

      const renderTask = (async () => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: getRenderScale() });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: false });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        cache.set(pageNum, canvas);
        if (cache.size > MAX_CACHED_PAGES) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
        return canvas;
      })();

      pageRenderTasksRef.current.set(pageNum, renderTask);
      try {
        return await renderTask;
      } finally {
        pageRenderTasksRef.current.delete(pageNum);
      }
    },
    [getRenderScale, numPages, pdfDoc],
  );

  const runPreloadQueue = React.useCallback(() => {
    if (isPreloadingRef.current) return;

    const nextPage = preloadQueueRef.current.shift();
    if (!nextPage) return;

    isPreloadingRef.current = true;
    renderPageToCache(nextPage)
      .catch((error) => {
        console.error("PDF preload error:", error);
      })
      .finally(() => {
        isPreloadingRef.current = false;
        if (preloadQueueRef.current.length > 0) {
          const schedule = () => runPreloadQueue();
          if (window.requestIdleCallback) {
            window.requestIdleCallback(schedule, { timeout: 600 });
          } else {
            window.setTimeout(schedule, 120);
          }
        }
      });
  }, [renderPageToCache]);

  const queuePreloadPages = React.useCallback(
    (pageNums) => {
      const cache = pageCacheRef.current;
      const priorityPages = pageNums.filter(
        (pageNum) =>
          pageNum > 0 &&
          pageNum <= numPages &&
          !cache.has(pageNum) &&
          !pageRenderTasksRef.current.has(pageNum),
      );
      const prioritySet = new Set(priorityPages);
      preloadQueueRef.current = [
        ...priorityPages,
        ...preloadQueueRef.current.filter((pageNum) => !prioritySet.has(pageNum)),
      ];

      const schedule = () => runPreloadQueue();
      if (window.requestIdleCallback) {
        window.requestIdleCallback(schedule, { timeout: 400 });
      } else {
        window.setTimeout(schedule, 80);
      }
    },
    [numPages, runPreloadQueue],
  );

  const renderPageIntoCanvas = React.useCallback(
    async (pageNum, targetCanvas, token) => {
      if (!targetCanvas) return;
      const ctx = targetCanvas.getContext("2d", { alpha: false });

      if (!pageNum) {
        targetCanvas.width = 900;
        targetCanvas.height = 1200;
        ctx.fillStyle = "#e0dcd4";
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
        return;
      }

      try {
        const renderedCanvas = await renderPageToCache(pageNum);
        if (renderTokenRef.current !== token || !renderedCanvas) return;
        drawCachedPage(renderedCanvas, targetCanvas);
      } catch (e) {
        console.error("PDF page render error:", e);
      }
    },
    [drawCachedPage, renderPageToCache],
  );

  const renderSpread = React.useCallback(async () => {
    if (!pdfDoc) return;

    const token = renderTokenRef.current + 1;
    renderTokenRef.current = token;
    const leftPageNum = currentPage === 1 ? null : currentPage;
    const rightPageNum = currentPage === 1 ? 1 : Math.min(currentPage + 1, numPages);

    await Promise.all([
      renderPageIntoCanvas(leftPageNum, leftCanvasRef.current, token),
      renderPageIntoCanvas(rightPageNum, rightCanvasRef.current, token),
    ]);

    const preloadPages = [
      rightPageNum + 1,
      rightPageNum + 2,
      Math.max(1, (leftPageNum || 1) - 2),
      Math.max(1, (leftPageNum || 1) - 1),
    ].filter((pageNum) => pageNum > 0 && pageNum <= numPages);

    queuePreloadPages(preloadPages);
  }, [currentPage, numPages, pdfDoc, queuePreloadPages, renderPageIntoCanvas]);

  React.useEffect(() => {
    renderSpread();
  }, [renderSpread]);

  React.useEffect(() => {
    if (!pdfDoc || !numPages) return;

    const pageNums = Array.from({ length: numPages }, (_item, index) => index + 1);
    queuePreloadPages(pageNums);
  }, [numPages, pdfDoc, queuePreloadPages]);

  // Turn Page Action
  const turnPage = React.useCallback(
    (direction) => {
      if (turningDir || loading) return;

      let nextPage;
      if (direction === "next") {
        if (currentPage === 1) {
          nextPage = 2;
        } else {
          nextPage = Math.min(numPages, currentPage + 2);
        }
      } else {
        if (currentPage <= 2) {
          nextPage = 1;
        } else {
          nextPage = Math.max(1, currentPage - 2);
        }
      }

      if (nextPage === currentPage) return;

      const targetLeftPage = nextPage === 1 ? null : nextPage;
      const targetRightPage = nextPage === 1 ? 1 : Math.min(nextPage + 1, numPages);

      setTurningDir(direction);
      Promise.all([
        renderPageToCache(targetLeftPage),
        renderPageToCache(targetRightPage),
      ]).finally(() => {
        setCurrentPage(nextPage);
        window.setTimeout(() => {
          setTurningDir(null);
        }, TURN_FEEDBACK_MS);
      });
    },
    [turningDir, loading, currentPage, numPages, renderPageToCache]
  );

  const blockParentGesture = React.useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Hand Swipe & Touch Gesture Handlers
  function handleTouchStart(e) {
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    e.stopPropagation();
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        suppressPageClickRef.current = true;
        window.setTimeout(() => {
          suppressPageClickRef.current = false;
        }, 350);

        if (deltaX < 0) {
          turnPage("next");
        } else {
          turnPage("prev");
        }
      }
    }
  }

  // Mouse Drag Swipe Handlers
  function handleMouseDown(e) {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  }

  function handleMouseUp(e) {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        turnPage("next");
      } else {
        turnPage("prev");
      }
    }
  }

  function handleMouseLeave() {
    isMouseDown.current = false;
  }

  function handlePageClick(direction) {
    if (suppressPageClickRef.current) return;
    turnPage(direction);
  }

  // Keyboard navigation
  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") {
        turnPage("prev");
      } else if (e.key === "ArrowRight") {
        turnPage("next");
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [turnPage, isFullscreen]);

  const leftDisplayNum = currentPage === 1 ? null : currentPage;
  const rightDisplayNum = currentPage === 1 ? 1 : Math.min(currentPage + 1, numPages);

  return (
    <main className={`page-shell brochure-shell ${isFullscreen ? "is-fullscreen" : ""}`}>
      <section className="brochure-page" aria-label="Interactive Brochure Flipbook">
        {/* Top Neumorphic Header */}
        <header className="brochure-header">
          <a className="brochure-home-button" href="#home" aria-label="Go to homepage">
            <span className="brochure-home-icon">
              <Home size={22} strokeWidth={2} />
            </span>
            <span>HOME</span>
          </a>

          {/* Original Homepage Logo */}
          <img
            className="brochure-brand-logo"
            src="/assets/project-logo.png"
            alt="Vinayak 21 Acres"
            onClick={handleLogoTap}
            style={{ cursor: "pointer" }}
            title="Triple tap logo to exit app"
          />

          <div className="brochure-header-actions">
            <button
              type="button"
              className="brochure-icon-btn"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="brochure-icon-btn"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              className="brochure-icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </header>

        {/* Interactive 3D Book Stage with Swipe & Drag Gesture Support */}
        <div
          className="brochure-stage"
          onTouchStart={handleTouchStart}
          onTouchMove={blockParentGesture}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {loading && (
            <div className="brochure-loading-overlay">
              <div className="brochure-spinner" />
              <p>Opening Luxury Brochure...</p>
            </div>
          )}

          <div
            className={`brochure-book ${turningDir ? `is-turning-${turningDir}` : ""}`}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Book Spine Shadow */}
            <div className="book-spine" />
            <div className="book-shadow" />

            {/* Left Page */}
            <div className="book-page book-page-left" onClick={() => handlePageClick("prev")}>
              <canvas ref={leftCanvasRef} className="page-canvas" />
              {leftDisplayNum && <span className="page-number left">{leftDisplayNum}</span>}
              <div className="page-inner-shadow left" />
            </div>

            {/* Right Page */}
            <div className="book-page book-page-right" onClick={() => handlePageClick("next")}>
              <canvas ref={rightCanvasRef} className="page-canvas" />
              {rightDisplayNum && <span className="page-number right">{rightDisplayNum}</span>}
              <div className="page-inner-shadow right" />
            </div>

          </div>
        </div>

        {/* Bottom Controls Bar */}
        <footer className="brochure-controls-bar">
          <button
            type="button"
            className="brochure-control-btn"
            onClick={() => turnPage("prev")}
            disabled={currentPage === 1 || Boolean(turningDir) || loading}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <div className="brochure-page-indicator">
            <span>
              {currentPage === 1 ? "Cover Page 1" : `Pages ${currentPage} - ${rightDisplayNum}`} of {numPages || 47}
            </span>
          </div>

          <button
            type="button"
            className="brochure-control-btn"
            onClick={() => turnPage("next")}
            disabled={rightDisplayNum >= numPages || Boolean(turningDir) || loading}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </footer>
      </section>
    </main>
  );
}
