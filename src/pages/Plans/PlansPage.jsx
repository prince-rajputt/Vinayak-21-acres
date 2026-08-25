import React from "react";
import { Hand } from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import { TowerPlanViewer } from "./TowerPlanViewer";
import "./plans.css";

const MASTER_PLAN_SRC = "/assets/Master Plan.jpg";

// Positions as % of the image's natural width/height, placed just above each tower's label text.
const TOWER_HOTSPOTS = [
  { id: "T-1A", xPct: 48.28, yPct: 80.95 },
  { id: "T-1B", xPct: 59.16, yPct: 80.95 },
  { id: "T-2A", xPct: 65.11, yPct: 80.81 },
  { id: "T-2B", xPct: 75.29, yPct: 80.67 },
  { id: "T-2C", xPct: 73.27, yPct: 69.12 },
];

// Other amenity hotspots on the master plan.
const AMENITY_HOTSPOTS = [{ id: "Central Park", xPct: 61.24, yPct: 60.5 }];

const ALL_HOTSPOTS = [...TOWER_HOTSPOTS, ...AMENITY_HOTSPOTS];

// Plan images provided so far — hotspots not listed here have no image yet and stay disabled.
const TOWER_PLAN_DATA = {
  "Central Park": {
    overview: "/assets/plan/Central Park/Central Park Plan.jpg",
    units: {},
  },
  "T-1A": {
    overview: "/assets/plan/Tower-1A/Tower-1A.jpg",
    units: {
      A: "/assets/plan/Tower-1A/1A-A.jpg",
      B: "/assets/plan/Tower-1A/1A-B.jpg",
      C: "/assets/plan/Tower-1A/1A-C.jpg",
      D: "/assets/plan/Tower-1A/1A-D.jpg",
      E: "/assets/plan/Tower-1A/1A-E.jpg",
      F: "/assets/plan/Tower-1A/1A-F.jpg",
      G: "/assets/plan/Tower-1A/1A-G.jpg",
      H: "/assets/plan/Tower-1A/1A-H.jpg",
    },
  },
  "T-1B": {
    overview: "/assets/plan/Tower Plans/Tower-1B.jpg",
    units: {
      A: "/assets/plan/Unit Plans/Tower-1B/A.jpg",
      B: "/assets/plan/Unit Plans/Tower-1B/B.jpg",
      C: "/assets/plan/Unit Plans/Tower-1B/C.jpg",
      D: "/assets/plan/Unit Plans/Tower-1B/D.jpg",
      E: "/assets/plan/Unit Plans/Tower-1B/E.jpg",
      F: "/assets/plan/Unit Plans/Tower-1B/F.jpg",
      G: "/assets/plan/Unit Plans/Tower-1B/G.jpg",
      H: "/assets/plan/Unit Plans/Tower-1B/H.jpg",
    },
  },
  "T-2A": {
    overview: "/assets/plan/Tower Plans/Tower-2A.jpg",
    units: {
      A: "/assets/plan/Unit Plans/Tower-2A/A.jpg",
      B: "/assets/plan/Unit Plans/Tower-2A/B.jpg",
      C: "/assets/plan/Unit Plans/Tower-2A/C.jpg",
      D: "/assets/plan/Unit Plans/Tower-2A/D.jpg",
      E: "/assets/plan/Unit Plans/Tower-2A/E.jpg",
      F: "/assets/plan/Unit Plans/Tower-2A/F.jpg",
      G: "/assets/plan/Unit Plans/Tower-2A/G.jpg",
      H: "/assets/plan/Unit Plans/Tower-2A/H.jpg",
    },
  },
  "T-2B": {
    overview: "/assets/plan/Tower Plans/Tower-2B.jpg",
    units: {
      A: "/assets/plan/Unit Plans/Tower-2B/A.jpg",
      B: "/assets/plan/Unit Plans/Tower-2B/B.jpg",
      C: "/assets/plan/Unit Plans/Tower-2B/C.jpg",
      D: "/assets/plan/Unit Plans/Tower-2B/D.jpg",
      E: "/assets/plan/Unit Plans/Tower-2B/E.jpg",
      F: "/assets/plan/Unit Plans/Tower-2B/F.jpg",
      G: "/assets/plan/Unit Plans/Tower-2B/G.jpg",
      H: "/assets/plan/Unit Plans/Tower-2B/H.jpg",
    },
  },
  "T-2C": {
    overview: "/assets/plan/Tower Plans/Tower-2C.jpg",
    units: {
      A: "/assets/plan/Unit Plans/Tower-2C/A.jpg",
      B: "/assets/plan/Unit Plans/Tower-2C/B.jpg",
      C: "/assets/plan/Unit Plans/Tower-2C/C.jpg",
      D: "/assets/plan/Unit Plans/Tower-2C/D.jpg",
      E: "/assets/plan/Unit Plans/Tower-2C/E.jpg",
      F: "/assets/plan/Unit Plans/Tower-2C/F.jpg",
      G: "/assets/plan/Unit Plans/Tower-2C/G.jpg",
      H: "/assets/plan/Unit Plans/Tower-2C/H.jpg",
    },
  },
};

