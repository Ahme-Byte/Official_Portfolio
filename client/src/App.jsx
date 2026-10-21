import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import SmoothScroll from "./components/SmoothScroll";
import Footer from "./components/Footer";
import { theme, fonts, ease } from "./theme";
import { navLinks, profile } from "./config/data";
import { getThemeMode, setThemeMode } from "./hooks/useThemeMode";

const Arsenal = lazy(() => import("./components/Arsenal"));
const Hero = lazy(() => import("./components/Hero"));
const About = lazy(() => import("./components/About"));
const ClassifiedProjects = lazy(
  () => import("./components/ClassifiedProjects"),
);
const Experience = lazy(() => import("./components/Experience"));
const Education = lazy(() => import("./components/Education"));
const TerminalContact = lazy(() => import("./components/TerminalContact"));

function SectionFallback() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.textDim,
        fontFamily: fonts.mono,
        fontSize: "0.75rem",
      }}
    >
      Loading section…
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <div
      className="ambient-backdrop"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(56,189,248,0.09), transparent 50%),
          radial-gradient(ellipse 60% 40% at 90% 10%, rgba(99,102,241,0.08), transparent 45%),
          radial-gradient(ellipse 50% 50% at 50% 100%, rgba(52,211,153,0.05), transparent 50%),
          ${theme.bg}
        `,
      }}
    />
  );
}

function ThemeToggle() {
  const [mode, setMode] = useState(() => getThemeMode());
  const reducedMotion = useReducedMotion();
  const nextMode = mode === "dark" ? "light" : "dark";

  useEffect(() => {
    const handleTheme = (event) => setMode(event.detail);
    window.addEventListener("portfolio-theme-change", handleTheme);
    return () => window.removeEventListener("portfolio-theme-change", handleTheme);
  }, []);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextMode} theme`}
      aria-pressed={mode === "light"}
      onClick={() => setThemeMode(nextMode)}
    >
      <motion.span
        className="theme-toggle-pill"
        animate={{ x: mode === "dark" ? 0 : 29 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
        aria-hidden="true"
      />
      <span className={`theme-toggle-icon${mode === "dark" ? " is-active" : ""}`} aria-hidden="true">
        <Moon size={15} />
      </span>
      <span className={`theme-toggle-icon${mode === "light" ? " is-active" : ""}`} aria-hidden="true">
        <Sun size={15} />
      </span>
    </button>
  );
}

