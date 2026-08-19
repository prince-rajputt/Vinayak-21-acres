import React from "react";
import { Clock, MapPin } from "lucide-react";
import { useLiveClock } from "../hooks/useLiveClock";

export function FooterWidget() {
  const { timeText } = useLiveClock();

  return (
    <div className="footer-clock-widget" aria-label="Current time and location">
      <div className="widget-clock-group">
        <span className="widget-icon-circle">
          <Clock size={17} strokeWidth={2.2} />
        </span>
        <span className="widget-time">{timeText}</span>
      </div>

      <div className="widget-divider" />

      <div className="widget-location-group">
        <span className="widget-location-icon">
          <MapPin size={16} strokeWidth={2.2} />
        </span>
        <span className="widget-city">KOLKATA</span>
      </div>
    </div>
  );
}
