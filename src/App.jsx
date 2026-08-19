import React from "react";
import { AmenitiesPage } from "./pages/Amenities/AmenitiesPage";
import { BrochurePage } from "./pages/Brochure/BrochurePage";
import { ContactPage } from "./pages/Contact/ContactPage";
import { GalleryPage } from "./pages/Gallery/GalleryPage";
import { HomePage } from "./pages/Home/HomePage";
import { LocationPage } from "./pages/Location/LocationPage";
import { OverviewPage } from "./pages/Overview/OverviewPage";
import { PlansPage } from "./pages/Plans/PlansPage";
import { SimplePage } from "./pages/SimplePage/SimplePage";
import { SpecificationsPage } from "./pages/Specifications/SpecificationsPage";
import { pageTitles } from "./data/site";
import { useCurrentPage } from "./hooks/useCurrentPage";
import { ExitPasswordProvider } from "./components/ExitPasswordContext";
import { GestureControls } from "./components/GestureControls";

export function App() {
  const currentPage = useCurrentPage();
  const pageMap = {
    overview: <OverviewPage />,
    location: <LocationPage />,
    amenities: <AmenitiesPage />,
    plans: <PlansPage />,
    brochure: <BrochurePage />,
    contact: <ContactPage />,
    gallery: <GalleryPage />,
    specs: <SpecificationsPage />,
  };

  const renderContent = () => {
    if (pageMap[currentPage]) {
      return pageMap[currentPage];
    }
    if (pageTitles[currentPage]) {
      return <SimplePage title={pageTitles[currentPage]} page={currentPage} />;
    }
    return <HomePage />;
  };

  return (
    <ExitPasswordProvider>
      <GestureControls>{renderContent()}</GestureControls>
    </ExitPasswordProvider>
  );
}
