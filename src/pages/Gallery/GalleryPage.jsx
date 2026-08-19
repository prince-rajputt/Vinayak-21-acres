import React from "react";
import { Building2, Film, Landmark, Maximize2, Play, Sparkles, Trees, Waves } from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import { galleryCategories } from "../../data/gallery";
import "./gallery.css";

const categoryIcons = {
  "unit-interior-views": Building2,
  "podium-club": Waves,
  "maidaan-and-more": Sparkles,
  "elevation-and-gate": Landmark,
  "central-park": Trees,
  "videos": Film,
};

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [activeItem, setActiveItem] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const thumbnailRailRef = React.useRef(null);
  const swipeStartRef = React.useRef(null);
  const mouseSwipeStartRef = React.useRef(null);
  const didSwipeRef = React.useRef(false);

  const videoRef = React.useRef(null);
  const [volume, setVolume] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(true);

  const category = galleryCategories[activeCategory];
  const item = category.items[activeItem];
  const isVideo = category.mediaType === "video";
  const total = category.items.length;

  React.useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted || volume === 0;
    }
  }, [volume, isMuted, isVideo, item.src]);

  function handleVolumeChange(event) {
    event.stopPropagation();
    const val = parseFloat(event.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  }

  function toggleMute(event) {
    event.stopPropagation();
    if (isMuted || volume === 0) {
      const newVol = 0.8;
      setVolume(newVol);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  }

  function switchCategory(categoryIndex) {
    setActiveCategory(categoryIndex);
    setActiveItem(0);
    setIsLightboxOpen(false);
  }

  function pickItem(itemIndex) {
    setActiveItem(itemIndex);
    thumbnailRailRef.current?.children[itemIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  function go(direction) {
    setActiveItem((itemIndex) => (itemIndex + direction + total) % total);
  }

  function startSwipe(clientX, clientY) {
    swipeStartRef.current = { x: clientX, y: clientY };
  }

  function finishSwipe(clientX, clientY) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    didSwipeRef.current = false;
    if (!start || total < 2) return;

    const deltaX = clientX - start.x;
    const deltaY = clientY - start.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      didSwipeRef.current = true;
      go(deltaX < 0 ? 1 : -1);
      window.setTimeout(() => {
        didSwipeRef.current = false;
      }, 350);
    }
  }

  function handleMouseDown(event) {
    mouseSwipeStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handleMouseUp(event) {
    const start = mouseSwipeStartRef.current;
    mouseSwipeStartRef.current = null;
    if (!start) return;
    startSwipe(start.x, start.y);
    finishSwipe(event.clientX, event.clientY);
  }

  React.useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  return (
    <InteriorLayout activePage="gallery">
      <section className="gallery-page">
        <div className="gallery-stage">
          <aside className="gallery-tabs" aria-label="Gallery categories">
            {galleryCategories.map((tab, index) => {
              const Icon = categoryIcons[tab.id] || (tab.mediaType === "video" ? Film : Sparkles);

              return (
                <button
                  className={`gallery-tab ${index === activeCategory ? "is-active" : ""}`}
                  key={tab.id}
                  onClick={() => switchCategory(index)}
                  type="button"
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{tab.label}</span>
                  <small>{String(tab.items.length).padStart(2, "0")}</small>
                </button>
              );
            })}
          </aside>

          <div className="gallery-viewer">
            <div
              className={`gallery-feature ${isVideo ? "is-video" : ""}`}
              style={!isVideo ? { "--gallery-bg": `url("${item.src}")` } : undefined}
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
                mouseSwipeStartRef.current = null;
              }}
            >
              <div className="gallery-feature-toolbar">
                <span>
                  <Sparkles size={16} strokeWidth={1.8} />
                  {category.label}
                </span>
                <span>
                  {String(activeItem + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>

              {isVideo ? (
                <div
                  className="gallery-video-wrapper"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Click to play video in fullscreen"
                >
                  <video
                    key={item.src}
                    ref={videoRef}
                    className="gallery-main-media"
                    src={item.src}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                  />

                  {/* Inline Volume Bar */}
                  <div className="location-volume-bar gallery-volume-bar" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="location-volume-btn"
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      )}
                    </button>
                    <input
                      className="location-volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                    />
                  </div>
                </div>
              ) : (
                <button
                  className="gallery-open-media"
                  type="button"
                  onClick={() => {
                    if (didSwipeRef.current) {
                      return;
                    }
                    setIsLightboxOpen(true);
                  }}
                  aria-label={`Open ${item.name} fullscreen`}
                >
                  <img
                    key={item.src}
                    className="gallery-main-media"
                    src={item.src}
                    alt={item.name}
                    decoding="async"
                  />
                  <span className="gallery-expand">
                    <Maximize2 size={18} strokeWidth={1.8} />
                    View
                  </span>
                </button>
              )}

              <div className="gallery-caption">
                <span>{category.mediaType === "video" ? "Video tour (Tap for Fullscreen)" : "Image view"}</span>
                <strong>{item.name}</strong>
              </div>

              {total > 1 && (
                <>
                  <button className="gallery-arrow gallery-prev" type="button" onClick={() => go(-1)} aria-label="Previous">
                    &#8249;
                  </button>
                  <button className="gallery-arrow gallery-next" type="button" onClick={() => go(1)} aria-label="Next">
                    &#8250;
                  </button>
                </>
              )}
            </div>

            <div className="gallery-thumbs" ref={thumbnailRailRef}>
              {category.items.map((media, index) => (
                <button
                  className={`gallery-thumb ${index === activeItem ? "is-active" : ""}`}
                  key={media.src}
                  onClick={() => pickItem(index)}
                  type="button"
                >
                  {category.mediaType === "video" ? (
                    <span className="gallery-video-thumb">
                      <span className="gallery-video-thumb-bg" />
                      <span>
                        <Play size={18} fill="currentColor" strokeWidth={1.8} />
                      </span>
                    </span>
                  ) : (
                    <img src={media.src} alt={media.name} loading="lazy" decoding="async" />
                  )}
                  <small>{media.name}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fullscreen Video Popup */}
        {isLightboxOpen && isVideo && (
          <GalleryVideoPopup item={item} onClose={() => setIsLightboxOpen(false)} />
        )}

        {/* Fullscreen Image Lightbox */}
        {isLightboxOpen && !isVideo && (
          <GalleryLightbox
            category={category}
            item={item}
            activeItem={activeItem}
            total={total}
            go={go}
            onClose={() => setIsLightboxOpen(false)}
          />
        )}
      </section>
    </InteriorLayout>
  );
}

function GalleryVideoPopup({ item, onClose }) {
  const popupVideoRef = React.useRef(null);
  const [popupVolume, setPopupVolume] = React.useState(0.8);
  const [popupMuted, setPopupMuted] = React.useState(false);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    if (popupVideoRef.current) {
      popupVideoRef.current.volume = popupVolume;
      popupVideoRef.current.muted = popupMuted;
    }
  }, [popupVolume, popupMuted]);

  function handlePopupVolumeChange(event) {
    const val = parseFloat(event.target.value);
    setPopupVolume(val);
    setPopupMuted(val === 0);
  }

  function togglePopupMute() {
    if (popupMuted || popupVolume === 0) {
      const newVol = 0.8;
      setPopupVolume(newVol);
      setPopupMuted(false);
    } else {
      setPopupMuted(true);
    }
  }

  return (
    <div className="location-popup" role="dialog" aria-modal="true">
      {/* Neumorphism Styled Close Cross Button */}
      <button className="popup-close popup-close-neumorphism" type="button" onClick={onClose} aria-label="Close fullscreen video">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="popup-content">
        <div className="popup-video-wrapper">
          <video
            ref={popupVideoRef}
            className="popup-video"
            src={item.src}
            autoPlay
            loop
            playsInline
            preload="metadata"
          />

          {/* Fullscreen Volume Control Bar */}
          <div className="location-volume-bar popup-volume-bar">
            <button
              className="location-volume-btn"
              type="button"
              onClick={togglePopupMute}
              aria-label={popupMuted || popupVolume === 0 ? "Unmute" : "Mute"}
            >
              {popupMuted || popupVolume === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
            <input
              className="location-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={popupMuted ? 0 : popupVolume}
              onChange={handlePopupVolumeChange}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryLightbox({ category, item, activeItem, total, go, onClose }) {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const gestureRef = React.useRef(null);

  React.useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    gestureRef.current = null;
  }, [item.src]);

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
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  }

  function handlePointerUp(event) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;

    if (gesture.mode !== "swipe" || total < 2) return;
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
    <div className="gallery-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.name}>
      {/* Neumorphism Styled Close Cross Button */}
      <button className="gallery-lightbox-close popup-close-neumorphism" type="button" onClick={onClose} aria-label="Close fullscreen image">
        &times;
      </button>

      {total > 1 && (
        <button
          className="gallery-lightbox-nav gallery-lightbox-prev"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
          aria-label="Previous image"
        >
          &#8249;
        </button>
      )}

      <figure
        className={`gallery-lightbox-figure ${zoom > 1 ? "is-zoomed" : ""}`}
        onClick={(event) => event.stopPropagation()}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          gestureRef.current = null;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onDoubleClick={() => changeZoom(zoom > 1 ? 1 : 2)}
      >
        <img
          src={item.src}
          alt={item.name}
          decoding="async"
          draggable="false"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})` }}
        />
        <figcaption>
          <strong>{item.name}</strong>
          <span>
            {String(activeItem + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} - {category.label}
          </span>
        </figcaption>
      </figure>

      {total > 1 && (
        <button
          className="gallery-lightbox-nav gallery-lightbox-next"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
          aria-label="Next image"
        >
          &#8250;
        </button>
      )}
    </div>
  );
}