function Nav() {
  const [active, setActive] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.3 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start?.();
    };
  }, [menuOpen]);

  const scrollTo = useCallback((id) => {
    setMenuOpen(false);
    // Defer scroll until menu close paint
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.15 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  const toggleMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((open) => !open);
  }, []);

  const mobileMenu =
    typeof document !== "undefined" &&
    createPortal(
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                top: 68,
                zIndex: 100000,
                border: "none",
                margin: 0,
                padding: 0,
                background: "rgba(5, 8, 14, 0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            />
            <motion.div
              key="mobile-nav-panel"
              className="mobile-nav-panel"
              id="mobile-nav-menu"
              role="navigation"
              aria-label="Mobile"
              data-lenis-prevent
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: 68,
                left: 0,
                right: 0,
                zIndex: 100001,
                padding: "1.1rem clamp(1.25rem, 4vw, 3rem) 1.4rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                maxWidth: "100vw",
                maxHeight: "calc(100dvh - 68px)",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                pointerEvents: "auto",
                background: "#121826",
                borderBottom: `1px solid ${theme.border}`,
                boxShadow: "0 28px 56px rgba(0,0,0,0.55)",
              }}
            >
              {navLinks.map(({ id, hash, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  style={{
                    background:
                      active === id ? theme.accentSoft : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: active === id ? theme.accent : theme.textMuted,
                    fontSize: "1rem",
                    fontFamily: fonts.sans,
                    fontWeight: 500,
                    padding: "0.85rem 0.9rem",
                    borderRadius: 10,
                    pointerEvents: "auto",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: "0.75rem", marginRight: 10 }}
                  >
                    {hash}
                  </span>
                  {label}
                </button>
              ))}
              <div className="mobile-theme-control">
                <span>Appearance</span>
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <header
        className="site-header"
        data-lenis-prevent
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100002,
          height: 68,
          pointerEvents: "auto",
          overflow: "visible",
        }}
      >
        <motion.nav
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease }}
          style={{
            height: "100%",
            padding: "0 clamp(1.25rem, 4vw, 3rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: scrolled || menuOpen ? "var(--header-solid)" : "var(--header-glass)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: `1px solid ${
              scrolled || menuOpen ? theme.border : "transparent"
            }`,
            pointerEvents: "auto",
            overflow: "visible",
            maxWidth: "100vw",
          }}
        >
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: fonts.sans,
              pointerEvents: "auto",
              touchAction: "manipulation",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: theme.text,
              }}
            >
              {profile.name}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "0.62rem",
                color: theme.textDim,
                letterSpacing: "0.04em",
                marginTop: 2,
              }}
            >
              {profile.location}
            </div>
          </button>

          <ul
            className="nav-desktop"
            role="list"
            style={{
              display: "flex",
              gap: "0.15rem",
              listStyle: "none",
              margin: 0,
              padding: 0,
              alignItems: "center",
            }}
          >
            {navLinks.map(({ id, hash, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    title={label}
                    className="font-mono"
                    style={{
                      background: isActive ? theme.accentSoft : "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: isActive ? theme.accent : theme.textMuted,
                      fontSize: "0.72rem",
                      fontWeight: isActive ? 600 : 450,
                      padding: "0.45rem 0.7rem",
                      borderRadius: 8,
                      transition: "color 0.2s, background 0.2s",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {hash}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="desktop-theme-control">
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="nav-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            onClick={toggleMenu}
            style={{
              background: theme.bgElevated,
              border: `1px solid ${theme.borderStrong}`,
              borderRadius: 8,
              color: theme.text,
              padding: "0.55rem 0.95rem",
              cursor: "pointer",
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              fontWeight: 600,
              pointerEvents: "auto",
              position: "relative",
              zIndex: 3,
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              minHeight: 40,
              minWidth: 72,
            }}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </motion.nav>
      </header>

      {mobileMenu}

      <style>{`
        .nav-hamburger {
          display: none;
          pointer-events: auto !important;
        }
        .nav-desktop {
          display: flex;
        }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            pointer-events: auto !important;
          }
        }
      `}</style>
    </>
  );
}

function Section({ id, children, minHeight = "100vh", style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 10,
        minHeight,
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        scrollMarginTop: id === "hero" ? 0 : 68,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function PageUtilities() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
        setShowBackToTop(window.scrollY > 600);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <div
        className="scroll-progress"
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress * 100)}
      >
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            className="back-to-top"
            aria-label="Back to top"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => {
              if (window.__lenis) window.__lenis.scrollTo(0, { duration: 0.8 });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function PageIntro() {
  const reducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const visible = !reducedMotion && !dismissed;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setTimeout(() => setDismissed(true), 520);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="page-intro"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.42, ease }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <p className="font-mono">ERROR 404 · ROUTE NOT FOUND</p>
      <h1>This page isn’t in my orbit.</h1>
      <p>The page may have moved, or the link may be out of date.</p>
      <a href="/">Return to portfolio</a>
    </main>
  );
}

export default function App() {
  const isHome = ["/", "/index.html"].includes(window.location.pathname);

  useEffect(() => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = `${window.location.origin}/`;
    const schema = document.querySelector("#person-schema");
    if (schema) {
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Muhammad Ahmad",
        jobTitle: "Full-Stack Developer",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lahore",
          addressCountry: "PK",
        },
        sameAs: [profile.linkedin, "https://github.com/Ahme-Byte"],
      });
    }
  }, []);

  if (!isHome) return <NotFound />;

  return (
    <>
      <PageIntro />
      <PageUtilities />
      <Nav />
      <SmoothScroll>
        <AmbientBackdrop />
        <main
          style={{
            position: "relative",
            zIndex: 10,
            isolation: "isolate",
            overflowX: "hidden",
            maxWidth: "100vw",
            paddingTop: 0,
          }}
        >
          <Section id="hero" style={{ minHeight: "100svh", paddingTop: 68 }}>
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  style={{
                    minHeight: "calc(100svh - 68px)",
                    background:
                      "radial-gradient(ellipse at 72% 45%, rgba(56,189,248,0.1), transparent 48%)",
                  }}
                />
              }
            >
              <Hero />
            </Suspense>
          </Section>
          <Section id="about-section">
            <Suspense fallback={<SectionFallback />}>
              <About />
            </Suspense>
          </Section>
          <span
            className="section-divider"
            role="separator"
            aria-hidden="true"
          />
          <Section id="skills">
            <Suspense fallback={<SectionFallback />}>
              <Arsenal />
            </Suspense>
          </Section>
          <span
            className="section-divider"
            role="separator"
            aria-hidden="true"
          />
          <Section id="projects">
            <Suspense fallback={<SectionFallback />}>
              <ClassifiedProjects />
            </Suspense>
          </Section>
          <span
            className="section-divider"
            role="separator"
            aria-hidden="true"
          />
          <Section id="experience">
            <Suspense fallback={<SectionFallback />}>
              <Experience />
            </Suspense>
          </Section>
          <span
            className="section-divider"
            role="separator"
            aria-hidden="true"
          />
          <Section id="education">
            <Suspense fallback={<SectionFallback />}>
              <Education />
            </Suspense>
          </Section>
          <span
            className="section-divider"
            role="separator"
            aria-hidden="true"
          />
          <Section id="contact" minHeight="80vh">
            <Suspense fallback={<SectionFallback />}>
              <TerminalContact />
            </Suspense>
          </Section>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
