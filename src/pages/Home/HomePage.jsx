import React from "react";
import { FooterWidget } from "../../components/FooterWidget";
import { ReraLine } from "../../components/ReraLine";
import { VideoPopup } from "../../components/VideoPopup";
import { useExitPassword } from "../../components/ExitPasswordContext";
import { menuCards } from "../../data/menuCards";
import "./home.css";

export function HomePage() {
  return (
    <main className="page-shell">
      <section className="home-page">
        <TopBar />
        <CardRow />
        <BottomBar />
      </section>
    </main>
  );
}

function TopBar() {
  const [showWalkthrough, setShowWalkthrough] = React.useState(false);
  const { handleLogoTap } = useExitPassword();

  return (
    <header className="top-bar">
      <div className="top-bar-spacer" />

      <img
        className="project-logo"
        src="/assets/project-logo.png"
        alt="Vinayak 21 Acres"
        decoding="async"
        onClick={handleLogoTap}
        style={{ cursor: "pointer" }}
        title="Triple tap logo to exit app"
      />

      <div className="top-actions-wrapper">
        <button className="top-video-link" type="button" onClick={() => setShowWalkthrough(true)}>
          <span className="top-play-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
          <span>
            WALKTHROUGH
            <br />
            VIDEO
          </span>
        </button>
      </div>

      {showWalkthrough && (
        <VideoPopup src="/assets/walkthrough-video.mp4" onClose={() => setShowWalkthrough(false)} />
      )}
    </header>
  );
}

function CardRow() {
  return (
    <div className="card-row" aria-label="Main Navigation">
      {menuCards.map((card) => (
        <a className="menu-card" href={`#${card.page}`} key={card.page}>
          <img src={card.image} alt={card.title} decoding="async" />
          <div className="card-shade" />
          <h2>
            <span>{card.title}</span>
          </h2>
        </a>
      ))}
    </div>
  );
}

function BottomBar() {
  return (
    <footer className="bottom-bar">
      <div className="bottom-left-slot">
        <FooterWidget />
      </div>

      <div className="bottom-right-slot" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <a className="brochure-footer-link" href="#brochure">
          CLICK HERE TO GET
          <br />
          BROCHURE
        </a>
        <ReraLine />
      </div>
    </footer>
  );
}
