import React from "react";

export function useCurrentPage() {
  const [currentPage, setCurrentPage] = React.useState(readPageFromUrl);

  React.useEffect(() => {
    function updatePage() {
      setCurrentPage(readPageFromUrl());
    }

    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  return currentPage;
}

function readPageFromUrl() {
  return window.location.hash.replace("#", "") || "home";
}
