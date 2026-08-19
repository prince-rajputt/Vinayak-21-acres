import { Building2, MapPin, Phone } from "lucide-react";
import { InteriorLayout } from "../../components/InteriorLayout";
import "./contact.css";

export function ContactPage() {
  return (
    <InteriorLayout activePage="contact">
      <section className="contact-page">
        <div className="contact-hero">
          <h1>CONTACT</h1>
          <p>Connect with the Vinayak 21 Acres team for site visits, project details, and booking assistance.</p>
        </div>

        <div className="contact-grid">
          <a className="contact-call-card" href="tel:+917620568888">
            <span className="contact-icon">
              <Phone size={30} strokeWidth={1.8} />
            </span>
            <span className="contact-card-label">Call Us</span>
            <strong>+91-7620568888</strong>
            <span className="contact-card-note">Tap to call directly</span>
          </a>

          <div className="contact-info-card">
            <div className="contact-info-heading">
              <Building2 size={30} strokeWidth={1.7} />
              <span>Corporate Address</span>
            </div>
            <p>
              Vinayak Corporate House
              <br />
              122/1R Satyendranath Majumder Sarani
              <br />
              Kolkata 700 026
            </p>
            <a href="https://www.vinayakgroup.org" target="_blank" rel="noreferrer">
              www.vinayakgroup.org
            </a>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-heading">
              <MapPin size={30} strokeWidth={1.7} />
              <span>Site Address</span>
            </div>
            <p>
              Vinayak 21 Acres, Hatishala
              <br />
              Off Newtown Action Area III
              <br />
              Kolkata
            </p>
          </div>
        </div>

        <div className="contact-rera-panel" aria-label="RERA registration details">
          <div>
            <span>Phase 1</span>
            <strong>WBRERA/P/SOU/2026/004147</strong>
            <a href="https://rera.wb.gov.in" target="_blank" rel="noreferrer">
              rera.wb.gov.in
            </a>
          </div>
          <div>
            <span>Phase 2</span>
            <strong>WBRERA/P/SOU/2026/004275</strong>
            <a href="https://rera.wb.gov.in" target="_blank" rel="noreferrer">
              rera.wb.gov.in
            </a>
          </div>
        </div>
      </section>
    </InteriorLayout>
  );
}
