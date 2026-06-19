import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Environment,
  MeshDistortMaterial,
  Sparkles,
  Grid,
  Float,
  Text3D,
  Center,
} from "@react-three/drei";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & THEME
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  NEON: 0x00ff66,
  NEON_CSS: "#00ff66",
  CYBER: 0x9d00ff,
  CYBER_CSS: "#9d00ff",
  VOID: "#050505",
  WHITE: 0xffffff,
  NEON_DIM: 0x00cc55,
  CYBER_DIM: 0x6600bb,
  WARN: 0xff3366,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCOPED KEYFRAMES & HERO STYLES
// ─────────────────────────────────────────────────────────────────────────────
function HeroStyles() {
  return (
    <style>{`
      /* ── Glitch text core ────────────────────────────────── */
      @keyframes glitch-main {
        0%,  84%              { clip-path: inset(0 0 100% 0); transform: none; opacity: 1; }
        85%                   { clip-path: inset(20% 0 40% 0); transform: translateX(-6px) skewX(-1deg); opacity: 0.95; }
        86%                   { clip-path: inset(60% 0 5%  0); transform: translateX( 6px) skewX( 1deg); opacity: 0.9; }
        87%                   { clip-path: inset(40% 0 30% 0); transform: translateX(-3px); opacity: 0.85; }
        88%, 100%             { clip-path: inset(0 0 100% 0); transform: none; opacity: 1; }
      }
      @keyframes glitch-red {
        0%,  84%              { clip-path: inset(0 0 100% 0); transform: none; opacity: 0; }
        85%                   { clip-path: inset(20% 0 40% 0); transform: translateX(8px);  opacity: 0.6; }
        86%                   { clip-path: inset(60% 0 5%  0); transform: translateX(-8px); opacity: 0.4; }
        87%                   { clip-path: inset(40% 0 30% 0); transform: translateX(4px);  opacity: 0.3; }
        88%, 100%             { clip-path: inset(0 0 100% 0); transform: none; opacity: 0; }
      }
      @keyframes glitch-blue {
        0%,  84%              { clip-path: inset(0 0 100% 0); transform: none; opacity: 0; }
        85%                   { clip-path: inset(20% 0 40% 0); transform: translateX(-8px); opacity: 0.5; }
        86%                   { clip-path: inset(60% 0 5%  0); transform: translateX( 8px); opacity: 0.3; }
        87%                   { clip-path: inset(40% 0 30% 0); transform: translateX(-4px); opacity: 0.25; }
        88%, 100%             { clip-path: inset(0 0 100% 0); transform: none; opacity: 0; }
      }

      /* ── Role switcher ───────────────────────────────────── */
      @keyframes role-in {
        from { opacity: 0; transform: translateY(12px) skewX(-2deg); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0)    skewX(0deg);  filter: blur(0); }
      }
      @keyframes role-out {
        from { opacity: 1; transform: translateY(0)    skewX(0deg);  filter: blur(0); }
        to   { opacity: 0; transform: translateY(-12px) skewX(2deg); filter: blur(4px); }
      }

      /* ── Scanbar on role text ────────────────────────────── */
      @keyframes scanbar-role {
        0%   { top: 0%; }
        100% { top: 110%; }
      }

      /* ── Neon pulse for accent elements ─────────────────── */
      @keyframes neon-pulse {
        0%,100% { opacity: 1;   text-shadow: 0 0 8px  #00ff66, 0 0 20px #00ff66, 0 0 40px #00cc55; }
        50%     { opacity: 0.85; text-shadow: 0 0 4px  #00ff66, 0 0 10px #00ff66; }
      }
      @keyframes cyber-pulse {
        0%,100% { opacity: 1;   text-shadow: 0 0 8px  #9d00ff, 0 0 20px #9d00ff, 0 0 40px #6600bb; }
        50%     { opacity: 0.85; text-shadow: 0 0 4px  #9d00ff, 0 0 10px #9d00ff; }
      }

      /* ── Grid line drift ─────────────────────────────────── */
      @keyframes grid-drift {
        from { background-position: 0 0; }
        to   { background-position: 60px 60px; }
      }

      /* ── Scroll cue ─────────────────────────────────────── */
      @keyframes scroll-drop {
        0%   { transform: translateY(0);   opacity: 1; }
        60%  { transform: translateY(12px); opacity: 0.3; }
        100% { transform: translateY(0);   opacity: 1; }
      }

      /* ── Typewriter cursor ───────────────────────────────── */
      @keyframes blink {
        0%,49% { opacity: 1; }
        50%,100%{ opacity: 0; }
      }

      /* ── Stat bar fill ───────────────────────────────────── */
      @keyframes fill-bar {
        from { width: 0%; }
        to   { width: var(--target-width); }
      }

      /* ── Float idle ──────────────────────────────────────── */
      @keyframes idle-float {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-10px); }
      }

      /* ── Corner brackets ─────────────────────────────────── */
      @keyframes bracket-in {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }

      .hero-glitch-main  { animation: glitch-main 7s infinite; }
      .hero-glitch-red   { animation: glitch-red  7s infinite; position: absolute; inset: 0; color: #ff3366; }
      .hero-glitch-blue  { animation: glitch-blue 7s infinite; position: absolute; inset: 0; color: #00ccff; }

      .hero-role-in  { animation: role-in  0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      .hero-role-out { animation: role-out 0.4s cubic-bezier(0.7,0,0.84,0) forwards; }

      .hero-neon-text  { animation: neon-pulse  2.8s ease-in-out infinite; }
      .hero-cyber-text { animation: cyber-pulse 3.2s ease-in-out infinite; }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. KINETIC BACKGROUND — CSS only, zero JS
// ─────────────────────────────────────────────────────────────────────────────
function KineticBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Drifting grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(0,255,102,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,102,0.04) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
          animation: "grid-drift 6s linear infinite",
        }}
      />

      {/* Radial neon aura centred on canvas right side */}
      <div
        style={{
          position: "absolute",
          right: "-10%",
          top: "10%",
          width: "70vw",
          height: "80vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0,255,102,0.06) 0%, rgba(157,0,255,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Purple depth corner */}
      <div
        style={{
          position: "absolute",
          left: "-5%",
          bottom: "-5%",
          width: "40vw",
          height: "40vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(157,0,255,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Horizontal thin accent lines */}
      {[15, 45, 72].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${top}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(0,255,102,0.12) 30%, rgba(157,0,255,0.1) 70%, transparent)`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GLITCH TYPOGRAPHY — HTML layer over the canvas
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = [
  "FULL-STACK DEVELOPER",
  "CYBERSECURITY OPERATIVE",
  "OWASP SPECIALIST",
  "EXPLOIT ARCHITECT",
];

function useRoleCycle(intervalMs = 3200) {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setExiting(false);
      }, 420);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { role: ROLES[index], exiting };
}

function Typewriter({ text, speed = 45 }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const id = setInterval(() => {
      if (idx.current >= text.length) {
        clearInterval(id);
        return;
      }
      setDisplayed(text.slice(0, idx.current + 1));
      idx.current++;
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <span
        style={{
          animation: "blink 1s step-end infinite",
          color: "var(--neon, #00ff66)",
        }}
      >
        █
      </span>
    </span>
  );
}

function StatBar({ label, value, color = C.NEON_CSS, delay = 0 }) {
  const barRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay + 800);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          color: "#555",
          marginBottom: "4px",
          fontFamily: '"Courier New", monospace',
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div
        style={{
          height: 2,
          background: "#111",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          ref={barRef}
          style={{
            height: "100%",
            width: visible ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 6px ${color}`,
            transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

function GlitchTypography({ mouseX, mouseY }) {
  const { role, exiting } = useRoleCycle(3200);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  // Parallax on the left panel
  const px = useTransform(mouseX, [0, 1], [-6, 6]);
  const py = useTransform(mouseY, [0, 1], [-4, 4]);
  const spx = useSpring(px, { stiffness: 60, damping: 18 });
  const spy = useSpring(py, { stiffness: 60, damping: 18 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
        padding: "0 clamp(1.5rem, 5vw, 5rem)",
      }}
    >
      {/* ── Left content panel ─────────────────────────────── */}
      <motion.div style={{ x: spx, y: spy, maxWidth: 580, flex: "0 0 auto" }}>
        {/* Boot sequence label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.5rem",
            fontFamily: '"Courier New", monospace',
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.NEON_CSS,
              boxShadow: `0 0 8px ${C.NEON_CSS}`,
              animation: "neon-pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.62rem",
              color: "#444",
              letterSpacing: "0.15em",
            }}
          >
            SYSTEM BOOT :: PORTFOLIO_v3.0.exe
          </span>
        </motion.div>

        {/* Main glitch headline */}
        <div
          style={{
            position: "relative",
            marginBottom: "1rem",
            pointerEvents: "none",
          }}
        >
          {/* Ghost layer — always visible base */}
          <h1
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: C.NEON_CSS,
              fontFamily: '"Courier New", "Lucida Console", monospace',
              textShadow: `0 0 30px ${C.NEON_CSS}40, 0 0 60px ${C.NEON_CSS}20`,
              userSelect: "none",
              margin: 0,
            }}
          >
            SECURE_
            <br />
            <span
              style={{
                color: C.CYBER_CSS,
                textShadow: `0 0 30px ${C.CYBER_CSS}60`,
              }}
            >
              THE_
            </span>
            <span style={{ color: C.NEON_CSS }}>STACK</span>
          </h1>

          {/* Glitch red ghost */}
          <h1
            aria-hidden
            className="hero-glitch-red"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              fontFamily: '"Courier New", monospace',
              userSelect: "none",
              margin: 0,
              pointerEvents: "none",
            }}
          >
            SECURE_
            <br />
            THE_STACK
          </h1>

          {/* Glitch blue ghost */}
          <h1
            aria-hidden
            className="hero-glitch-blue"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              fontFamily: '"Courier New", monospace',
              userSelect: "none",
              margin: 0,
              pointerEvents: "none",
            }}
          >
            SECURE_
            <br />
            THE_STACK
          </h1>
        </div>

        {/* Animated role switcher */}
        <div
          style={{
            position: "relative",
            height: "2rem",
            marginBottom: "1.8rem",
            overflow: "hidden",
          }}
        >
          {/* Scanbar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${C.NEON_CSS}, transparent)`,
              opacity: 0.4,
              animation: "scanbar-role 2s linear infinite",
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{
                opacity: 0,
                y: 12,
                filter: "blur(4px)",
                skewX: "-2deg",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)", skewX: "0deg" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)", skewX: "2deg" }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                fontFamily: '"Courier New", monospace',
                fontSize: "clamp(0.7rem, 1.8vw, 1rem)",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: C.NEON_CSS,
                textShadow: `0 0 10px ${C.NEON_CSS}`,
              }}
            >
              <span style={{ color: C.CYBER_CSS, marginRight: "0.4rem" }}>
                &gt;&gt;
              </span>
              {role}
              <span style={{ marginLeft: "0.4rem", color: "#333" }}>_</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Typewriter bio */}
        {bootDone && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: "clamp(0.62rem, 1.2vw, 0.78rem)",
              color: "#555",
              fontFamily: '"Courier New", monospace',
              lineHeight: 1.8,
              letterSpacing: "0.04em",
              marginBottom: "2rem",
              maxWidth: 360,
            }}
          >
            <Typewriter
              text="// Engineering full-stack web applications with defensive DNA. I analyze attack surfaces to build uncompromisables web systems. From database to DOM, protection is compiled-in, not patched-on."
              speed={28}
            />
          </motion.p>
        )}

        {/* Skill bars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          style={{ maxWidth: 320, marginBottom: "2rem" }}
        >
          <div
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: "#333",
              marginBottom: "0.75rem",
              fontFamily: '"Courier New", monospace',
            }}
          >
            ── HARDENED_CAPABILITY_MATRIX ──
          </div>
          <StatBar
            label="FULL-STACK ARCHITECTURE"
            value={96}
            color={C.NEON_CSS}
            delay={0}
          />
          <StatBar
            label="SECURE DEVELOPMENT (OWASP Top 10)"
            value={94}
            color={C.CYBER_CSS}
            delay={150}
          />
          <StatBar
            label="PENETRATION TESTING & VULN ANALYSIS"
            value={89}
            color={C.NEON_CSS}
            delay={300}
          />
          <StatBar
            label="AUTHENTICATION & ACCESS CONTROL (OAuth/JWT)"
            value={92}
            color={C.CYBER_CSS}
            delay={450}
          />
          <StatBar
            label="DATA ENCRYPTION & REST API SECURITY"
            value={87}
            color="#ff3366"
            delay={600}
          />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="btn-wrapper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            pointerEvents: "all",
            marginBottom: "3rem",
          }}
        >
          <style>
            {`
          @media (max-width:640px){
            .btn-wrapper{
             flex-direction:column; 
             margin-bottom:0rem;
            
            }
             .btn-wrapper button{
             width:90%;
             }
        }
           `}
          </style>
          <button
            onClick={() =>
              window.__lenis?.scrollTo("#projects", { offset: -80 })
            }
            style={{
              background: "transparent",
              border: `1px solid ${C.NEON_CSS}`,
              color: C.NEON_CSS,
              fontFamily: '"Courier New", monospace',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              padding: "0.65rem 1.4rem",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.25s ease",
              boxShadow: `0 0 0 1px ${C.NEON_CSS}33, 0 0 20px ${C.NEON_CSS}11`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${C.NEON_CSS}15`;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${C.NEON_CSS}, 0 0 30px ${C.NEON_CSS}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = `0 0 0 1px ${C.NEON_CSS}33, 0 0 20px ${C.NEON_CSS}11`;
            }}
          >
            [ HARDENED_APPLICATIONS ]
          </button>

          <button
            onClick={() =>
              window.__lenis?.scrollTo("#contact", { offset: -80 })
            }
            style={{
              background: `${C.CYBER_CSS}15`,
              border: `1px solid ${C.CYBER_CSS}`,
              color: C.CYBER_CSS,
              fontFamily: '"Courier New", monospace',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              padding: "0.65rem 1.4rem",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: `0 0 20px ${C.CYBER_CSS}22`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${C.CYBER_CSS}28`;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${C.CYBER_CSS}, 0 0 30px ${C.CYBER_CSS}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${C.CYBER_CSS}15`;
              e.currentTarget.style.boxShadow = `0 0 20px ${C.CYBER_CSS}22`;
            }}
          >
            [ INITIALIZE_HANDSHAKE ]
          </button>
        </motion.div>

        {/* Corner bracket decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          aria-hidden
          style={{
            position: "absolute",
            top: -16,
            left: -20,
            width: 40,
            height: 40,
            borderTop: `2px solid ${C.NEON_CSS}`,
            borderLeft: `2px solid ${C.NEON_CSS}`,
            opacity: 0.4,
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          aria-hidden
          style={{
            position: "absolute",
            bottom: -60,
            right: -20,
            width: 40,
            height: 40,
            borderBottom: `2px solid ${C.CYBER_CSS}`,
            borderRight: `2px solid ${C.CYBER_CSS}`,
            opacity: 0.4,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. THREE.JS SCENE INTERNALS
// ─────────────────────────────────────────────────────────────────────────────

// ── 4a. Loading fallback inside canvas ───────────────────────────────────────
function CanvasLoader() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const id = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      400,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Html center>
      <div
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: "0.75rem",
          color: C.NEON_CSS,
          letterSpacing: "0.15em",
          textShadow: `0 0 10px ${C.NEON_CSS}`,
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <div style={{ marginBottom: 8 }}>▣ LOADING ENTITY{dots}</div>
        <div style={{ fontSize: "0.55rem", color: "#444" }}>
          DECRYPTING_MESH_DATA
        </div>
      </div>
    </Html>
  );
}

// ── 4b. Per-mesh hover state + wireframe overlay ──────────────────────────────
function useMeshHover() {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef(null);
  const wireRef = useRef(null);
  const glowColor = useRef(new THREE.Color(C.NEON));
  const baseColor = useRef(new THREE.Color(0x0a0a0a));
  const t = useRef(0);

  const onPointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "crosshair";
  }, []);

  const onPointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    if (!mat) return;

    // Lerp emissive intensity and color
    const targetIntensity = hovered ? 1.4 : 0.0;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      targetIntensity,
      delta * 6,
    );
    mat.emissive.lerp(
      hovered ? glowColor.current : baseColor.current,
      delta * 6,
    );

    // Wireframe overlay opacity
    if (wireRef.current) {
      wireRef.current.material.opacity = THREE.MathUtils.lerp(
        wireRef.current.material.opacity,
        hovered ? 0.8 : 0.0,
        delta * 8,
      );
    }

    // Subtle scale pulse on hover
    const targetScale = hovered ? 1.035 : 1.0;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 6),
    );
  });

  return { meshRef, wireRef, hovered, onPointerOver, onPointerOut };
}

// ── 4c. Single hoverable mesh segment ────────────────────────────────────────
function CyberMeshSegment({
  geometry,
  position,
  rotation = [0, 0, 0],
  color = 0x111111,
  glowColor: customGlow,
  wireColor = C.NEON,
  children,
}) {
  const { meshRef, wireRef, hovered, onPointerOver, onPointerOut } =
    useMeshHover();
  // Allow per-segment glow override
  useEffect(() => {
    if (!meshRef.current) return;
    if (customGlow !== undefined) {
      meshRef.current.__glowColor = new THREE.Color(customGlow);
    }
  }, [customGlow, meshRef]);

  return (
    <group position={position} rotation={rotation}>
      {/* Solid mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(0x000000)}
          emissiveIntensity={0}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Wireframe overlay — appears on hover */}
      <mesh ref={wireRef} geometry={geometry} renderOrder={1}>
        <meshBasicMaterial
          color={new THREE.Color(wireColor)}
          wireframe
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Neon glow halo — radius grows on hover */}
      {hovered && (
        <pointLight
          color={new THREE.Color(wireColor)}
          intensity={3}
          distance={1.2}
          decay={2}
        />
      )}

      {children}
    </group>
  );
}

