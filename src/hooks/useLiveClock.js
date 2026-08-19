import React from "react";
import { cityWeather } from "../data/site";

export function useLiveClock() {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const dateText = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: cityWeather.timezone,
  })
    .format(now)
    .replace(",", "");

  const dateCompact = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: cityWeather.timezone,
  }).format(now);

  const timeText = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: cityWeather.timezone,
  }).format(now);

  return { dateText, dateCompact, timeText };
}
