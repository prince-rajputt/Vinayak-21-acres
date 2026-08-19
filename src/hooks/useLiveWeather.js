import React from "react";

export function useLiveWeather() {
  const [weather] = React.useState({
    temperature: null,
    code: 3,
    status: "Kolkata",
  });

  return weather;
}
