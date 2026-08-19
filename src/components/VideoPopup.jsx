import React from "react";

export function VideoPopup({ src, onClose }) {
  const videoRef = React.useRef(null);
  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setIsMuted] = React.useState(false);

  function closePopup() {
    onClose();
    window.location.hash = "home";
  }

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closePopup();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted || volume === 0;
    }
  }, [volume, isMuted]);

  function handleVolumeChange(event) {
    const val = parseFloat(event.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  }

  function toggleMute() {
    if (isMuted || volume === 0) {
      const newVol = 0.8;
      setVolume(newVol);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  }

  return (
    <div className="location-popup" role="dialog" aria-modal="true">
      <button className="popup-close popup-close-neumorphism" type="button" onClick={closePopup} aria-label="Close and return homepage">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="popup-content">
        <div className="popup-video-wrapper">
          <video
            ref={videoRef}
            className="popup-video"
            src={src}
            autoPlay
            loop
            playsInline
            preload="metadata"
          />

          <div className="location-volume-bar popup-volume-bar">
            <button
              className="location-volume-btn"
              type="button"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
            <input
              className="location-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
