import React from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;
const SWIPE_MIN_DISTANCE = 90;
const SWIPE_MAX_VERTICAL_DRIFT = 120;
const PAGES = ["home", "overview", "location", "amenities", "plans", "specs"];

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function getPageIndex() {
  const page = window.location.hash.replace("#", "") || "home";
  return Math.max(0, PAGES.indexOf(page));
}

function goToPage(index) {
  const nextPage = PAGES[Math.min(PAGES.length - 1, Math.max(0, index))];
  window.location.hash = nextPage === "home" ? "" : nextPage;
}

function getTouchDistance(touches) {
  const [first, second] = touches;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

export function GestureControls({ children }) {
  const zoomRef = React.useRef(1);
  const swipeStartRef = React.useRef(null);
  const pinchStartRef = React.useRef(null);
  const lastZoomSendRef = React.useRef(0);

  const setZoom = React.useCallback((nextZoom, force = false) => {
    const zoom = clampZoom(nextZoom);
    if (!force && Math.abs(zoom - zoomRef.current) < 0.03) {
      return;
    }

    zoomRef.current = zoom;
    window.vinayakApp?.setZoomFactor?.(zoom);
  }, []);

  React.useEffect(() => {
    window.vinayakApp?.setZoomFactor?.(zoomRef.current);

    const handleWheel = (event) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      setZoom(zoomRef.current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), true);
    };

    const handleKeyDown = (event) => {
      if (!event.ctrlKey) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom(zoomRef.current + ZOOM_STEP, true);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom(zoomRef.current - ZOOM_STEP, true);
      } else if (event.key === "0") {
        event.preventDefault();
        setZoom(1, true);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setZoom]);

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchStartRef.current = {
        distance: getTouchDistance(event.touches),
        zoom: zoomRef.current,
      };
      swipeStartRef.current = null;
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      swipeStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      pinchStartRef.current = null;
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length !== 2 || !pinchStartRef.current) {
      return;
    }

    event.preventDefault();
    const now = Date.now();
    if (now - lastZoomSendRef.current < 24) {
      return;
    }

    lastZoomSendRef.current = now;
    const currentDistance = getTouchDistance(event.touches);
    const scale = currentDistance / pinchStartRef.current.distance;
    setZoom(pinchStartRef.current.zoom * scale);
  };

  const handleTouchEnd = (event) => {
    if (event.touches.length > 0 || !swipeStartRef.current) {
      return;
    }

    const changedTouch = event.changedTouches[0];
    const dx = changedTouch.clientX - swipeStartRef.current.x;
    const dy = changedTouch.clientY - swipeStartRef.current.y;
    const elapsed = Date.now() - swipeStartRef.current.time;
    swipeStartRef.current = null;

    if (
      Math.abs(dx) < SWIPE_MIN_DISTANCE ||
      Math.abs(dy) > SWIPE_MAX_VERTICAL_DRIFT ||
      elapsed > 1200
    ) {
      return;
    }

    const currentIndex = getPageIndex();
    goToPage(currentIndex + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className="gesture-surface"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
