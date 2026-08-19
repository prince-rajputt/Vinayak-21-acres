/* Custom premium SVG icons for the luxury real-estate footer nav */

const OverviewIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Modern building with glass panels */}
    <rect x="18" y="16" width="28" height="38" rx="2" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.08" />
    <rect x="22" y="20" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="34" y="20" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="22" y="30" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="34" y="30" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="22" y="40" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="34" y="40" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    {/* Door */}
    <rect x="28" y="48" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.22" />
    <circle cx="34.5" cy="51" r="0.8" fill="currentColor" />
    {/* Roof accent */}
    <path d="M16 16.5h32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M26 16V12h12v4" stroke="currentColor" strokeWidth="1.8" />
    <rect x="30" y="8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Map pin with inner circle */}
    <path
      d="M32 6C23.16 6 16 13.16 16 22c0 12 16 32 16 32s16-20 16-32c0-8.84-7.16-16-16-16z"
      stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.1"
    />
    <circle cx="32" cy="22" r="7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.18" />
    <circle cx="32" cy="22" r="3" fill="currentColor" fillOpacity="0.35" />
    {/* Subtle pulse rings */}
    <circle cx="32" cy="22" r="11" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
  </svg>
);

const AmenitiesIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Swimming pool / water with palm leaf */}
    <path d="M10 38c4-4 8 0 12-4s8 0 12-4 8 0 12-4 8 0 12-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M10 46c4-4 8 0 12-4s8 0 12-4 8 0 12-4 8 0 12-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M10 54c4-4 8 0 12-4s8 0 12-4 8 0 12-4 8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
    {/* Palm tree */}
    <line x1="20" y1="34" x2="20" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M20 18c-8 2-10 8-10 8s6-2 10-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="currentColor" fillOpacity="0.08" />
    <path d="M20 18c8 2 10 8 10 8s-6-2-10-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="currentColor" fillOpacity="0.08" />
    <path d="M20 18c-4-6-2-12-2-12s4 4 6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.06" />
    {/* Sun */}
    <circle cx="48" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.18" />
    <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
      <line x1="48" y1="5" x2="48" y2="7" />
      <line x1="48" y1="21" x2="48" y2="23" />
      <line x1="39" y1="14" x2="41" y2="14" />
      <line x1="55" y1="14" x2="57" y2="14" />
    </g>
  </svg>
);

const PlanIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Floor plan / blueprint */}
    <rect x="8" y="8" width="48" height="48" rx="3" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.06" />
    {/* Rooms */}
    <line x1="8" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="1.8" />
    <line x1="36" y1="8" x2="36" y2="56" stroke="currentColor" strokeWidth="1.8" />
    <line x1="36" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="1.8" />
    {/* Door gaps */}
    <line x1="18" y1="31" x2="26" y2="31" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.06" />
    {/* Door arcs */}
    <path d="M18 32a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
    <path d="M36 20a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
    {/* Room labels (small squares for furniture) */}
    <rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" />
    <rect x="14" y="40" width="10" height="6" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" />
    <rect x="42" y="14" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" />
    <rect x="42" y="46" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" />
    {/* Dimension lines */}
    <g stroke="currentColor" strokeWidth="0.7" opacity="0.3">
      <line x1="8" y1="60" x2="56" y2="60" />
      <line x1="8" y1="59" x2="8" y2="61" />
      <line x1="56" y1="59" x2="56" y2="61" />
    </g>
  </svg>
);

const SpecsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clipboard / document with specs */}
    <rect x="14" y="10" width="36" height="46" rx="3" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.06" />
    {/* Clipboard top */}
    <path d="M24 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
    <rect x="26" y="5" width="12" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
    {/* Spec lines */}
    <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="20" y1="27" x2="38" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="20" y1="33" x2="42" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="20" y1="39" x2="36" y2="39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Checkmarks */}
    <path d="M40 26l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    <path d="M40 38l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    {/* Bottom area detail */}
    <rect x="20" y="44" width="24" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
    <line x1="32" y1="44" x2="32" y2="51" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

const GalleryIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stacked photos with landscape */}
    {/* Back photo */}
    <rect x="14" y="8" width="40" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" transform="rotate(3 34 24)" />
    {/* Front photo */}
    <rect x="10" y="12" width="44" height="34" rx="3" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.08" />
    {/* Mountain landscape */}
    <path d="M10 38l12-14 8 8 6-6 18 12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
    {/* Sun in photo */}
    <circle cx="44" cy="22" r="4.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
    {/* Bottom gallery strip */}
    <rect x="10" y="52" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.12" />
    <rect x="26" y="52" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.18" />
    <rect x="42" y="52" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.12" />
  </svg>
);

const ContactIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Elegant envelope */}
    <rect x="6" y="14" width="52" height="36" rx="4" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.06" />
    {/* Envelope flap */}
    <path d="M6 18l24 16a4 4 0 0 0 4 0l24-16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    {/* Bottom fold lines */}
    <path d="M6 50l18-14" stroke="currentColor" strokeWidth="1.3" opacity="0.35" />
    <path d="M58 50l-18-14" stroke="currentColor" strokeWidth="1.3" opacity="0.35" />
    {/* Seal / dot */}
    <circle cx="32" cy="40" r="3.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="32" cy="40" r="1.5" fill="currentColor" fillOpacity="0.35" />
  </svg>
);

const navItems = [
  { label: "OVERVIEW", Icon: OverviewIcon, href: "#overview", page: "overview" },
  { label: "LOCATION", Icon: LocationIcon, href: "#location", page: "location" },
  { label: "AMENITIES", Icon: AmenitiesIcon, href: "#amenities", page: "amenities" },
  { label: "PLAN", Icon: PlanIcon, href: "#plans", page: "plans" },
  { label: "SPECS", Icon: SpecsIcon, href: "#specs", page: "specs" },
  { label: "GALLERY", Icon: GalleryIcon, href: "#gallery", page: "gallery" },
  { label: "REVIEW", Icon: ContactIcon, href: "#contact", page: "contact" },
];

export function SectionNav({ activePage }) {
  return (
    <nav className="section-nav" aria-label="Project sections">
      {navItems.map((item) => {
        const { Icon } = item;

        return (
          <a
            className={`section-nav-item ${activePage === item.page ? "is-active" : ""}`}
            href={item.href}
            key={item.label}
          >
            <span className="section-nav-icon">
              <Icon />
            </span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
