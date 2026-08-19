import React from "react";
import {
  Award,
  Building2,
  Home,
  Maximize2,
  Sparkles,
  Sun,
  Trees,
} from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import "./overview.css";

const highlights = [
  {
    value: "75%",
    label: "Open to sky",
    desc: "Vast landscaped areas promoting natural ventilation, daylight, and connection to sky",
    icon: Sun,
  },
  {
    value: "3-Acre",
    label: "Central Park",
    desc: "Expansive green central reserve featuring themed lawns, trees, paths, and water bodies",
    icon: Trees,
  },
  {
    value: "5 Towers",
    label: "Sanctioned G+21",
    desc: "Approved Phase 1 construction comprising 5 high-rise towers of G+21 with 750+ homes",
    icon: Building2,
  },
  {
    value: "900+ & 80+",
    label: "Towers & Villas",
    desc: "Future expansion proposed to feature a total of 5 towers, 900+ homes and 80+ villas",
    icon: Home,
  },
  {
    value: "Phase Club",
    label: "Dedicated Space",
    desc: "Every phase features its own independent state-of-the-art club for sports and leisure",
    icon: Sparkles,
  },
  {
    value: "Platinum",
    label: "IGBC Precertified",
    desc: "Highest rating for green buildings ensuring high energy savings, eco-friendly materials",
    icon: Award,
  },
];

export function OverviewPage() {
  const [showLightbox, setShowLightbox] = React.useState(false);

  return (
    <InteriorLayout activePage="overview">
      <div className="overview-container">
        <section className="overview-media-panel">
          <div className="image-frame" onClick={() => setShowLightbox(true)}>
            <img
              src="/assets/overview/AERIAL_VIEW.jpg"
              alt="Aerial View of Vinayak 21 Acres"
              className="overview-aerial-img"
            />
            <div className="image-overlay">
              <span className="expand-hint">
                <Maximize2 size={18} /> CLICK TO EXPAND AERIAL VIEW
              </span>
            </div>
          </div>
          <p className="artist-disclaimer">
            * Except for phases / buildings registered under WBRERA, all other buildings / villas shown are artist's
            impression of proposed development, not part of current offering and subject to change.
          </p>
        </section>

        <section className="overview-content-panel">
          <div className="overview-header-group">
            <span className="overview-eyebrow">Vinayak 21 Acres</span>
            <h1 className="overview-title">MORE THAN YOU IMAGINE</h1>
            <div className="overview-divider" />
          </div>

          <div className="overview-intro-text">
            <p>
              Vinayak 21 Acres, a one-of-a-kind residential project located off Newtown Action Area III, is defined by
              a scale rarely seen in this city.
            </p>
            <p>Its vast spaces bring the outdoors and indoors together, almost seamlessly.</p>
            <p className="overview-highlight-text">Here, life reinvents itself in spacious openness.</p>
          </div>

          <div className="highlights-grid">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="highlight-card">
                  <div className="highlight-icon-box">
                    <Icon size={24} className="highlight-icon" />
                  </div>
                  <div className="highlight-info">
                    <span className="highlight-value">{item.value}</span>
                    <span className="highlight-label">{item.label}</span>
                    <p className="highlight-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={() => setShowLightbox(false)} aria-label="Close image popup">
            &times;
          </button>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <img
              src="/assets/overview/AERIAL_VIEW.jpg"
              alt="Detailed Aerial View of Vinayak 21 Acres"
              className="lightbox-img"
            />
            <div className="lightbox-caption">
              <span>Vinayak 21 Acres - Aerial View Masterplan</span>
            </div>
          </div>
        </div>
      )}
    </InteriorLayout>
  );
}
