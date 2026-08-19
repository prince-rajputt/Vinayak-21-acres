import React from "react";
import { SectionNav } from "./SectionNav";
import { FooterWidget } from "./FooterWidget";
import { useExitPassword } from "./ExitPasswordContext";

export function InteriorLayout({ activePage, children }) {
  return (
    <main className="interior-page interior-shell">
      <InteriorHeader />
      <div className="interior-content">{children}</div>
      <SectionNav activePage={activePage} />
    </main>
  );
}

function InteriorHeader() {
  const { handleLogoTap } = useExitPassword();

  return (
    <header className="interior-header">
      <a className="interior-home-button" href="#home" aria-label="Go to homepage">
        <span className="section-nav-icon">
          <HomeIcon />
        </span>
        <span>HOME</span>
      </a>

      <img
        className="interior-project-logo"
        src="/assets/project-logo.png"
        alt="Vinayak 21 Acres"
        onClick={handleLogoTap}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
        title="Triple tap logo to exit app"
      />

      <div className="interior-header-clock" style={{ gridColumn: "3", justifySelf: "end", paddingRight: "34px", zIndex: 3 }}>
        <FooterWidget />
      </div>
    </header>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Roof */}
      <path
        d="M4 22L24 6l20 16"
        stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.06"
      />
      {/* House body */}
      <rect x="9" y="22" width="30" height="20" rx="1.5"
        stroke="currentColor" strokeWidth="2.2"
        fill="currentColor" fillOpacity="0.08"
      />
      {/* Chimney */}
      <rect x="33" y="10" width="5" height="12" rx="1"
        stroke="currentColor" strokeWidth="1.8"
        fill="currentColor" fillOpacity="0.12"
      />
      {/* Left window */}
      <rect x="13" y="26" width="7" height="6" rx="1"
        stroke="currentColor" strokeWidth="1.5"
        fill="currentColor" fillOpacity="0.15"
      />
      <line x1="16.5" y1="26" x2="16.5" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="13" y1="29" x2="20" y2="29" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* Right window */}
      <rect x="28" y="26" width="7" height="6" rx="1"
        stroke="currentColor" strokeWidth="1.5"
        fill="currentColor" fillOpacity="0.15"
      />
      <line x1="31.5" y1="26" x2="31.5" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="28" y1="29" x2="35" y2="29" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* Door */}
      <rect x="19" y="33" width="10" height="9" rx="1.2"
        stroke="currentColor" strokeWidth="1.8"
        fill="currentColor" fillOpacity="0.18"
      />
      {/* Door knob */}
      <circle cx="27" cy="38" r="1" fill="currentColor" fillOpacity="0.5" />
      {/* Door arch */}
      <path d="M19 33h10" stroke="currentColor" strokeWidth="0" />
      <path d="M20 33a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}
