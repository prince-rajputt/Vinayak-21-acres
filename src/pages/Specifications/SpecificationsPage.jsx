import React from "react";
import {
  BedDouble,
  Building2,
  ChefHat,
  DoorClosed,
  Droplets,
  Home,
  Layers,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import "./specifications.css";

const specificationCards = [
  {
    id: "structure",
    title: "Structure",
    icon: Building2,
    items: [
      "Structure design for the optimum seismic consideration as stipulated by the IS code",
      "RCC Framed structure",
    ],
  },
  {
    id: "walls",
    title: "Walls",
    icon: Layers,
    items: ["Exterior Walls: Concrete walls using Mivan technology", "Interior Walls: AAC Blocks"],
  },
  {
    id: "living",
    title: "Living / Dining / Passage",
    icon: Home,
    items: ["Floor: Premium finish vitrified tiles", "Walls & Ceiling: Walls finished with Wall Putty"],
  },
  {
    id: "bedrooms",
    title: "Bedrooms",
    icon: BedDouble,
    items: ["Floor: Premium quality vitrified tiles in all bedrooms", "Walls: Walls finished with Wall Putty"],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    icon: ChefHat,
    items: [
      "Walls: Wall tiles up to 2' on counter wall",
      "Floor: Vitrified Tiles",
      "Counter: Granite counter",
      "Fitting/Fixtures: Stainless steel sink with reputed make fittings",
      "Adequate electrical points for kitchen appliances",
    ],
  },
  {
    id: "toilet",
    title: "Toilet",
    icon: Droplets,
    items: [
      "Walls: Wall tiles up to door height",
      "Floor: Anti-skid Tiles",
      "Sanitaryware and CP fittings of reputed make",
    ],
  },
  {
    id: "balcony",
    title: "Balcony & Sky Terrace",
    icon: Sun,
    items: ["Floor: Premium quality Vitrified Tiles", "Railing: MS Railing"],
  },
  {
    id: "doors",
    title: "Doors & Windows",
    icon: DoorClosed,
    items: ["Entrance Doors: Decorated flush doors", "Internal Doors: Flush doors", "Windows: Aluminum casement windows"],
  },
  {
    id: "electrical",
    title: "Electrical",
    icon: Zap,
    items: [
      "Modular switches and copper wiring in concealed conduits",
      "AC Points in all Bedrooms and Living/Dining area.",
    ],
  },
  {
    id: "lobby",
    title: "Lobby",
    icon: Sparkles,
    items: [
      "Exquisitely designed double-height entrance lobby on the ground floor",
      "Elevator: 3 Nos High-speed elevators in each tower.",
    ],
  },
  {
    id: "security",
    title: "Security & Others",
    icon: ShieldCheck,
    items: [
      "Video Door Phone",
      "CCTV surveillance in common areas",
      "Common toilets for drivers and house help",
      "Specially-abled friendly common area toilets",
    ],
  },
];

export function SpecificationsPage() {
  return (
    <InteriorLayout activePage="specs">
      <section className="spec-page" aria-label="Project specifications">
        <div className="spec-container">
          {specificationCards.map((spec) => {
            const Icon = spec.icon;

            return (
              <article className="spec-card" key={spec.title}>
                <div className="spec-card-header">
                  <span className="spec-icon-badge">
                    <Icon size={17} strokeWidth={2.2} />
                  </span>
                  <h3>{spec.title}</h3>
                </div>
                <ul className="spec-list">
                  {spec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </InteriorLayout>
  );
}
