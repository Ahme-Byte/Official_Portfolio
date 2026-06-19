import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import SmoothScroll from "./components/SmoothScroll";

// ─── Section placeholders ─────────────────────────────────────
// Replace each with the real component once built.
import Hero from "./components/Hero";
import Arsenal from "./components/Arsenal";
import ClassifiedProjects from "./components/ClassifiedProjects";
import TerminalContact from "./components/TerminalContact";

// ─────────────────────────────────────────────────────────────
// 1.  MATRIX RAIN  — offscreen canvas, composited via CSS
//     Runs in its own isolated RAF so Lenis never fights it.
// ─────────────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const FONT_SIZE = 14;
    const CHARS =
      "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ" +
      "0123456789ABCDEF<>{}[]|/\\\\";

    let width, height, columns, drops;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / FONT_SIZE);
      drops = Array.from({ length: columns }, () =>
        Math.floor((Math.random() * -height) / FONT_SIZE),
      );
    }

    resize();

    let raf;
    let frame = 0;

    function draw() {
      frame++;
      // Only redraw every 3 frames → ~20 fps for the rain (huge perf win)
      if (frame % 3 !== 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // Fade trail
      ctx.fillStyle = "rgba(5, 5, 5, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y < 0) {
          drops[i]++;
          continue;
        }

        // Bright head glyph
        ctx.fillStyle = "#00ff66";
        ctx.globalAlpha = 0.9;
        ctx.fillText(
          CHARS[Math.floor(Math.random() * CHARS.length)],
          i * FONT_SIZE,
          y,
        );

        // Dimmer mid-trail
        ctx.fillStyle = "#00cc55";
        ctx.globalAlpha = 0.25;
        ctx.fillText(
          CHARS[Math.floor(Math.random() * CHARS.length)],
          i * FONT_SIZE,
          y - FONT_SIZE,
        );

        // Reset column
        if (y > height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
        drops[i]++;
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.07, // ultra-subtle ambient; foreground content pops
        mixBlendMode: "screen",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 2.  GLITCH OVERLAY  — CSS scanlines + chromatic aberration
//     Pure CSS, zero JS cost.
// ─────────────────────────────────────────────────────────────
function GlitchOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,102,0.015) 2px, rgba(0,255,102,0.015) 4px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.85) 100%)",
        }}
      />

      {/* Chromatic aberration pulse — keyframe injected inline */}
      <style>{`
        @keyframes chromatic-pulse {
          0%, 94%, 100% { opacity: 0; }
          95%            { opacity: 1; transform: translateX(-2px); }
          96%            { opacity: 0.6; transform: translateX(2px); }
          97%            { opacity: 0; }
        }
        @keyframes scanbar {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes glitch-h {
          0%, 90%, 100%  { clip-path: inset(0 0 100% 0); opacity: 0; }
          91%            { clip-path: inset(30% 0 50% 0); opacity: 0.4; transform: translateX(4px); }
          92%            { clip-path: inset(70% 0 10% 0); opacity: 0.2; transform: translateX(-3px); }
          93%            { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
        @keyframes cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes neon-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55%                           { opacity: 0.4; }
        }
        @keyframes float-up {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        :root {
          --void:      #050505;
          --neon:      #00ff66;
          --neon-dim:  #00cc55;
          --cyber:     #9d00ff;
          --cyber-dim: #6600bb;
          --ghost:     #0d0d0d;
          --wire:      #1a1a1a;
          --text-dim:  #3a3a3a;
          --text-mid:  #555;
          color-scheme: dark;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: auto; } /* Lenis handles this */
        body {
          background-color: var(--void);
          color: var(--neon);
          font-family: 'Courier New', 'Lucida Console', monospace;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        ::selection { background: var(--cyber); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--void); }
        ::-webkit-scrollbar-thumb { background: var(--neon-dim); border-radius: 2px; }

        /* Neon text glow utility */
        .neon-text { text-shadow: 0 0 8px var(--neon), 0 0 20px var(--neon), 0 0 40px var(--neon-dim); }
        .cyber-text { text-shadow: 0 0 8px var(--cyber), 0 0 20px var(--cyber); }
        .neon-border { box-shadow: 0 0 0 1px var(--neon), 0 0 12px rgba(0,255,102,0.15), inset 0 0 12px rgba(0,255,102,0.04); }
        .cyber-border { box-shadow: 0 0 0 1px var(--cyber), 0 0 12px rgba(157,0,255,0.2), inset 0 0 12px rgba(157,0,255,0.04); }

        /* Section separator line */
        .section-divider {
          display: block;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--neon-dim), var(--cyber-dim), transparent);
          opacity: 0.3;
        }

        /* Terminal cursor */
        .term-cursor::after {
          content: '█';
          animation: cursor-blink 1s step-end infinite;
          color: var(--neon);
        }
      `}</style>

      {/* Rare horizontal glitch bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: `linear-gradient(transparent 30%, rgba(0,255,102,0.06) 50%, transparent 70%)`,
          animation: "chromatic-pulse 8s infinite",
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3.  CURSOR GLOW  — neon orb that follows the mouse
// ─────────────────────────────────────────────────────────────
function CursorGlow() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        width: 320,
        height: 320,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(0,255,102,0.06) 0%, rgba(157,0,255,0.04) 40%, transparent 70%)",
        zIndex: 1,
        pointerEvents: "none",
        mixBlendMode: "screen",
        filter: "blur(2px)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 4.  NAV  — sticky terminal-style navigation bar
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { id: "hero", label: "./home", key: "F1" },
  { id: "arsenal", label: "./skills", key: "F2" },
  { id: "projects", label: "./projects", key: "F3" },
  { id: "contact", label: "./contact", key: "F4" },
];

function Nav() {
  const [active, setActive] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for nav background
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Intersection observer to highlight active section
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) =>
      document.getElementById(id),
    ).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -80, duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 clamp(1rem, 4vw, 3rem)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,255,102,0.12)"
          : "1px solid transparent",
        transition:
          "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      {/* Logo / handle */}
      <motion.button
        onClick={() => scrollTo("hero")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.1,
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            color: "#3a3a3a",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          root@portfolio:~#
        </span>
        <span
          className="neon-text"
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--neon)",
          }}
        >
          FULL_STACK.exe
        </span>
      </motion.button>

      {/* Desktop links */}
      <ul
        role="list"
        style={{
          display: "flex",
          gap: "2rem",
          listStyle: "none",
          alignItems: "center",
        }}
        className="nav-desktop"
      >
        {NAV_LINKS.map(({ id, label, key }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <motion.button
                onClick={() => scrollTo(id)}
                whileHover={{ y: -2 }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  color: isActive ? "var(--neon)" : "var(--text-mid)",
                  transition: "color 0.25s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: isActive ? "var(--cyber)" : "#2a2a2a",
                    letterSpacing: "0.1em",
                    transition: "color 0.25s ease",
                  }}
                >
                  [{key}]
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: "0.06em",
                    textShadow: isActive
                      ? "0 0 8px var(--neon), 0 0 16px var(--neon-dim)"
                      : "none",
                    transition: "text-shadow 0.25s ease",
                  }}
                >
                  {label}
                </span>
                {/* Active underline */}
                <motion.span
                  animate={{
                    scaleX: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "block",
                    height: 1,
                    width: "100%",
                    background: "var(--neon)",
                    boxShadow: "0 0 6px var(--neon)",
                    transformOrigin: "left",
                  }}
                />
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.65rem",
          color: "var(--text-dim)",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
        className="nav-status"
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--neon)",
            boxShadow: "0 0 6px var(--neon)",
            animation: "neon-flicker 4s infinite",
          }}
        />
        ONLINE · ENCRYPTED
      </div>

      {/* Mobile hamburger (hidden on desktop via CSS below) */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
        className="nav-hamburger"
        style={{
          display: "none",
          background: "none",
          border: "1px solid rgba(0,255,102,0.25)",
          borderRadius: 4,
          color: "var(--neon)",
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        }}
      >
        {menuOpen ? "[ CLOSE ]" : "[ MENU ]"}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              right: 0,
              background: "rgba(5,5,5,0.97)",
              borderBottom: "1px solid rgba(0,255,102,0.2)",
              padding: "1.5rem clamp(1rem, 4vw, 3rem)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              backdropFilter: "blur(16px)",
            }}
          >
            {NAV_LINKS.map(({ id, label, key }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: active === id ? "var(--neon)" : "#555",
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  fontFamily: "inherit",
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--cyber)", fontSize: "0.7rem" }}>
                  [{key}]
                </span>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive style block */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop  { display: none !important; }
          .nav-status   { display: none !important; }
          .nav-hamburger{ display: block !important; }
        }
      `}</style>
    </motion.nav>
  );
}

// ─────────────────────────────────────────────────────────────
// 5.  SECTION WRAPPER  — consistent section sizing + id anchor
//     Each section fills at least 100vh and carries the correct
//     id so the nav intersection observer can track it.
// ─────────────────────────────────────────────────────────────
function Section({ id, children, minHeight = "100vh", style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 10,
        minHeight,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 6.  FOOTER  — minimal terminal footer
// ─────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(0,255,102,0.08)",
        padding: "2rem clamp(1rem, 4vw, 3rem)",
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.65rem",
        color: "var(--text-dim)",
        letterSpacing: "0.1em",
        background: "rgba(5,5,5,0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span>© {year} · FULL_STACK.exe · ALL RIGHTS RESERVED</span>
      <span style={{ color: "var(--text-mid)" }}>
        BUILT WITH: <span style={{ color: "var(--neon)" }}>REACT 19</span> ·{" "}
        <span style={{ color: "var(--cyber)" }}>TAILWIND V4</span> ·{" "}
        <span style={{ color: "var(--neon)" }}>FRAMER MOTION</span>
      </span>
      <span style={{ color: "var(--text-mid)" }}>
        STATUS:{" "}
        <span className="neon-text" style={{ color: "var(--neon)" }}>
          ● SYSTEMS OPERATIONAL
        </span>
      </span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// 7.  APP ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SmoothScroll>
      {/* ── Ambient / decorative layers (pointer-events: none) ── */}
      <MatrixRain />
      <GlitchOverlay />
      <CursorGlow />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          isolation: "isolate", // new stacking context keeps layers clean
        }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <Section id="hero">
          <Hero />
        </Section>

        <span className="section-divider" role="separator" aria-hidden="true" />

        {/* ── Arsenal ──────────────────────────────────────── */}
        <Section id="arsenal">
          <Arsenal />
        </Section>

        <span className="section-divider" role="separator" aria-hidden="true" />

        {/* ── Classified Projects ───────────────────────────── */}
        <Section id="projects">
          <ClassifiedProjects />
        </Section>

        <span className="section-divider" role="separator" aria-hidden="true" />

        {/* ── Terminal Contact ──────────────────────────────── */}
        <Section id="contact" minHeight="80vh">
          <TerminalContact />
        </Section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Footer />
    </SmoothScroll>
  );
}
