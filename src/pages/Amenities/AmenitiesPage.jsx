import React from "react";
import { Sparkles, Trees, Waves } from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import { amenitiesCategories } from "../../data/amenities";
import "./amenities.css";

const categoryIcons = {
  "central-park": Trees,
  "maidaan-more": Sparkles,
  "podium-club": Waves,
};

export function AmenitiesPage() {
  const [activeCat, setActiveCat] = React.useState(0);
  const [activeImg, setActiveImg] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const thumbsRef = React.useRef(null);
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);
  const mouseStartRef = React.useRef(null);
  const didSwipeRef = React.useRef(false);

  const category = amenitiesCategories[activeCat];
  const total = category.images.length;
  const current = category.images[activeImg];

  function go(direction) {
    setActiveImg((imageIndex) => (imageIndex + direction + total) % total);
  }

  function switchCategory(categoryIndex) {
    setActiveCat(categoryIndex);
    setActiveImg(0);
  }

  function pickImage(imageIndex) {
    setActiveImg(imageIndex);
    const selectedThumb = thumbsRef.current?.children[imageIndex];
    selectedThumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
    touchStartX.current = null;
    touchStartY.current = null;
  }

  function startSwipe(clientX, clientY) {
    touchStartX.current = clientX;
    touchStartY.current = clientY;
  }

  function finishSwipe(clientX, clientY) {
    if (touchStartX.current === null) return;

    const distance = clientX - touchStartX.current;
    const verticalDistance = clientY - (touchStartY.current ?? clientY);
    didSwipeRef.current = false;

    if (Math.abs(distance) > 45 && Math.abs(distance) > Math.abs(verticalDistance) * 1.2) {
      didSwipeRef.current = true;
      go(distance < 0 ? 1 : -1);
      window.setTimeout(() => {
        didSwipeRef.current = false;
      }, 350);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  function handleMouseDown(event) {
    mouseStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handleMouseUp(event) {
    const start = mouseStartRef.current;
    mouseStartRef.current = null;
    if (!start) return;
    startSwipe(start.x, start.y);
    finishSwipe(event.clientX, event.clientY);
  }

  React.useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape" && isLightboxOpen) closeLightbox();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCat, activeImg, isLightboxOpen]);

  return (
    <InteriorLayout activePage="amenities">
      <section className="am-fullpage">
        <div className="am-page">
          <aside className="am-sidebar">
            <div className="am-cat-list">
              {amenitiesCategories.map((cat, index) => {
                const Icon = categoryIcons[cat.id] || Sparkles;

                return (
                  <button
                    key={cat.id}
                    className={`am-cat-btn ${index === activeCat ? "is-active" : ""}`}
                    onClick={() => switchCategory(index)}
                    type="button"
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{cat.label}</span>
                    <small>{String(cat.images.length).padStart(2, "0")}</small>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="am-viewer">
            <div
              className="am-main-frame"
              style={{ "--am-bg": `url("${current.src}")` }}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                if (touch) startSwipe(touch.clientX, touch.clientY);
              }}
              onTouchEnd={(event) => {
                const touch = event.changedTouches[0];
                if (touch) finishSwipe(touch.clientX, touch.clientY);
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                mouseStartRef.current = null;
              }}
            >
              <span className="am-counter">
                {String(activeImg + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>

              <button
                className="am-main-open"
                type="button"
                onClick={() => {
                  if (didSwipeRef.current) return;
                  setIsLightboxOpen(true);
                }}
                aria-label={`Open ${current.name} in fullscreen`}
              >
                <img
                  key={`${activeCat}-${activeImg}`}
                  src={current.src}
                  alt={current.name}
                  className="am-main-img"
                  decoding="async"
                />
              </button>

              <div className="am-img-label">
                <span className="am-img-cat">{category.label.toUpperCase()}</span>
                <span className="am-img-name">{current.name}</span>
              </div>

              <button className="am-nav am-prev" onClick={() => go(-1)} aria-label="Previous">
                &#8249;
              </button>
              <button className="am-nav am-next" onClick={() => go(1)} aria-label="Next">
                &#8250;
              </button>
            </div>

            <div className="am-thumbs" ref={thumbsRef}>
              {category.images.map((image, index) => (
                <button
                  key={image.src}
                  className={`am-thumb ${index === activeImg ? "is-active" : ""}`}
                  onClick={() => pickImage(index)}
                  type="button"
                >
                  <img src={image.src} alt={image.name} loading="lazy" decoding="async" />
                  <span>{image.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isLightboxOpen && (
            <AmenitiesLightbox
              category={category}
              current={current}
              activeCat={activeCat}
              activeImg={activeImg}
              total={total}
              go={go}
              onClose={closeLightbox}
            />
          )}
        </div>
      </section>
    </InteriorLayout>
  );
}

function AmenitiesLightbox({
  category,
  current,
  activeCat,
  activeImg,
  total,
  go,
  onClose,
}) {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const gestureRef = React.useRef(null);

  React.useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    gestureRef.current = null;
  }, [current.src]);

  function clampZoom(value) {
    return Math.min(3.5, Math.max(1, value));
  }

  function changeZoom(nextZoom) {
    const clamped = clampZoom(nextZoom);
    setZoom(clamped);
    if (clamped === 1) setOffset({ x: 0, y: 0 });
  }

  function handleWheel(event) {
    event.preventDefault();
    changeZoom(zoom + (event.deltaY < 0 ? 0.18 : -0.18));
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gestureRef.current = {
      mode: zoom > 1.02 ? "pan" : "swipe",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  }

  function handlePointerMove(event) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.mode !== "pan") return;
    const dx = event.clientX - gesture.lastX;
    const dy = event.clientY - gesture.lastY;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    setOffset((currentOffset) => ({ x: currentOffset.x + dx, y: currentOffset.y + dy }));
  }

  function handlePointerUp(event) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;

    if (gesture.mode !== "swipe") return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      go(deltaX < 0 ? 1 : -1);
    }
  }

  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const [first, second] = event.touches;
      gestureRef.current = {
        mode: "pinch",
        distance: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY),
        zoom,
      };
    } else {
      gestureRef.current = null;
    }
  }

  function handleTouchMove(event) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.mode !== "pinch" || event.touches.length !== 2) return;
    event.preventDefault();
    const [first, second] = event.touches;
    const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
    changeZoom(gesture.zoom * (distance / gesture.distance));
  }

  return (
    <div
      className="lightbox-overlay amenities-lightbox"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      role="dialog"
      aria-modal="true"
      aria-label={`${current.name} fullscreen viewer`}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close fullscreen image">
        &times;
      </button>

      <button
        className="lightbox-nav lightbox-prev"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          go(-1);
        }}
        aria-label="Previous image"
      >
        &#8249;
      </button>

      <div
        className={`lightbox-content amenities-lightbox-content ${zoom > 1 ? "is-zoomed" : ""}`}
        onClick={(event) => event.stopPropagation()}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          gestureRef.current = null;
        }}
        onDoubleClick={() => changeZoom(zoom > 1 ? 1 : 2)}
      >
        <img
          key={`fullscreen-${activeCat}-${activeImg}`}
          src={current.src}
          alt={current.name}
          className="lightbox-img amenities-lightbox-img"
          draggable="false"
          decoding="async"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})` }}
        />
        <div className="lightbox-caption amenities-lightbox-caption">
          <span>{current.name}</span>
          <small>
            {String(activeImg + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} - {category.label}
          </small>
        </div>
      </div>

      <button
        className="lightbox-nav lightbox-next"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          go(1);
        }}
        aria-label="Next image"
      >
        &#8250;
      </button>
    </div>
  );
}