const HEAD_GEO = new THREE.BoxGeometry(0.52, 0.58, 0.48, 2, 2, 2);
const NECK_GEO = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 8);
const TORSO_GEO = new THREE.BoxGeometry(0.82, 1.05, 0.38, 2, 3, 1);
const PELVIS_GEO = new THREE.BoxGeometry(0.72, 0.28, 0.34);
const SHOULDER_GEO = new THREE.SphereGeometry(0.16, 8, 8);
const UPPER_ARM_GEO = new THREE.CapsuleGeometry(0.11, 0.44, 4, 8);
const LOWER_ARM_GEO = new THREE.CapsuleGeometry(0.09, 0.4, 4, 8);
const HAND_GEO = new THREE.BoxGeometry(0.16, 0.22, 0.08);
const UPPER_LEG_GEO = new THREE.CapsuleGeometry(0.14, 0.52, 4, 8);
const LOWER_LEG_GEO = new THREE.CapsuleGeometry(0.11, 0.48, 4, 8);
const FOOT_GEO = new THREE.BoxGeometry(0.2, 0.1, 0.32);

// Shared panel detail pieces (tiny boxes for the "armor plate" aesthetic)
const PANEL_GEO = new THREE.BoxGeometry(0.22, 0.08, 0.02);
const CHIP_GEO = new THREE.BoxGeometry(0.06, 0.06, 0.03);