function getContainedImageRect(containerWidth, containerHeight, naturalWidth, naturalHeight) {
  const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const left = (containerWidth - width) / 2;
  const top = (containerHeight - height) / 2;
  return { left, top, width, height };
}

export function PlansPage() {
  const [isEnlarged, setIsEnlarged] = React.useState(false);
  const [imageRect, setImageRect] = React.useState(null);
  const [activeTowerId, setActiveTowerId] = React.useState(null);
  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);

  const activeTowerData = activeTowerId ? TOWER_PLAN_DATA[activeTowerId] : null;

  React.useEffect(() => {
    if (!isEnlarged) return;
    function onKey(e) {
      if (e.key === "Escape") {
        if (activeTowerId) setActiveTowerId(null);
        else setIsEnlarged(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEnlarged, activeTowerId]);

  const recomputeRect = React.useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth) return;
    setImageRect(
      getContainedImageRect(container.clientWidth, container.clientHeight, img.naturalWidth, img.naturalHeight)
    );
  }, []);

  React.useEffect(() => {
    if (!isEnlarged) return;
    recomputeRect();
    window.addEventListener("resize", recomputeRect);
    return () => window.removeEventListener("resize", recomputeRect);
  }, [isEnlarged, recomputeRect]);

  return (
    <InteriorLayout activePage="plans">
      <section className="plans-page plans-page-master-only">
        <button
          className="master-plan-image-frame master-plan-image-button"
          type="button"
          onClick={() => setIsEnlarged(true)}
          aria-label="Enlarge master plan"
        >
          <img src={MASTER_PLAN_SRC} alt="Vinayak 21 Acres Master Plan" decoding="async" />
          <span className="master-plan-enlarge-hint">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
            Click to enlarge
          </span>
        </button>
      </section>

      {isEnlarged && (
        <div className="location-popup" role="dialog" aria-modal="true" onClick={() => setIsEnlarged(false)}>
          <button
            className="popup-close popup-close-neumorphism"
            type="button"
            onClick={() => setIsEnlarged(false)}
            aria-label="Close enlarged master plan"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="popup-content" ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <img
              ref={imgRef}
              className="popup-image"
              src={MASTER_PLAN_SRC}
              alt="Vinayak 21 Acres Master Plan"
              decoding="async"
              onLoad={recomputeRect}
            />

            {imageRect &&
              ALL_HOTSPOTS.map((hotspot) => {
                const hasImage = Boolean(TOWER_PLAN_DATA[hotspot.id]);
                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    className="tower-tap-indicator"
                    style={{
                      left: imageRect.left + (hotspot.xPct / 100) * imageRect.width,
                      top: imageRect.top + (hotspot.yPct / 100) * imageRect.height,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasImage) setActiveTowerId(hotspot.id);
                    }}
                    aria-label={`View ${hotspot.id}`}
                    disabled={!hasImage}
                  >
                    <span className="tower-tap-ripple" />
                    <span className="tower-tap-badge">
                      <Hand size={18} strokeWidth={2.2} />
                    </span>
                  </button>
                );
              })}
          </div>

          {activeTowerData && (
            <TowerPlanViewer
              towerId={activeTowerId}
              overviewSrc={activeTowerData.overview}
              unitImages={activeTowerData.units}
              onClose={() => setActiveTowerId(null)}
            />
          )}
        </div>
      )}
    </InteriorLayout>
  );
}
