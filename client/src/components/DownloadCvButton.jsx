import { useEffect, useRef, useState } from "react";
import { Check, Download, MousePointer2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";

export default function DownloadCvButton({ showHint = false }) {
  const reducedMotion = useReducedMotion();
  const [showHintNow, setShowHintNow] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [ripple, setRipple] = useState(0);
  const hintTimer = useRef(0);
  const dismissTimer = useRef(0);

  useEffect(() => {
    if (!showHint) return undefined;
    let seen = false;
    try {
      seen = window.localStorage.getItem("portfolio-cv-hint-seen") === "true";
    } catch (error) {
      console.warn("Unable to read the CV hint preference.", error);
    }
    if (seen) return undefined;
    if (reducedMotion) {
      const showStaticHint = window.setTimeout(() => {
        setShowHintNow(true);
        try {
          window.localStorage.setItem("portfolio-cv-hint-seen", "true");
        } catch (error) {
          console.warn("Unable to save the CV hint preference.", error);
        }
      }, 0);
      return () => window.clearTimeout(showStaticHint);
    }

    hintTimer.current = window.setTimeout(() => {
      setShowHintNow(true);
      try {
        window.localStorage.setItem("portfolio-cv-hint-seen", "true");
      } catch (error) {
        console.warn("Unable to save the CV hint preference.", error);
      }
    }, 2000);
    dismissTimer.current = window.setTimeout(() => setShowHintNow(false), 5100);
    return () => {
      window.clearTimeout(hintTimer.current);
      window.clearTimeout(dismissTimer.current);
    };
  }, [reducedMotion, showHint]);

  useEffect(() => {
    if (!downloaded) return undefined;
    const timer = window.setTimeout(() => setDownloaded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [downloaded]);

  const activate = () => {
    window.clearTimeout(hintTimer.current);
    window.clearTimeout(dismissTimer.current);
    setShowHintNow(false);
    try {
      window.localStorage.setItem("portfolio-cv-hint-seen", "true");
    } catch (error) {
      console.warn("Unable to save the CV hint preference.", error);
    }
    setRipple((current) => current + 1);
    setDownloaded(true);
  };

  return (
    <span className="cv-button-wrap">
      <a
        href="/Ahmad_CV_2026.pdf"
        download
        className={`hero-cv-link cv-attention${downloaded ? " is-downloaded" : ""}`}
        aria-label={downloaded ? "CV downloaded" : "Download Ahmad's CV"}
        onClick={activate}
      >
        <span className="cv-button-label">
          {downloaded ? "Downloaded!" : "Download CV"}
        </span>
        <span className="cv-download-icon" aria-hidden="true">
          {downloaded ? <Check size={16} /> : <Download size={16} className="cv-download-arrow" />}
        </span>
        <span key={ripple} className="cv-ripple" aria-hidden="true" />
      </a>
      {showHintNow && (
        <>
          <span className="cv-first-visit-badge" role="status">Download CV</span>
          <MousePointer2 className="cv-hint-cursor" aria-hidden="true" size={25} />
        </>
      )}
    </span>
  );
}
