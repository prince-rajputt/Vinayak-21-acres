import React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import "./plans.css";

const UNIT_TYPES = ["A", "B", "C", "D", "E", "F", "G", "H"];

const towerPlans = ["1B", "2A", "2B", "2C"].map((tower) => ({
  id: tower,
  name: `Tower ${tower}`,
  planSrc: `/assets/plan/Tower%20Plans/Tower-${tower}.jpg`,
  units: UNIT_TYPES.map((type) => ({
    type,
    name: `Tower ${tower} - Type ${type}`,
    src: `/assets/plan/Unit%20Plans/Tower-${tower}/${type}.jpg`,
  })),
}));

export function PlansPage() {
  const [selectedTowerId, setSelectedTowerId] = React.useState(null);
  const [activeUnitIndex, setActiveUnitIndex] = React.useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [unitSlideIndex, setUnitSlideIndex] = React.useState(0);

  const lightboxRailRef = React.useRef(null);
  const lightboxGestureRef = React.useRef(null);
  const [lightboxZoom, setLightboxZoom] = React.useState(1);
  const [lightboxOffset, setLightboxOffset] = React.useState({ x: 0, y: 0 });

  const selectedTower = towerPlans.find((tower) => tower.id === selectedTowerId);
  const activeUnit =
    selectedTower && activeUnitIndex !== null ? selectedTower.units[activeUnitIndex] : null;

  const totalTowerSlides = Math.ceil(towerPlans.length / 2);
  const totalUnitSlides = selectedTower ? Math.ceil(selectedTower.units.length / 4) : 2;

  // Touch & Mouse Drag Swipe Refs
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const isMouseDown = React.useRef(false);
  const mouseStartX = React.useRef(0);

  const closeUnitPreview = React.useCallback(() => setActiveUnitIndex(null), []);

  const showPreviousUnit = React.useCallback(() => {
    if (!selectedTower) return;
    setActiveUnitIndex((current) =>
      current === null ? 0 : (current - 1 + selectedTower.units.length) % selectedTower.units.length,
    );
  }, [selectedTower]);

  const showNextUnit = React.useCallback(() => {
    if (!selectedTower) return;
    setActiveUnitIndex((current) =>
      current === null ? 0 : (current + 1) % selectedTower.units.length,
    );
  }, [selectedTower]);

  // Auto scroll active thumbnail in lightbox rail
  React.useEffect(() => {
    if (activeUnitIndex !== null && lightboxRailRef.current) {
      lightboxRailRef.current.children[activeUnitIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    setLightboxZoom(1);
    setLightboxOffset({ x: 0, y: 0 });
    lightboxGestureRef.current = null;
  }, [activeUnitIndex]);

  function clampLightboxZoom(value) {
    return Math.min(3.5, Math.max(1, value));
  }

  function changeLightboxZoom(nextZoom) {
    const clamped = clampLightboxZoom(nextZoom);
    setLightboxZoom(clamped);
    if (clamped === 1) setLightboxOffset({ x: 0, y: 0 });
  }

  function handleLightboxWheel(event) {
    event.preventDefault();
    changeLightboxZoom(lightboxZoom + (event.deltaY < 0 ? 0.18 : -0.18));
  }

  function handleLightboxPointerDown(event) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    lightboxGestureRef.current = {
      mode: lightboxZoom > 1.02 ? "pan" : "swipe",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  }

  function handleLightboxPointerMove(event) {
    const gesture = lightboxGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.mode !== "pan") return;
    event.stopPropagation();
    const dx = event.clientX - gesture.lastX;
    const dy = event.clientY - gesture.lastY;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    setLightboxOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  }

  function handleLightboxPointerUp(event) {
    const gesture = lightboxGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.stopPropagation();
    lightboxGestureRef.current = null;

    if (gesture.mode !== "swipe") return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) showNextUnit();
      else showPreviousUnit();
    }
  }

  function handleLightboxTouchStart(event) {
    if (event.touches.length === 2) {
      const [first, second] = event.touches;
      lightboxGestureRef.current = {
        mode: "pinch",
        distance: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY),
        zoom: lightboxZoom,
      };
    }
  }

  function handleLightboxTouchMove(event) {
    const gesture = lightboxGestureRef.current;
    if (!gesture || gesture.mode !== "pinch" || event.touches.length !== 2) return;
    event.preventDefault();
    const [first, second] = event.touches;
    const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
    changeLightboxZoom(gesture.zoom * (distance / gesture.distance));
  }

  // Touch Handlers for Hand Swipe Gestures
  function handleTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          if (selectedTowerId) {
            setUnitSlideIndex((prev) => Math.min(totalUnitSlides - 1, prev + 1));
          } else {
            setCurrentSlideIndex((prev) => Math.min(totalTowerSlides - 1, prev + 1));
          }
        } else {
          if (selectedTowerId) {
            setUnitSlideIndex((prev) => Math.max(0, prev - 1));
          } else {
            setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
          }
        }
      }
    }
  }

  // Mouse Drag Handlers for Hand Drag Gestures
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
        if (selectedTowerId) {
          setUnitSlideIndex((prev) => Math.min(totalUnitSlides - 1, prev + 1));
        } else {
          setCurrentSlideIndex((prev) => Math.min(totalTowerSlides - 1, prev + 1));
        }
      } else {
        if (selectedTowerId) {
          setUnitSlideIndex((prev) => Math.max(0, prev - 1));
        } else {
          setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
        }
      }
    }
  }

  function handleMouseLeave() {
    isMouseDown.current = false;
  }

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (activeUnitIndex !== null) {
          closeUnitPreview();
        } else if (selectedTowerId) {
          setSelectedTowerId(null);
        }
      }

      if (activeUnitIndex !== null && event.key === "ArrowLeft") {
        showPreviousUnit();
      } else if (selectedTowerId && event.key === "ArrowLeft") {
        setUnitSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (!selectedTowerId && event.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      }

      if (activeUnitIndex !== null && event.key === "ArrowRight") {
        showNextUnit();
      } else if (selectedTowerId && event.key === "ArrowRight") {
        setUnitSlideIndex((prev) => Math.min(totalUnitSlides - 1, prev + 1));
      } else if (!selectedTowerId && event.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => Math.min(totalTowerSlides - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeUnitIndex,
    closeUnitPreview,
    selectedTowerId,
    showNextUnit,
    showPreviousUnit,
    totalTowerSlides,
    totalUnitSlides,
  ]);

  const openTower = (towerId) => {
    setSelectedTowerId(towerId);
    setActiveUnitIndex(null);
    setUnitSlideIndex(0);
  };

  const showAllTowers = () => {
    setSelectedTowerId(null);
    setActiveUnitIndex(null);
    setUnitSlideIndex(0);
  };

  return (
    <InteriorLayout activePage="plans">
      <section className={`plans-page${selectedTower ? " is-unit-view" : ""}`}>
        {selectedTower ? (
          /* Unit Plans View with Paginated Slider (4 Large Images per Slide) */
          <div
            className="unit-plans-stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="unit-stage-header">
              <button className="plans-back-button" type="button" onClick={showAllTowers}>
                <ArrowLeft size={16} strokeWidth={2.2} />
                <span>Back</span>
              </button>

              <div className="unit-stage-title">
                <h2>{selectedTower.name}</h2>
                <span className="unit-stage-badge">Page {unitSlideIndex + 1} of {totalUnitSlides}</span>
              </div>
            </div>

            {/* Slider Container with Left/Right Arrows */}
            <div className="tower-slider-wrapper">
              <button
                className="tower-slider-arrow is-left"
                type="button"
                onClick={() => setUnitSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={unitSlideIndex === 0}
                aria-label="Previous unit plans page"
              >
                <ChevronLeft size={26} strokeWidth={2.2} />
              </button>

              <div className="tower-slider-viewport">
                <div
                  className="tower-slider-track"
                  style={{ transform: `translateX(-${unitSlideIndex * 100}%)` }}
                >
                  {/* Slide 1: Types A - D */}
                  <div className="unit-slide-grid">
                    {selectedTower.units.slice(0, 4).map((unit, index) => (
                      <button
                        className="unit-plan-card"
                        type="button"
                        key={unit.src}
                        onClick={() => setActiveUnitIndex(index)}
                        aria-label={`Open ${unit.name}`}
                      >
                        <div className="unit-card-header">
                          <span className="unit-badge">TYPE {unit.type}</span>
                        </div>
                        <span className="unit-plan-image-frame">
                          <img src={unit.src} alt={unit.name} loading="lazy" decoding="async" />
                          <span className="plan-zoom-icon" aria-hidden="true">
                            <Maximize2 size={22} />
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Slide 2: Types E - H */}
                  <div className="unit-slide-grid">
                    {selectedTower.units.slice(4, 8).map((unit, index) => (
                      <button
                        className="unit-plan-card"
                        type="button"
                        key={unit.src}
                        onClick={() => setActiveUnitIndex(index + 4)}
                        aria-label={`Open ${unit.name}`}
                      >
                        <div className="unit-card-header">
                          <span className="unit-badge">TYPE {unit.type}</span>
                        </div>
                        <span className="unit-plan-image-frame">
                          <img src={unit.src} alt={unit.name} loading="lazy" decoding="async" />
                          <span className="plan-zoom-icon" aria-hidden="true">
                            <Maximize2 size={22} />
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="tower-slider-arrow is-right"
                type="button"
                onClick={() => setUnitSlideIndex((prev) => Math.min(totalUnitSlides - 1, prev + 1))}
                disabled={unitSlideIndex === totalUnitSlides - 1}
                aria-label="Next unit plans page"
              >
                <ChevronRight size={26} strokeWidth={2.2} />
              </button>
            </div>

            {/* Slide Dots Indicator */}
            <div className="tower-slider-dots">
              {Array.from({ length: totalUnitSlides }).map((_, idx) => (
                <button
                  key={idx}
                  className={`tower-slider-dot ${idx === unitSlideIndex ? "is-active" : ""}`}
                  onClick={() => setUnitSlideIndex(idx)}
                  type="button"
                  aria-label={`Go to unit plans page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Tower Selection View with Paginated Slider (2 Images per Slide) */
          <div
            className="tower-slider-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tower-slider-wrapper">
              <button
                className="tower-slider-arrow is-left"
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                aria-label="Previous tower plans"
              >
                <ChevronLeft size={26} strokeWidth={2.2} />
              </button>

              <div className="tower-slider-viewport">
                <div
                  className="tower-slider-track"
                  style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                >
                  {/* Slide 1 */}
                  <div className="tower-slide">
                    {towerPlans.slice(0, 2).map((tower) => (
                      <button
                        className="tower-plan-card"
                        type="button"
                        key={tower.id}
                        onClick={() => openTower(tower.id)}
                        aria-label={`Open ${tower.name} unit plans`}
                      >
                        <span className="tower-plan-image-frame">
                          <img src={tower.planSrc} alt={`${tower.name} plan`} decoding="async" />
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Slide 2 */}
                  <div className="tower-slide">
                    {towerPlans.slice(2, 4).map((tower) => (
                      <button
                        className="tower-plan-card"
                        type="button"
                        key={tower.id}
                        onClick={() => openTower(tower.id)}
                        aria-label={`Open ${tower.name} unit plans`}
                      >
                        <span className="tower-plan-image-frame">
                          <img src={tower.planSrc} alt={`${tower.name} plan`} decoding="async" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="tower-slider-arrow is-right"
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.min(totalTowerSlides - 1, prev + 1))}
                disabled={currentSlideIndex === totalTowerSlides - 1}
                aria-label="Next tower plans"
              >
                <ChevronRight size={26} strokeWidth={2.2} />
              </button>
            </div>

            {/* Slide Navigation Indicator Dots */}
            <div className="tower-slider-dots">
              {Array.from({ length: totalTowerSlides }).map((_, idx) => (
                <button
                  key={idx}
                  className={`tower-slider-dot ${idx === currentSlideIndex ? "is-active" : ""}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox Modal with Phone Gallery Style Bottom Thumbnail Preview Rail */}
      {activeUnit && (
        <div
          className="plan-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeUnit.name} full-screen preview`}
          onClick={closeUnitPreview}
        >
          <div className="plan-lightbox-toolbar">
            <div>
              <span>{selectedTower.name}</span>
              <strong>Type {activeUnit.type}</strong>
            </div>
            <button className="popup-close-neumorphism" type="button" onClick={closeUnitPreview} aria-label="Close unit plan">
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <button
            className="plan-lightbox-arrow is-previous"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPreviousUnit();
            }}
            aria-label="Show previous unit plan"
          >
            <ChevronLeft size={38} aria-hidden="true" />
          </button>

          <div
            className={`plan-lightbox-image-stage ${lightboxZoom > 1 ? "is-zoomed" : ""}`}
            onClick={(event) => event.stopPropagation()}
            onWheel={handleLightboxWheel}
            onPointerDown={handleLightboxPointerDown}
            onPointerMove={handleLightboxPointerMove}
            onPointerUp={handleLightboxPointerUp}
            onPointerCancel={() => {
              lightboxGestureRef.current = null;
            }}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onDoubleClick={() => changeLightboxZoom(lightboxZoom > 1 ? 1 : 2)}
          >
            <img
              className="plan-lightbox-image"
              src={activeUnit.src}
              alt={activeUnit.name}
              draggable="false"
              style={{
                transform: `translate3d(${lightboxOffset.x}px, ${lightboxOffset.y}px, 0) scale(${lightboxZoom})`,
              }}
            />
          </div>

          <button
            className="plan-lightbox-arrow is-next"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNextUnit();
            }}
            aria-label="Show next unit plan"
          >
            <ChevronRight size={38} aria-hidden="true" />
          </button>

          {/* Bottom Phone Gallery Style Thumbnail Strip */}
          <div className="plan-lightbox-thumbs-bar" onClick={(e) => e.stopPropagation()}>
            <div className="plan-lightbox-thumbs-rail" ref={lightboxRailRef}>
              {selectedTower.units.map((unit, idx) => (
                <button
                  key={unit.src}
                  className={`plan-lightbox-thumb ${idx === activeUnitIndex ? "is-active" : ""}`}
                  onClick={() => setActiveUnitIndex(idx)}
                  type="button"
                  title={`Type ${unit.type}`}
                >
                  <img src={unit.src} alt={unit.name} />
                  <span className="plan-thumb-label">TYPE {unit.type}</span>
                </button>
              ))}
            </div>
            <span className="plan-lightbox-progress">
              {activeUnitIndex + 1} / {selectedTower.units.length}
            </span>
          </div>
        </div>
      )}
    </InteriorLayout>
  );
}
