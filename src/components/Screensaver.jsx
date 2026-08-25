import React from "react";
import "./screensaver.css";

const IDLE_TIMEOUT_MS = 30000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "touchstart", "keydown", "wheel"];

export function ScreensaverProvider({ children }) {
  const [isIdle, setIsIdle] = React.useState(false);
  const timerRef = React.useRef(null);
  const isIdleRef = React.useRef(false);

  React.useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  React.useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
    }

    function handleActivity() {
      if (isIdleRef.current) setIsIdle(false);
      resetTimer();
    }

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, handleActivity));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {isIdle && <ScreensaverOverlay onDismiss={() => setIsIdle(false)} />}
    </>
  );
}

function ScreensaverOverlay({ onDismiss }) {
  const videoRef = React.useRef(null);

  function restartPlayback() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  return (
    <div className="screensaver-overlay" role="button" aria-label="Tap to return" onClick={onDismiss}>
      <video
        ref={videoRef}
        className="screensaver-video"
        src="/assets/walkthrough-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        onEnded={restartPlayback}
        onStalled={restartPlayback}
        onPause={(e) => {
          if (!e.target.ended) e.target.play().catch(() => {});
        }}
      />
      <span className="screensaver-hint">Tap anywhere to continue</span>
    </div>
  );
}
