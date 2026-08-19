import React from "react";
import { Delete, Lock, X } from "lucide-react";
import "./exit-modal.css";

const ExitPasswordContext = React.createContext({
  isExitModalOpen: false,
  openExitModal: () => {},
  closeExitModal: () => {},
  handleLogoTap: () => {},
});

export function ExitPasswordProvider({ children }) {
  const [isExitModalOpen, setIsExitModalOpen] = React.useState(false);
  const tapCount = React.useRef(0);
  const lastTapTime = React.useRef(0);

  const handleLogoTap = React.useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 500) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setIsExitModalOpen(true);
    }
  }, []);

  const openExitModal = React.useCallback(() => setIsExitModalOpen(true), []);
  const closeExitModal = React.useCallback(() => setIsExitModalOpen(false), []);

  return (
    <ExitPasswordContext.Provider
      value={{
        isExitModalOpen,
        openExitModal,
        closeExitModal,
        handleLogoTap,
      }}
    >
      {children}
      {isExitModalOpen && <ExitPasswordModal onClose={closeExitModal} />}
    </ExitPasswordContext.Provider>
  );
}

export function useExitPassword() {
  return React.useContext(ExitPasswordContext);
}

function ExitPasswordModal({ onClose }) {
  const [pin, setPin] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isShaking, setIsShaking] = React.useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMsg("");

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg("");
  };

  const handleClear = () => {
    setPin("");
    setErrorMsg("");
  };

  const verifyPin = (inputPin) => {
    if (inputPin === "1234") {
      setErrorMsg("");
      // Perform Quit Action
      if (window.kishokSecurity?.quitApp) {
        window.kishokSecurity.quitApp();
      } else if (window.electronAPI?.quitApp) {
        window.electronAPI.quitApp();
      } else {
        window.close();
      }
    } else {
      setIsShaking(true);
      setErrorMsg("Incorrect Password! Try again.");
      window.setTimeout(() => {
        setIsShaking(false);
        setPin("");
      }, 600);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key >= "0" && e.key <= "9") handleKeyPress(e.key);
      if (e.key === "Backspace") handleBackspace();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, onClose]);

  return (
    <div className="exit-modal-overlay" role="dialog" aria-modal="true" aria-label="Exit Application">
      <div className={`exit-modal-card ${isShaking ? "is-shaking" : ""}`}>
        <button className="popup-close-neumorphism exit-close-btn" type="button" onClick={onClose} aria-label="Cancel">
          <X size={22} />
        </button>

        <div className="exit-modal-header">
          <span className="exit-modal-icon">
            <Lock size={26} strokeWidth={2} />
          </span>
          <h2>EXIT APPLICATION</h2>
          <p>Enter secret PIN to exit kiosk mode</p>
        </div>

        {/* 4-Digit PIN Indicator Dots */}
        <div className="exit-pin-display">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`exit-pin-dot ${index < pin.length ? "is-filled" : ""}`}
            />
          ))}
        </div>

        {errorMsg && <p className="exit-error-msg">{errorMsg}</p>}

        {/* Touchscreen Number Keypad Grid */}
        <div className="exit-keypad-grid">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              className="exit-keypad-btn"
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            className="exit-keypad-btn is-action"
            onClick={handleClear}
            title="Clear"
          >
            C
          </button>

          <button
            type="button"
            className="exit-keypad-btn"
            onClick={() => handleKeyPress("0")}
          >
            0
          </button>

          <button
            type="button"
            className="exit-keypad-btn is-action"
            onClick={handleBackspace}
            title="Backspace"
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
