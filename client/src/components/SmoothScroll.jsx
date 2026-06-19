import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // ── Instantiate Lenis ──────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.25, // scroll animation duration (seconds)
      easing: (
        t, // custom cubic ease-out curve
      ) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9, // dial down wheel sensitivity slightly
      touchMultiplier: 1.8, // snappier on mobile/trackpad
      infinite: false,
    });

    lenisRef.current = lenis;

    // ── RAF loop ───────────────────────────────────────────────
    function raf(time) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // ── Expose lenis instance globally (optional DX helper) ────
    // Allows any child component to call window.__lenis.scrollTo(...)
    window.__lenis = lenis;

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return <>{children}</>;
}
