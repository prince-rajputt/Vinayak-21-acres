import { InteriorLayout } from "../../components/InteriorLayout";
import "./simple-page.css";

export function SimplePage({ title, page }) {
  return (
    <InteriorLayout activePage={page}>
      <section className="placeholder-page">
        <div className="placeholder-panel">
          <span className="eyebrow">Vinayak 21 Acres</span>
          <h1>{title}</h1>
          <p>This section is ready for your {title.toLowerCase()} content.</p>
        </div>
      </section>
    </InteriorLayout>
  );
}
