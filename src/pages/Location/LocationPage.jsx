import React from "react";
import { InteriorLayout } from "../../components/InteriorLayout";
import "./location.css";

const GOOGLE_MAP_PROXY_URL = "/google-map-proxy/index.html";

export function LocationPage() {
  const [openPopup, setOpenPopup] = React.useState(null);
  const videoRef = React.useRef(null);
  const [volume, setVolume] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(true);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
      setIsMuted(volume === 0);
    }
  }, [volume]);

  function handleVolumeChange(event) {
    setVolume(parseFloat(event.target.value));
  }

  function toggleMute() {
    if (isMuted) {
      const newVol = 0.5;
      setVolume(newVol);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  }

  function openPopupHandler(type) {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setOpenPopup(type);
  }

  function closePopupHandler() {
    setOpenPopup(null);
    if (videoRef.current) {
      videoRef.current.muted = true;
      setVolume(0);
      setIsMuted(true);
      videoRef.current.play().catch(() => {});
    }
  }

  return (
    <InteriorLayout activePage="location">
      <section className="location-page">
        <section className="location-content" aria-label="Location map and video">
          <button className="location-map-card" type="button" onClick={() => openPopupHandler("map-image")}>
            <span className="location-map-frame">
              <img src="/assets/location-map-display.jpg" alt="Vinayak location map" loading="lazy" decoding="async" />
            </span>
          </button>

          <div className="location-video-card">
            <video
              ref={videoRef}
              className="location-video-inline"
              src="/assets/location-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onClick={() => openPopupHandler("video")}
            />
            <div className="location-volume-bar">
              <button
                className="location-volume-btn"
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
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
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>
          </div>

          <button className="google-map-link" type="button" onClick={() => openPopupHandler("map")}>
            <img
              className="google-map-logo"
              src="/assets/google-maps-logo-transparent.png"
              alt="Google Maps"
              loading="lazy"
              decoding="async"
            />
            <span className="google-title">Google Maps</span>
            <span className="google-note">(Tap to see in Google Maps)</span>
          </button>
        </section>

        {openPopup && <LocationPopup type={openPopup} onClose={closePopupHandler} />}
      </section>
    </InteriorLayout>
  );
}

function LocationPopup({ type, onClose }) {
  const isVideo = type === "video";
  const isMapImage = type === "map-image";
  const isGoogleMap = type === "map";
  const popupVideoRef = React.useRef(null);
  const [popupVolume, setPopupVolume] = React.useState(0.8);
  const [popupMuted, setPopupMuted] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    if (popupVideoRef.current && isVideo) {
      popupVideoRef.current.volume = popupVolume;
      popupVideoRef.current.muted = popupMuted;
    }
  }, [popupVolume, popupMuted, isVideo]);

  React.useEffect(() => {
    const video = popupVideoRef.current;
    if (!video || !isVideo) return;

    function onLoadedMetadata() {
      setDuration(video.duration || 0);
    }
    function onTimeUpdate() {
      setCurrentTime(video.currentTime);
    }
    function onPlay() {
      setIsPlaying(true);
    }
    function onPause() {
      setIsPlaying(false);
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [isVideo]);

  function handlePopupVolumeChange(event) {
    const val = parseFloat(event.target.value);
    setPopupVolume(val);
    setPopupMuted(val === 0);
  }

  function togglePopupMute() {
    if (popupMuted || popupVolume === 0) {
      const newVol = 0.8;
      setPopupVolume(newVol);
      setPopupMuted(false);
    } else {
      setPopupMuted(true);
    }
  }

  function togglePlayPause() {
    const video = popupVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function handleSeek(event) {
    const video = popupVideoRef.current;
    if (!video) return;
    const val = parseFloat(event.target.value);
    video.currentTime = val;
    setCurrentTime(val);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }

  return (
    <div className="location-popup" role="dialog" aria-modal="true">
      <button className="popup-close" type="button" onClick={onClose} aria-label="Close fullscreen view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="popup-content">
        {isVideo ? (
          <div className="popup-video-wrapper">
            <video
              ref={popupVideoRef}
              className="popup-video"
              src="/assets/location-video.mp4"
              autoPlay
              loop
              playsInline
              preload="metadata"
            />
            <div className="popup-video-controls">
              <input
                className="popup-seek-slider"
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek"
                style={{ "--seek-progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />

              <div className="popup-controls-row">
                <button
                  className="location-volume-btn"
                  type="button"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  )}
                </button>

                <span className="popup-time-label">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <span className="popup-controls-spacer" />

                <button
                  className="location-volume-btn"
                  type="button"
                  onClick={togglePopupMute}
                  aria-label={popupMuted || popupVolume === 0 ? "Unmute" : "Mute"}
                >
                  {popupMuted || popupVolume === 0 ? (
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
                  value={popupMuted ? 0 : popupVolume}
                  onChange={handlePopupVolumeChange}
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        ) : isMapImage ? (
          <img className="popup-image" src="/assets/location-map.jpg" alt="Vinayak location map" decoding="async" />
        ) : isGoogleMap ? (
          <iframe
            className="popup-google-map"
            src={GOOGLE_MAP_PROXY_URL}
            title="Interactive Google map"
            loading="eager"
            allow="fullscreen; geolocation"
          />
        ) : (
          <img className="popup-image" src="/assets/location-map.jpg" alt="Vinayak location map" decoding="async" />
        )}
      </div>
    </div>
  );
}