function CyberCharacterPrimitives() {
  return (
    <group>
      {/* ── HEAD ───────────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={HEAD_GEO}
        position={[0, 1.76, 0]}
        color={0x0f0f0f}
        glowColor={C.NEON}
        wireColor={C.NEON}
      >
        {/* Visor accent */}
        <mesh position={[0, 0.05, 0.25]}>
          <boxGeometry args={[0.38, 0.1, 0.02]} />
          <meshStandardMaterial
            color={0x00ff66}
            emissive={new THREE.Color(C.NEON)}
            emissiveIntensity={1.2}
            roughness={0.0}
            metalness={1}
          />
        </mesh>
        {/* Side panel details */}
        {[-0.27, 0.27].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} geometry={CHIP_GEO}>
            <meshStandardMaterial
              color={0x9d00ff}
              emissive={new THREE.Color(C.CYBER)}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </CyberMeshSegment>

      {/* ── NECK ───────────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={NECK_GEO}
        position={[0, 1.42, 0]}
        color={0x0d0d0d}
        glowColor={C.NEON}
      />

      {/* ── TORSO ──────────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={TORSO_GEO}
        position={[0, 0.78, 0]}
        color={0x0c0c0c}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      >
        {/* Chest panel plates */}
        {[
          [-0.18, 0.22, 0.2],
          [0.18, 0.22, 0.2],
          [0, -0.1, 0.2],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} geometry={PANEL_GEO}>
            <meshStandardMaterial
              color={0x111111}
              emissive={new THREE.Color(i === 2 ? C.CYBER : C.NEON)}
              emissiveIntensity={0.5}
              roughness={0.1}
              metalness={1}
            />
          </mesh>
        ))}
        {/* Arc reactor-style core glyph */}
        <mesh position={[0, 0.18, 0.2]}>
          <circleGeometry args={[0.07, 6]} />
          <meshStandardMaterial
            color={0x00ff66}
            emissive={new THREE.Color(C.NEON)}
            emissiveIntensity={2.5}
          />
        </mesh>
        <pointLight
          position={[0, 0.18, 0.4]}
          color={C.NEON_CSS}
          intensity={1.5}
          distance={1.5}
          decay={2}
        />
      </CyberMeshSegment>

      {/* ── PELVIS ─────────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={PELVIS_GEO}
        position={[0, 0.16, 0]}
        color={0x0d0d0d}
        glowColor={C.NEON}
      />

      {/* ── LEFT ARM ───────────────────────────────────────── */}
      {/* Shoulder */}
      <CyberMeshSegment
        geometry={SHOULDER_GEO}
        position={[-0.54, 1.22, 0]}
        color={0x0e0e0e}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      {/* Upper arm */}
      <CyberMeshSegment
        geometry={UPPER_ARM_GEO}
        position={[-0.6, 0.86, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      {/* Elbow */}
      <CyberMeshSegment
        geometry={SHOULDER_GEO}
        position={[-0.6, 0.58, 0]}
        color={0x0e0e0e}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      {/* Lower arm */}
      <CyberMeshSegment
        geometry={LOWER_ARM_GEO}
        position={[-0.62, 0.25, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      {/* Hand */}
      <CyberMeshSegment
        geometry={HAND_GEO}
        position={[-0.63, -0.04, 0]}
        color={0x0f0f0f}
        glowColor={C.NEON}
      />

      {/* ── RIGHT ARM ──────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={SHOULDER_GEO}
        position={[0.54, 1.22, 0]}
        color={0x0e0e0e}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      <CyberMeshSegment
        geometry={UPPER_ARM_GEO}
        position={[0.6, 0.86, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      <CyberMeshSegment
        geometry={SHOULDER_GEO}
        position={[0.6, 0.58, 0]}
        color={0x0e0e0e}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      <CyberMeshSegment
        geometry={LOWER_ARM_GEO}
        position={[0.62, 0.25, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      <CyberMeshSegment
        geometry={HAND_GEO}
        position={[0.63, -0.04, 0]}
        color={0x0f0f0f}
        glowColor={C.NEON}
      />

      {/* ── LEFT LEG ───────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={UPPER_LEG_GEO}
        position={[-0.23, -0.46, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      <CyberMeshSegment
        geometry={LOWER_LEG_GEO}
        position={[-0.23, -1.06, 0]}
        color={0x0c0c0c}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      <CyberMeshSegment
        geometry={FOOT_GEO}
        position={[-0.23, -1.4, 0.06]}
        color={0x0e0e0e}
        glowColor={C.NEON}
      />

      {/* ── RIGHT LEG ──────────────────────────────────────── */}
      <CyberMeshSegment
        geometry={UPPER_LEG_GEO}
        position={[0.23, -0.46, 0]}
        color={0x0c0c0c}
        glowColor={C.NEON}
      />
      <CyberMeshSegment
        geometry={LOWER_LEG_GEO}
        position={[0.23, -1.06, 0]}
        color={0x0c0c0c}
        glowColor={C.CYBER}
        wireColor={C.CYBER}
      />
      <CyberMeshSegment
        geometry={FOOT_GEO}
        position={[0.23, -1.4, 0.06]}
        color={0x0e0e0e}
        glowColor={C.NEON}
      />
    </group>
  );
}

// ── 4e. Full character group with idle animation ──────────────────────────────
function CyberCharacter() {
  const groupRef = useRef(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    t.current += delta;
    // Idle breathing bob
    groupRef.current.position.y = Math.sin(t.current * 0.9) * 0.04;
    // Slow spin
    groupRef.current.rotation.y = Math.sin(t.current * 0.25) * 0.4;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
      <group ref={groupRef} position={[0, -0.4, 0]} scale={[1.1, 1.1, 1.1]}>
        <Suspense fallback={<CanvasLoader />}>
          <CyberCharacterPrimitives />
        </Suspense>
      </group>
    </Float>
  );
}

// ── 4f. Floating particle field ───────────────────────────────────────────────
function FloatingParticles() {
  return (
    <>
      <Sparkles
        count={120}
        scale={[4, 5, 3]}
        size={1.0}
        speed={0.25}
        opacity={0.55}
        color={C.NEON_CSS}
        noise={0.3}
      />
      <Sparkles
        count={60}
        scale={[3.5, 4, 2.5]}
        size={0.8}
        speed={0.18}
        opacity={0.35}
        color={C.CYBER_CSS}
        noise={0.5}
      />
    </>
  );
}

// ── 4g. Perspective floor grid ────────────────────────────────────────────────
function GroundGrid() {
  return (
    <Grid
      position={[0, -1.55, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.4}
      cellColor={C.NEON_CSS}
      sectionSize={2}
      sectionThickness={0.8}
      sectionColor={C.CYBER_CSS}
      fadeDistance={9}
      fadeStrength={2}
      infiniteGrid
    />
  );
}

// ── 4h. Orbit-constrained camera rig ─────────────────────────────────────────
function CameraRig({ mouseX, mouseY }) {
  const { camera } = useThree();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    // Gentle mouse parallax on the camera
    const mx = mouseX.get();
    const my = mouseY.get();
    camera.position.x += ((mx - 0.5) * 0.6 - camera.position.x) * delta * 2;
    camera.position.y +=
      ((my - 0.5) * -0.4 + 1.2 - camera.position.y) * delta * 2;
    camera.lookAt(0, 0.6, 0);
  });

  return null;
}

// ── 4i. Scene composition ─────────────────────────────────────────────────────
function Scene({ mouseX, mouseY }) {
  return (
    <>
      {/* Camera rig */}
      <CameraRig mouseX={mouseX} mouseY={mouseY} />

      {/* Orbit controls — limited to azimuth, disabled pan/zoom for UX */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
        dampingFactor={0.06}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.6}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Neon fill light from front-left */}
      <pointLight
        position={[-2, 2, 2]}
        color={C.NEON_CSS}
        intensity={1.8}
        distance={6}
        decay={2}
      />
      {/* Cyber rim light from back-right */}
      <pointLight
        position={[2, 1, -3]}
        color={C.CYBER_CSS}
        intensity={2.2}
        distance={5}
        decay={2}
      />
      {/* Cool top light */}
      <directionalLight
        position={[0, 8, -2]}
        intensity={0.3}
        color={0x6688cc}
      />

      {/* Fog */}
      <fog attach="fog" args={["#050505", 5, 18]} />

      {/* Scene objects */}
      <Suspense fallback={<CanvasLoader />}>
        <CyberCharacter />
        <FloatingParticles />
        <GroundGrid />
      </Suspense>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SCROLL CUE
// ─────────────────────────────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.0, duration: 0.6 }}
      style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: "0.55rem",
          color: "#333",
          letterSpacing: "0.2em",
          fontFamily: '"Courier New", monospace',
        }}
      >
        SCROLL_DOWN
      </span>
      <div
        style={{
          width: 1,
          height: 40,
          background: `linear-gradient(to bottom, ${C.NEON_CSS}, transparent)`,
          animation: "scroll-drop 2s ease-in-out infinite",
          boxShadow: `0 0 4px ${C.NEON_CSS}`,
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HUD OVERLAYS — floating terminal data panels
// ─────────────────────────────────────────────────────────────────────────────
const HUD_ITEMS = [
  {
    label: "APP_INTEGRITY",
    value: "HARDENED",
    color: C.NEON_CSS, // Change color to green/neon because your site is safe, not critical
    top: "20%",
    right: "3%",
  },
  {
    label: "WAF_STATUS", // Web Application Firewall — shows you protect web servers
    value: "FILTERING",
    color: C.NEON_CSS,
    top: "36%",
    right: "3%",
  },
  {
    label: "CSP_POLICY", // Content Security Policy — the absolute defense against XSS attacks
    value: "ENFORCED",
    color: C.CYBER_CSS,
    top: "52%",
    right: "3%",
  },
  {
    label: "COOKIE_AUTH", // Shows you understand secure session storage
    value: "HTTP_ONLY // SECURE",
    color: "#888",
    top: "20%",
    left: "38%",
  },
];
function HUDOverlay() {
  return (
    <>
      {HUD_ITEMS.map(({ label, value, color, ...pos }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: pos.right !== undefined ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5 + Math.random() * 0.5, duration: 0.5 }}
          style={{
            position: "absolute",
            ...pos,
            zIndex: 22,
            pointerEvents: "none",
            fontFamily: '"Courier New", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            lineHeight: 1.5,
          }}
        >
          <div style={{ color: "#333" }}>{label}</div>
          <div style={{ color, textShadow: `0 0 8px ${color}` }}>{value}</div>
          <div
            style={{
              marginTop: 3,
              height: 1,
              width: 80,
              background: `linear-gradient(90deg, ${color}66, transparent)`,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. R3F CANVAS WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function R3FCanvas({ mouseX, mouseY }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]} // cap at 1.5× for perf; plenty sharp on HiDPI
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          alpha: true, // transparent background — void shows through
        }}
        camera={{
          fov: 52,
          near: 0.1,
          far: 40,
          position: [0, 1.2, 4.2],
        }}
        style={{ background: "transparent" }}
      >
        <Scene mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. HERO ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  // Normalised 0→1 mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = useCallback(
    (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    },
    [mouseX, mouseY],
  );

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: C.VOID,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── Inject scoped keyframes ───────────────────────── */}
      <HeroStyles />

      {/* ── CSS ambient background ────────────────────────── */}
      <KineticBackground />

      {/* ── R3F 3D scene (full-section canvas) ───────────── */}
      <R3FCanvas mouseX={mouseX} mouseY={mouseY} />

      {/* ── HTML typography layer (above canvas) ─────────── */}
      <GlitchTypography mouseX={mouseX} mouseY={mouseY} />

      {/* ── HUD data overlays ─────────────────────────────── */}
      <HUDOverlay />

      {/* ── Scroll indicator ──────────────────────────────── */}
      <ScrollCue />
    </section>
  );
}
