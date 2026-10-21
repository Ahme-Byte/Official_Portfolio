import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Global smooth scroll — soft inertia on all viewports.
 * Touch: lower multiplier so native feel stays snappy without lag.
 */
export default function SmoothScroll({ children }) {
  const rafRef = useRef(null);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 0.95 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: isTouch ? 1.15 : 1.6,
      infinite: false,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.45,
      autoResize: true,
    });

    function raf(time) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div
      style={{
        overflowX: "hidden",
        maxWidth: "100vw",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
