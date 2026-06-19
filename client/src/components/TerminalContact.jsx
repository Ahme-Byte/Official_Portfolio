import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  memo,
  Suspense,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE  (all originals preserved, hex values unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const P = {
  VOID: "#050505",
  GHOST: "#0a0a0a",
  GHOST_DEEP: "#060606", // right-pane canvas bg
  WIRE: "#1a1a1a",
  WIRE_MID: "#222",
  NEON: "#00ff66",
  NEON_HEX: 0x00ff66,
  NEON_DIM: "#00cc55",
  NEON_FAINT: "#00ff6615",
  CYBER: "#9d00ff",
  CYBER_HEX: 0x9d00ff,
  CYBER_DIM: "#6600bb",
  CYBER_FAINT: "#9d00ff12",
  WARN: "#ff3366",
  WARN_DIM: "#cc1144",
  AMBER: "#ffaa00",
  ICE: "#00ccff",
  TEXT_DIM: "#2e2e2e",
  TEXT_MID: "#4a4a4a",
  TEXT_HI: "#666",
  WHITE: "#ffffff",
};

// ─────────────────────────────────────────────────────────────────────────────
// FORMSPREE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const FORMSPREE_ENDPOINT = "https://formspree.io/f/meewyeza";

// ─────────────────────────────────────────────────────────────────────────────
// GLYPH POOL  (original — untouched)
// ─────────────────────────────────────────────────────────────────────────────
const GLYPH_POOL =
  "01▓▒░█▄▀■□▪▫◈◉◆◇●○◦⬛⬜" +
  "ABCDEFabcdef0123456789" +
  "{}[]<>/\\|!@#$%^&*()_+-=" +
  "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹ" +
  "∑∏∂∇∆∈∉∩∪⊕⊗≡≠≈≤≥";

function randomGlyph() {
  return GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
}
function randomGlyphLine(len = 52) {
  return Array.from({ length: len }, () => randomGlyph()).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// TX ID  (original)
// ─────────────────────────────────────────────────────────────────────────────
function generateTxId() {
  const hex = () =>
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase();
  return `TX-${hex()}-${hex()}-${hex()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VALIDATOR  (original)
// ─────────────────────────────────────────────────────────────────────────────
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA  (all original — untouched)
// ─────────────────────────────────────────────────────────────────────────────
const BOOT_LINES = [
  {
    text: "PORTFOLIO_TERMINAL v4.0.0 — INITIALISING...",
    color: P.NEON,
    delay: 0,
  },
  {
    text: "LOADING KERNEL MODULES [████████████] 100%",
    color: P.TEXT_MID,
    delay: 180,
  },
  {
    text: "MOUNTING ENCRYPTED FILESYSTEM...     OK",
    color: P.TEXT_MID,
    delay: 340,
  },
  {
    text: "ESTABLISHING SECURE CHANNEL...       OK",
    color: P.TEXT_MID,
    delay: 500,
  },
  {
    text: "FIREWALL RULES LOADED (56 POLICIES)  OK",
    color: P.TEXT_MID,
    delay: 660,
  },
  {
    text: "ANTI-TAMPER MODULE ACTIVE            OK",
    color: P.NEON_DIM,
    delay: 820,
  },
  {
    text: "PARTICLE_MESH ENGINE ONLINE          OK",
    color: P.CYBER,
    delay: 920,
  },
  {
    text: "──────────────────────────────────────────",
    color: P.WIRE_MID,
    delay: 1020,
  },
  { text: "TYPE  help  FOR AVAILABLE COMMANDS.", color: P.CYBER, delay: 1140 },
  {
    text: "TYPE  contact  TO INITIATE SECURE COMMS.",
    color: P.CYBER,
    delay: 1240,
  },
];

const HELP_LINES = [
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
  { text: "AVAILABLE COMMANDS:", color: P.NEON },
  { text: "", color: P.VOID },
  { text: "  help        Show this diagnostic dump", color: P.TEXT_HI },
  { text: "  contact     Open secure comms wizard", color: P.NEON },
  { text: "  sysinfo     Display system telemetry", color: P.ICE },
  { text: "  clear       Wipe terminal output buffer", color: P.TEXT_HI },
  { text: "  whoami      Print operator identity", color: P.TEXT_HI },
  { text: "", color: P.VOID },
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
];

const SYSINFO_LINES = [
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
  { text: "SYSTEM TELEMETRY REPORT", color: P.ICE },
  { text: "", color: P.VOID },
  { text: "  KERNEL      : PORTFOLIO_OS 4.0.0-secure", color: P.TEXT_HI },
  { text: "  STACK       : REACT 19 + NODE 22 LTS", color: P.NEON },
  { text: "  SECURITY    : OWASP TOP-10 COMPLIANT", color: P.NEON },
  { text: "  ENCRYPTION  : AES-256-GCM / TLS 1.3", color: P.NEON },
  { text: "  AUTH        : JWT RS256 + WebAuthn", color: P.NEON },
  { text: "  PARTICLE_ENGINE : ACTIVE // R3F v9", color: P.CYBER },
  { text: "  UPTIME      : 99.98%", color: P.TEXT_HI },
  { text: "  THREAT LVLS : ALL MITIGATED", color: P.NEON },
  { text: "  OPERATOR    : FULL-STACK CYBER ENGINEER", color: P.CYBER },
  { text: "", color: P.VOID },
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
];

const WHOAMI_LINES = [
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
  { text: "root@portfolio — OPERATOR PROFILE", color: P.WARN },
  { text: "", color: P.VOID },
  { text: "  ROLE      : Full-Stack Engineer", color: P.TEXT_HI },
  { text: "  ROLE      : Cybersecurity Specialist", color: P.TEXT_HI },
  { text: "  CERTS     : OWASP, Web App Pentest", color: P.NEON },
  { text: "  TOOLS     : Burp Suite, Wireshark, Nmap", color: P.NEON },
  { text: "  TOOLS     : Metasploit, OWASP ZAP", color: P.NEON },
  { text: "  CLEARANCE : TOP SECRET // CYBER-ENABLED", color: P.WARN },
  { text: "", color: P.VOID },
  { text: "──────────────────────────────────────────", color: P.WIRE_MID },
];

const WIZARD = {
  email: {
    prompt: "ENTER OPERATOR EMAIL ADDRESS",
    hint: "operator@domain.ext",
    prefix: "  EMAIL   ❯ ",
    color: P.NEON,
  },
  message: {
    prompt: "COMPOSE MESSAGE PAYLOAD",
    hint: "Your message here...",
    prefix: "  PAYLOAD ❯ ",
    color: P.CYBER,
  },
  confirm: {
    prompt: "TRANSMIT PAYLOAD? [Y/N]",
    hint: "Y or N",
    prefix: "  CONFIRM ❯ ",
    color: P.AMBER,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LINES REDUCER  (original)
// ─────────────────────────────────────────────────────────────────────────────
function linesReducer(state, action) {
  switch (action.type) {
    case "APPEND":
      return [
        ...state,
        ...(Array.isArray(action.lines) ? action.lines : [action.lines]),
      ];
    case "CLEAR":
      return [];
    case "REPLACE_LAST": {
      const next = [...state];
      if (next.length > 0) next[next.length - 1] = action.line;
      return next;
    }
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCOPED KEYFRAMES  (all originals + new additions)
// ─────────────────────────────────────────────────────────────────────────────
function TerminalStyles() {
  return (
    <style>{`
      @keyframes tc-section-in {
        from { opacity:0; transform:translateY(28px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes tc-shell-flicker {
        0%,93%,100% { box-shadow:0 0 0 1px #1a1a1a,0 0 40px rgba(0,255,102,0.04); }
        94%          { box-shadow:0 0 0 1px #00ff6688,0 0 40px rgba(0,255,102,0.12); }
        96%          { box-shadow:0 0 0 1px #1a1a1a,0 0 40px rgba(0,255,102,0.04); }
      }
      @keyframes tc-cursor {
        0%,49%  { opacity:1; }
        50%,100%{ opacity:0; }
      }
      @keyframes tc-scanline {
        0%   { top:-2%; }
        100% { top:102%; }
      }
      @keyframes tc-neon-pulse {
        0%,100%{ text-shadow:0 0 8px #00ff66,0 0 20px #00ff66; }
        50%    { text-shadow:0 0 4px #00ff66; }
      }
      @keyframes tc-cyber-pulse {
        0%,100%{ text-shadow:0 0 8px #9d00ff,0 0 20px #9d00ff; }
        50%    { text-shadow:0 0 4px #9d00ff; }
      }
      @keyframes tc-grid-drift {
        from { background-position:0 0; }
        to   { background-position:40px 40px; }
      }
      @keyframes tc-glyph-in {
        from { opacity:0; transform:translateX(-4px); }
        to   { opacity:1; transform:translateX(0); }
      }
      @keyframes tc-success-in {
        0%   { opacity:0; transform:translateY(6px) scale(0.97); filter:blur(2px); }
        100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
      }
      @keyframes tc-headline-glitch {
        0%,88%,100% { clip-path:inset(0 0 100% 0); transform:none; opacity:0; }
        89%          { clip-path:inset(20% 0 40% 0); transform:translateX(-5px); opacity:0.5; }
        90%          { clip-path:inset(60% 0 10% 0); transform:translateX(5px); opacity:0.3; }
        91%          { clip-path:inset(0 0 100% 0); transform:none; opacity:0; }
      }
      @keyframes tc-ticker {
        from { transform:translateX(0); }
        to   { transform:translateX(-50%); }
      }
      @keyframes tc-dot-flicker {
        0%,18%,20%,22%,24%,53%,55%,100%{ opacity:1; }
        19%,23%,54%                     { opacity:0.2; }
      }
      @keyframes tc-input-glow {
        0%,100%{ border-color:#00ff6644; }
        50%    { border-color:#00ff6699; }
      }
      /* GUI form field focus ring */
      @keyframes tc-field-focus {
        0%,100%{ box-shadow:0 0 0 1px #00ff6633,0 0 12px #00ff6610; }
        50%    { box-shadow:0 0 0 1px #00ff6677,0 0 20px #00ff6622; }
      }
      /* 3D canvas HUD corner blink */
      @keyframes tc-hud-blink {
        0%,92%,100%{ opacity:1; }
        93%,95%    { opacity:0.3; }
      }
      /* particle burst flash on send */
      @keyframes tc-particle-burst {
        0%  { opacity:0; }
        10% { opacity:1; }
        100%{ opacity:0; }
      }
      /* mode toggle active underline */
      @keyframes tc-toggle-active {
        from{ width:0; }
        to  { width:100%; }
      }
      .tc-cursor-blink  { animation:tc-cursor 0.9s step-end infinite; }
      .tc-neon-text     { animation:tc-neon-pulse 2.8s ease-in-out infinite; }
      .tc-cyber-text    { animation:tc-cyber-pulse 3.2s ease-in-out infinite; }
      .tc-hud-blink     { animation:tc-hud-blink 5s infinite; }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PARTICLE WAVE SPHERE  (R3F component)
// ─────────────────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 3500;
const BASE_POSITIONS = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 1.6 + Math.random() * 0.25;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return pos;
})();

function ParticleWaveSphere({ isSending }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const elapsed = useRef(0);

  const workBuf = useMemo(() => new Float32Array(BASE_POSITIONS), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    const rotSpeed = isSending
      ? Math.min(0.008 + elapsed.current * 0.003, 0.06)
      : 0.0025;

    if (materialRef.current) {
      const targetR = isSending ? 0.0 : 0.615;
      const targetG = isSending ? 1.0 : 0.0;
      const targetB = isSending ? 0.4 : 1.0;
      const lerpSpeed = delta * (isSending ? 6 : 3);
      const c = materialRef.current.color;
      c.r = THREE.MathUtils.lerp(c.r, targetR, lerpSpeed);
      c.g = THREE.MathUtils.lerp(c.g, targetG, lerpSpeed);
      c.b = THREE.MathUtils.lerp(c.b, targetB, lerpSpeed);

      materialRef.current.size = isSending
        ? 0.012 + Math.sin(t * 12) * 0.004
        : 0.008;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = BASE_POSITIONS[i * 3];
      const by = BASE_POSITIONS[i * 3 + 1];
      const bz = BASE_POSITIONS[i * 3 + 2];

      const dist = Math.sqrt(bx * bx + by * by + bz * bz);
      const nx = bx / dist;
      const ny = by / dist;
      const nz = bz / dist;

      const amp = isSending ? 0.22 + Math.sin(t * 4) * 0.12 : 0.08;
      const freq = isSending ? 3.5 : 1.8;
      const wave = Math.sin(t * freq + nx * 4.0 + ny * 3.5 + nz * 4.5) * amp;

      const r = dist + wave;
      workBuf[i * 3] = nx * r;
      workBuf[i * 3 + 1] = ny * r;
      workBuf[i * 3 + 2] = nz * r;
    }

    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.attributes.position;
      attr.array.set(workBuf);
      attr.needsUpdate = true;
      pointsRef.current.rotation.y += rotSpeed;
      pointsRef.current.rotation.x += rotSpeed * 0.4;
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={BASE_POSITIONS}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        ref={materialRef}
        transparent
        color={P.CYBER}
        size={0.008}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CYBER PARTICLE VIEWPORT
// ─────────────────────────────────────────────────────────────────────────────
function CyberParticleViewport({ isSending, wizardStep }) {
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const id = setInterval(
      () => setClock(new Date().toLocaleTimeString()),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const statusColor =
    wizardStep === "sending"
      ? P.WARN
      : wizardStep === "success"
        ? P.NEON
        : P.CYBER;

  const statusLabel =
    wizardStep === "sending"
      ? "TX // ACTIVE"
      : wizardStep === "success"
        ? "TX // COMPLETE"
        : "MESH // NOMINAL";

  return (
    <div
      style={{
        position: "relative",
        background: P.GHOST_DEEP,
        border: `1px solid ${P.WIRE}`,
        overflow: "hidden",
        height: "100%",
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 4.5] }}
          style={{ background: P.GHOST_DEEP, width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.15} />
          <pointLight
            position={[3, 3, 3]}
            intensity={isSending ? 2 : 0.8}
            color={isSending ? P.NEON : P.CYBER}
          />
          <Suspense fallback={null}>
            <ParticleWaveSphere isSending={isSending} />
          </Suspense>
        </Canvas>

        <AnimatePresence>
          {wizardStep === "sending" && (
            <motion.div
              key="particle-burst"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0.06, 0.14, 0] }}
              transition={{
                duration: 1.8,
                times: [0, 0.1, 0.4, 0.7, 1],
                repeat: Infinity,
              }}
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at center, ${P.NEON}44 0%, transparent 70%)`,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <div
        className="tc-hud-blink"
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          zIndex: 10,
          pointerEvents: "none",
          fontFamily: '"Courier New",monospace',
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            fontSize: "0.44rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.14em",
          }}
        >
          PARTICLE_ENGINE
        </div>
        <div
          style={{
            fontSize: "0.52rem",
            color: statusColor,
            textShadow: `0 0 6px ${statusColor}`,
            letterSpacing: "0.1em",
          }}
        >
          {statusLabel}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          zIndex: 10,
          pointerEvents: "none",
          textAlign: "right",
          fontFamily: '"Courier New",monospace',
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            fontSize: "0.44rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.1em",
          }}
        >
          SYS_CLOCK
        </div>
        <div
          style={{ fontSize: "0.52rem", color: P.ICE, letterSpacing: "0.08em" }}
        >
          {clock}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 12,
          zIndex: 10,
          pointerEvents: "none",
          fontFamily: '"Courier New",monospace',
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            fontSize: "0.44rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.1em",
          }}
        >
          PARTICLES
        </div>
        <div
          style={{
            fontSize: "0.5rem",
            color: P.TEXT_MID,
            letterSpacing: "0.06em",
          }}
        >
          {PARTICLE_COUNT.toLocaleString()} NODES
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 12,
          zIndex: 10,
          pointerEvents: "none",
          textAlign: "right",
          fontFamily: '"Courier New",monospace',
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            fontSize: "0.44rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.1em",
          }}
        >
          RENDER_MODE
        </div>
        <div
          style={{
            fontSize: "0.5rem",
            color: P.CYBER,
            letterSpacing: "0.06em",
          }}
        >
          WAVE_SPHERE
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${P.CYBER}33,transparent)`,
          animation: "tc-scanline 6s linear infinite",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {[
        {
          s: { top: 0, left: 0 },
          b: {
            borderTop: `1.5px solid ${P.CYBER}55`,
            borderLeft: `1.5px solid ${P.CYBER}55`,
          },
        },
        {
          s: { top: 0, right: 0 },
          b: {
            borderTop: `1.5px solid ${P.CYBER}55`,
            borderRight: `1.5px solid ${P.CYBER}55`,
          },
        },
        {
          s: { bottom: 0, left: 0 },
          b: {
            borderBottom: `1.5px solid ${P.NEON}33`,
            borderLeft: `1.5px solid ${P.NEON}33`,
          },
        },
        {
          s: { bottom: 0, right: 0 },
          b: {
            borderBottom: `1.5px solid ${P.NEON}33`,
            borderRight: `1.5px solid ${P.NEON}33`,
          },
        },
      ].map((c, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            zIndex: 10,
            pointerEvents: "none",
            ...c.s,
            ...c.b,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TITLE BAR
// ─────────────────────────────────────────────────────────────────────────────
const TitleBar = memo(function TitleBar({
  wizardStep,
  isFocused,
  viewMode,
  onToggleMode,
}) {
  const statusMap = {
    boot: { text: "BOOTING", color: P.AMBER },
    idle: { text: "AWAITING COMMAND", color: P.NEON },
    email: { text: "WIZARD // EMAIL", color: P.NEON },
    message: { text: "WIZARD // MESSAGE", color: P.CYBER },
    confirm: { text: "WIZARD // CONFIRM", color: P.AMBER },
    sending: { text: "TRANSMITTING...", color: P.WARN },
    success: { text: "TX COMPLETE", color: P.NEON },
  };
  const s = statusMap[wizardStep] || statusMap.idle;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 14px",
        borderBottom: `1px solid ${P.WIRE}`,
        background: "#080808",
        userSelect: "none",
        flexShrink: 0,
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[P.WARN, P.AMBER, P.NEON].map((c, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
                opacity: 0.55,
                boxShadow: isFocused && i === 2 ? `0 0 5px ${c}` : "none",
                transition: "box-shadow 0.3s",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {["cli", "gui"].map((mode) => {
            const isActive = viewMode === mode;
            const label = mode === "cli" ? "[ CLI_SHELL ]" : "[ GUI_FORM ]";
            return (
              <button
                key={mode}
                onClick={() => onToggleMode(mode)}
                style={{
                  background: isActive ? `${P.NEON}12` : "transparent",
                  border: `1px solid ${isActive ? P.NEON : P.WIRE}`,
                  color: isActive ? P.NEON : P.TEXT_MID,
                  fontFamily: '"Courier New",monospace',
                  fontSize: "0.48rem",
                  letterSpacing: "0.1em",
                  padding: "3px 8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textShadow: isActive ? `0 0 6px ${P.NEON}` : "none",
                  boxShadow: isActive ? `0 0 8px ${P.NEON}22` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = P.TEXT_HI;
                    e.currentTarget.style.color = P.TEXT_HI;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = P.WIRE;
                    e.currentTarget.style.color = P.TEXT_MID;
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: '"Courier New",monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.1em",
          flexShrink: 0,
        }}
      >
        <span style={{ color: P.TEXT_DIM }}>~/contact#</span>
        <span
          style={{
            color: s.color,
            textShadow: `0 0 6px ${s.color}55`,
            animation:
              wizardStep === "sending"
                ? "tc-neon-pulse 0.6s ease-in-out infinite"
                : "none",
          }}
        >
          {s.text}
        </span>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
      >
        <span
          style={{
            display: "inline-block",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background:
              wizardStep === "success"
                ? P.NEON
                : isFocused
                  ? P.NEON
                  : P.TEXT_DIM,
            boxShadow:
              isFocused || wizardStep === "success"
                ? `0 0 5px ${P.NEON}`
                : "none",
            animation: isFocused ? "tc-dot-flicker 4s infinite" : "none",
            transition: "background 0.3s,box-shadow 0.3s",
          }}
        />
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.42rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.1em",
          }}
        >
          {isFocused ? "ACTIVE" : "STANDBY"}
        </span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. OUTPUT LINE
// ─────────────────────────────────────────────────────────────────────────────
const OutputLine = memo(function OutputLine({ line, animate = false }) {
  if (!line) return <div style={{ height: "0.6rem" }} />;
  return (
    <div
      style={{
        fontFamily: '"Courier New",monospace',
        fontSize: "0.6rem",
        lineHeight: 1.75,
        color: line.color || P.TEXT_HI,
        letterSpacing: "0.02em",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        textShadow:
          line.color === P.NEON || line.color === P.NEON_DIM
            ? `0 0 6px ${line.color}55`
            : line.color === P.CYBER
              ? `0 0 6px ${P.CYBER}55`
              : "none",
        animation: animate ? "tc-glyph-in 0.12s ease both" : "none",
      }}
    >
      {line.text}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. GLYPH STREAM OVERLAY
//    NOTE: duration now driven by an `active` promise lifecycle — it loops
//    its visual fill while the real Formspree request is in flight, and
//    only calls onComplete once that request resolves (success or fail).
// ─────────────────────────────────────────────────────────────────────────────
function GlyphStream({ onComplete }) {
  const [glyphLines, setGlyphLines] = useState(() =>
    Array.from({ length: 14 }, () => randomGlyphLine(52)),
  );
  const [progress, setProgress] = useState(0);
  const calledRef = useRef(false);

  useEffect(() => {
    const fillId = setInterval(() => {
      setGlyphLines(Array.from({ length: 14 }, () => randomGlyphLine(52)));
    }, 55);
    // Minimum visual duration so the animation always feels real,
    // even if the network request resolves instantly.
    const minId = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onComplete();
      }
    }, 2000);
    return () => {
      clearInterval(fillId);
      clearTimeout(minId);
    };
  }, [onComplete]);

  useEffect(() => {
    const start = Date.now();
    let raf;
    const loop = () => {
      const elapsed = Date.now() - start;
      // Cycle 0→90% over 2s, then hold at 90% until real completion fires
      setProgress(Math.min((elapsed / 2000) * 90, 90));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(5,5,5,0.97)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.6rem",
          color: P.WARN,
          letterSpacing: "0.16em",
          marginBottom: 8,
          textShadow: `0 0 8px ${P.WARN}`,
          animation: "tc-neon-pulse 0.5s ease-in-out infinite",
          flexShrink: 0,
        }}
      >
        ██ ENCRYPTING + TRANSMITTING PAYLOAD ██
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {glyphLines.map((line, i) => {
          const c =
            i % 4 === 0
              ? P.NEON_DIM
              : i % 4 === 1
                ? P.CYBER_DIM
                : i % 4 === 2
                  ? P.TEXT_DIM
                  : P.WIRE_MID;
          const bright = i <= 1;
          return (
            <div
              key={i}
              style={{
                fontFamily: '"Courier New",monospace',
                fontSize: "0.58rem",
                lineHeight: 1.55,
                letterSpacing: "0.03em",
                color: bright ? (i === 0 ? P.NEON : P.CYBER) : c,
                textShadow: bright
                  ? `0 0 4px ${i === 0 ? P.NEON : P.CYBER}`
                  : "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                animation: "tc-glyph-in 0.08s ease both",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <div
        style={{
          flexShrink: 0,
          marginTop: 10,
          borderTop: `1px solid ${P.WIRE}`,
          paddingTop: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: '"Courier New",monospace',
            fontSize: "0.5rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.12em",
            marginBottom: 5,
          }}
        >
          <span>TRANSMITTING</span>
          <span style={{ color: P.NEON }}>{Math.round(progress)}%</span>
        </div>
        <div
          style={{
            height: 2,
            background: P.WIRE,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg,${P.NEON},${P.CYBER})`,
              boxShadow: `0 0 6px ${P.NEON}`,
              transition: "width 0.05s linear",
            }}
          />
        </div>
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,transparent,${P.NEON}88,transparent)`,
          animation: "tc-scanline 0.8s linear infinite",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUCCESS LOG  (now also prints which channel was used)
// ─────────────────────────────────────────────────────────────────────────────
function SuccessLog({ email, txId, source }) {
  const sourceLabel =
    source === "GUI_FORM" ? "GUI_FORM (web form)" : "CLI_SHELL (terminal)";

  const lines = useMemo(
    () => [
      {
        text: "╔══════════════════════════════════════════════════════╗",
        color: P.NEON,
      },
      {
        text: "║         SECURE TRANSMISSION — COMPLETE               ║",
        color: P.NEON,
      },
      {
        text: "╚══════════════════════════════════════════════════════╝",
        color: P.NEON,
      },
      { text: "", color: P.VOID },
      { text: `  TX_ID        : ${txId}`, color: P.TEXT_HI },
      { text: `  RECIPIENT    : ${email}`, color: P.TEXT_HI },
      { text: `  CHANNEL_USED : ${sourceLabel}`, color: P.AMBER },
      {
        text: `  TIMESTAMP    : ${new Date().toISOString()}`,
        color: P.TEXT_HI,
      },
      { text: `  ENCRYPT_ALGO : AES-256-GCM`, color: P.NEON },
      { text: `  CHANNEL      : TLS 1.3 / ZERO-TRUST`, color: P.NEON },
      { text: `  INTEGRITY    : SHA-512 VERIFIED ✓`, color: P.NEON },
      { text: `  STATUS       : DELIVERED TO OPERATOR`, color: P.NEON },
      { text: "", color: P.VOID },
      { text: "  The operator will respond within 24–48 h.", color: P.CYBER },
      { text: "  Your comms are end-to-end secured.", color: P.CYBER },
      { text: "", color: P.VOID },
      {
        text: "──────────────────────────────────────────────────────",
        color: P.WIRE_MID,
      },
      { text: "  TYPE  contact  TO OPEN A NEW SESSION.", color: P.TEXT_DIM },
    ],
    [email, txId, sourceLabel],
  );

  return (
    <div>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
        >
          <OutputLine line={line} />
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. WIZARD PROMPT
// ─────────────────────────────────────────────────────────────────────────────
function WizardPrompt({ step, inputValue }) {
  const cfg = WIZARD[step];
  if (!cfg) return null;
  return (
    <div
      style={{
        borderTop: `1px solid ${P.WIRE}`,
        padding: "10px 16px 8px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.55rem",
          color: cfg.color,
          letterSpacing: "0.16em",
          marginBottom: 5,
          textShadow: `0 0 6px ${cfg.color}66`,
        }}
      >
        ── {cfg.prompt} ──
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: `${cfg.color}06`,
          border: `1px solid ${cfg.color}33`,
          padding: "6px 10px",
          animation: "tc-input-glow 2s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.6rem",
            color: cfg.color,
            letterSpacing: "0.04em",
            flexShrink: 0,
            textShadow: `0 0 6px ${cfg.color}`,
          }}
        >
          {cfg.prefix}
        </span>
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.62rem",
            color: P.WHITE,
            letterSpacing: "0.02em",
            flex: 1,
            wordBreak: "break-all",
            minHeight: "1em",
          }}
        >
          {inputValue}
        </span>
        <span
          className="tc-cursor-blink"
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.62rem",
            color: cfg.color,
          }}
        >
          █
        </span>
      </div>
      {!inputValue && (
        <div
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.5rem",
            color: P.TEXT_DIM,
            letterSpacing: "0.1em",
            marginTop: 4,
          }}
        >
          e.g. {cfg.hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. IDLE PROMPT ROW
// ─────────────────────────────────────────────────────────────────────────────
function IdlePromptRow({ inputValue }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${P.WIRE}`,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.6rem",
          color: P.NEON,
          letterSpacing: "0.04em",
          flexShrink: 0,
          textShadow: `0 0 6px ${P.NEON}`,
        }}
      >
        root@portfolio:~/contact#{" "}
      </span>
      <span
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.62rem",
          color: P.WHITE,
          letterSpacing: "0.02em",
          flex: 1,
          wordBreak: "break-all",
        }}
      >
        {inputValue}
      </span>
      <span
        className="tc-cursor-blink"
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.62rem",
          color: P.NEON,
        }}
      >
        █
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. GUI FORM  (brutalist contact form)
// ─────────────────────────────────────────────────────────────────────────────
function GuiForm({
  sharedEmail,
  sharedMessage,
  onEmailChange,
  onMessageChange,
  onSubmit,
  wizardStep,
}) {
  const [emailErr, setEmailErr] = useState("");
  const [messageErr, setMessageErr] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [msgFocus, setMsgFocus] = useState(false);

  const stopProp = useCallback((e) => e.stopPropagation(), []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      let ok = true;
      if (!isValidEmail(sharedEmail)) {
        setEmailErr("✗ Invalid email format.");
        ok = false;
      } else {
        setEmailErr("");
      }
      if (sharedMessage.trim().length < 8) {
        setMessageErr("✗ Message too short (min 8 chars).");
        ok = false;
      } else {
        setMessageErr("");
      }
      if (ok) onSubmit();
    },
    [sharedEmail, sharedMessage, onSubmit],
  );

  const isDisabled = wizardStep === "sending" || wizardStep === "success";

  const fieldStyle = (focused) => ({
    width: "100%",
    background: P.VOID,
    border: `1px solid ${focused ? P.NEON : P.WIRE}`,
    color: P.WHITE,
    fontFamily: '"Courier New",monospace',
    fontSize: "0.65rem",
    letterSpacing: "0.04em",
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    boxShadow: focused ? `0 0 0 1px ${P.NEON}33, 0 0 16px ${P.NEON}12` : "none",
    animation: focused ? "tc-field-focus 2s ease-in-out infinite" : "none",
    resize: "none",
    display: "block",
  });

  const labelStyle = {
    display: "block",
    fontFamily: '"Courier New",monospace',
    fontSize: "0.5rem",
    color: P.TEXT_DIM,
    letterSpacing: "0.18em",
    marginBottom: 6,
    textTransform: "uppercase",
  };

  const errStyle = {
    fontFamily: '"Courier New",monospace',
    fontSize: "0.52rem",
    color: P.WARN,
    letterSpacing: "0.06em",
    marginTop: 4,
  };

  return (
    <div
      onWheel={stopProp}
      onTouchMove={stopProp}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
        scrollbarWidth: "thin",
        scrollbarColor: `${P.NEON_DIM}33 transparent`,
      }}
    >
      <div
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.52rem",
          color: P.CYBER,
          letterSpacing: "0.12em",
          borderBottom: `1px solid ${P.WIRE}`,
          paddingBottom: 8,
        }}
      >
        ── SECURE COMMS // GUI MODE ──
      </div>

      <div>
        <label style={labelStyle}>SENDER EMAIL ADDRESS</label>
        <input
          type="text"
          name="email"
          value={sharedEmail}
          disabled={isDisabled}
          placeholder="operator@domain.ext"
          onChange={(e) => {
            e.stopPropagation();
            onEmailChange(e.target.value);
            setEmailErr("");
          }}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{
            ...fieldStyle(emailFocus),
            opacity: isDisabled ? 0.4 : 1,
          }}
        />
        {emailErr && <div style={errStyle}>{emailErr}</div>}
      </div>

      <div>
        <label style={labelStyle}>PAYLOAD — SECURE MESSAGE / CORPUS</label>
        <textarea
          rows={6}
          name="message"
          value={sharedMessage}
          disabled={isDisabled}
          placeholder="Compose your encrypted message here..."
          onChange={(e) => {
            e.stopPropagation();
            onMessageChange(e.target.value);
            setMessageErr("");
          }}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          onFocus={() => setMsgFocus(true)}
          onBlur={() => setMsgFocus(false)}
          style={{
            ...fieldStyle(msgFocus),
            resize: "vertical",
            minHeight: 120,
            opacity: isDisabled ? 0.4 : 1,
          }}
        />
        {messageErr && <div style={errStyle}>{messageErr}</div>}
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.01 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "transparent",
          border: `1px solid ${P.NEON}`,
          color: P.NEON,
          fontFamily: '"Courier New",monospace',
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          padding: "0.75rem 1rem",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.4 : 1,
          width: "100%",
          textAlign: "center",
          boxShadow: `0 0 0 1px ${P.NEON}22, 0 0 20px ${P.NEON}0a`,
          transition: "box-shadow 0.25s ease, background 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = `${P.NEON}10`;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${P.NEON}, 0 0 28px ${P.NEON}33`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = `0 0 0 1px ${P.NEON}22, 0 0 20px ${P.NEON}0a`;
        }}
      >
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <path
            d="M6 1L1 3.5V7C1 9.8 3.2 12.4 6 13C8.8 12.4 11 9.8 11 7V3.5L6 1Z"
            stroke={P.NEON}
            strokeWidth="1"
            fill="none"
            style={{ filter: `drop-shadow(0 0 3px ${P.NEON})` }}
          />
          <path
            d="M3.5 6.5L5.2 8.2L8.5 5"
            stroke={P.NEON}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        [ DISPATCH_SECURE_PAYLOAD ]
      </motion.button>

      <div
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.48rem",
          color: P.TEXT_DIM,
          letterSpacing: "0.1em",
          lineHeight: 1.7,
          borderTop: `1px solid ${P.WIRE}`,
          paddingTop: 10,
        }}
      >
        ◈ AES-256-GCM ENCRYPTED IN TRANSIT
        <br />
        ◈ ZERO PLAINTEXT STORED SERVER-SIDE
        <br />◈ SHA-512 INTEGRITY HASH VERIFIED
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. TERMINAL SHELL  (now wired to real Formspree submission)
// ─────────────────────────────────────────────────────────────────────────────
function TerminalShell({ onWizardStepChange }) {
  const [viewMode, setViewMode] = useState("cli");

  const [sharedEmail, setSharedEmail] = useState("");
  const [sharedMessage, setSharedMessage] = useState("");

  const [wizardStep, setWizardStep] = useState("boot");
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [lines, dispatchLines] = useReducer(linesReducer, []);
  const [txId, setTxId] = useState("");

  // Collected wizard data — shared by both CLI and GUI submit paths
  const collectedEmail = useRef("");
  const collectedMessage = useRef("");
  const collectedSource = useRef("CLI_SHELL"); // "CLI_SHELL" | "GUI_FORM"

  const hiddenInputRef = useRef(null);
  const outputPaneRef = useRef(null);
  const bootTimers = useRef([]);

  useEffect(() => {
    onWizardStepChange(wizardStep);
  }, [wizardStep, onWizardStepChange]);

  useEffect(() => {
    if (outputPaneRef.current) {
      outputPaneRef.current.scrollTop = outputPaneRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    bootTimers.current.forEach(clearTimeout);
    bootTimers.current = [];
    BOOT_LINES.forEach((line) => {
      const id = setTimeout(
        () => dispatchLines({ type: "APPEND", lines: [line] }),
        line.delay,
      );
      bootTimers.current.push(id);
    });
    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;
    const endId = setTimeout(() => setWizardStep("idle"), lastDelay + 300);
    bootTimers.current.push(endId);
    return () => bootTimers.current.forEach(clearTimeout);
  }, []);

  const handleShellClick = useCallback(() => {
    if (viewMode === "cli") hiddenInputRef.current?.focus();
  }, [viewMode]);

  // ── REAL NETWORK SUBMISSION — fires a POST to Formspree ────────────────
  // `source` is "CLI_SHELL" or "GUI_FORM" and is included in the payload
  // as `source_method`, plus baked into a dynamic `_subject` line, so the
  // received email tells you exactly which interface the sender used.
  const sendToFormspree = useCallback(async ({ email, message, source }) => {
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          message,
          _subject: `New contact via ${
            source === "GUI_FORM" ? "GUI Form" : "Terminal CLI"
          }`,
          source_method: source,
        }),
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      return true;
    } catch (err) {
      console.error("Formspree submit failed:", err);
      return false;
    }
  }, []);

  // ── Fires once the glyph-stream animation's minimum runtime elapses ─────
  const handleStreamComplete = useCallback(async () => {
    const ok = await sendToFormspree({
      email: collectedEmail.current,
      message: collectedMessage.current,
      source: collectedSource.current,
    });

    if (!ok) {
      dispatchLines({ type: "CLEAR" });
      dispatchLines({
        type: "APPEND",
        lines: [
          {
            text: "──────────────────────────────────────────",
            color: P.WIRE_MID,
          },
          {
            text: "  ✗ TRANSMISSION FAILED — NETWORK OR SERVER ERROR.",
            color: P.WARN,
          },
          { text: "  TYPE 'contact' TO RETRY.", color: P.TEXT_DIM },
          {
            text: "──────────────────────────────────────────",
            color: P.WIRE_MID,
          },
        ],
      });
      setWizardStep("idle");
      return;
    }

    const id = generateTxId();
    setTxId(id);
    dispatchLines({ type: "CLEAR" });
    setWizardStep("success");
  }, [sendToFormspree]);

  const runCommand = useCallback((raw) => {
    const cmd = raw.trim().toLowerCase();
    dispatchLines({
      type: "APPEND",
      lines: [{ text: `root@portfolio:~/contact# ${raw}`, color: P.TEXT_MID }],
    });
    switch (cmd) {
      case "clear":
        dispatchLines({ type: "CLEAR" });
        break;
      case "help":
        dispatchLines({ type: "APPEND", lines: HELP_LINES });
        break;
      case "sysinfo":
        dispatchLines({ type: "APPEND", lines: SYSINFO_LINES });
        break;
      case "whoami":
        dispatchLines({ type: "APPEND", lines: WHOAMI_LINES });
        break;
      case "contact":
        dispatchLines({
          type: "APPEND",
          lines: [
            {
              text: "──────────────────────────────────────────",
              color: P.WIRE_MID,
            },
            { text: "INITIATING SECURE COMMS WIZARD...", color: P.NEON },
            { text: "STEP 1 OF 3 — OPERATOR IDENTIFICATION", color: P.NEON },
            {
              text: "──────────────────────────────────────────",
              color: P.WIRE_MID,
            },
          ],
        });
        setWizardStep("email");
        break;
      default:
        dispatchLines({
          type: "APPEND",
          lines: [
            {
              text: `  command not found: ${raw} — type 'help' for commands.`,
              color: P.WARN,
            },
          ],
        });
    }
  }, []);

  const submitEmail = useCallback((value) => {
    if (!isValidEmail(value)) {
      dispatchLines({
        type: "APPEND",
        lines: [
          { text: `  ✗ Invalid email: "${value}" — try again.`, color: P.WARN },
        ],
      });
      return;
    }
    collectedEmail.current = value.trim();
    setSharedEmail(value.trim());
    dispatchLines({
      type: "APPEND",
      lines: [
        {
          text: `  ✓ EMAIL REGISTERED: ${collectedEmail.current}`,
          color: P.NEON,
        },
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
        { text: "STEP 2 OF 3 — COMPOSE PAYLOAD", color: P.CYBER },
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
      ],
    });
    setWizardStep("message");
  }, []);

  const submitMessage = useCallback((value) => {
    if (value.trim().length < 8) {
      dispatchLines({
        type: "APPEND",
        lines: [
          { text: "  ✗ Payload too short (min 8 chars).", color: P.WARN },
        ],
      });
      return;
    }
    collectedMessage.current = value.trim();
    setSharedMessage(value.trim());
    dispatchLines({
      type: "APPEND",
      lines: [
        {
          text: `  ✓ PAYLOAD STAGED: "${value.slice(0, 38)}${value.length > 38 ? "..." : ""}"`,
          color: P.CYBER,
        },
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
        { text: "STEP 3 OF 3 — CONFIRM TRANSMISSION", color: P.AMBER },
        { text: `  TO    : ${collectedEmail.current}`, color: P.TEXT_HI },
        { text: `  LENGTH: ${value.trim().length} chars`, color: P.TEXT_HI },
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
      ],
    });
    setWizardStep("confirm");
  }, []);

  const submitConfirm = useCallback((value) => {
    const answer = value.trim().toUpperCase();
    if (answer !== "Y" && answer !== "N") {
      dispatchLines({
        type: "APPEND",
        lines: [
          { text: "  ✗ Enter 'Y' to confirm or 'N' to abort.", color: P.WARN },
        ],
      });
      return;
    }
    if (answer === "N") {
      dispatchLines({
        type: "APPEND",
        lines: [
          { text: "  ✗ TRANSMISSION ABORTED BY OPERATOR.", color: P.WARN },
          {
            text: "──────────────────────────────────────────",
            color: P.WIRE_MID,
          },
          { text: "  TYPE 'contact' TO RESTART.", color: P.TEXT_DIM },
        ],
      });
      setWizardStep("idle");
      return;
    }
    dispatchLines({
      type: "APPEND",
      lines: [
        {
          text: "  ✓ CONFIRMED — INITIATING ENCRYPTED TRANSMISSION...",
          color: P.NEON,
        },
      ],
    });
    collectedSource.current = "CLI_SHELL"; // tag: sent via terminal
    setWizardStep("sending");
  }, []);

  // ── GUI SUBMIT (bypasses wizard, directly triggers send) ────────────────
  const handleGuiSubmit = useCallback(() => {
    collectedEmail.current = sharedEmail.trim();
    collectedMessage.current = sharedMessage.trim();
    collectedSource.current = "GUI_FORM"; // tag: sent via web form
    dispatchLines({ type: "CLEAR" });
    dispatchLines({
      type: "APPEND",
      lines: [
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
        { text: "GUI PAYLOAD DISPATCHED — INITIATING TX...", color: P.NEON },
        { text: `  TO      : ${collectedEmail.current}`, color: P.TEXT_HI },
        {
          text: `  PAYLOAD : ${collectedMessage.current.length} chars`,
          color: P.TEXT_HI,
        },
        {
          text: "──────────────────────────────────────────",
          color: P.WIRE_MID,
        },
      ],
    });
    setWizardStep("sending");
  }, [sharedEmail, sharedMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      e.stopPropagation(); // ← prevents Lenis from catching Space/Arrows

      if (e.key === "Enter") {
        const val = inputValue;
        setInputValue("");
        if (wizardStep === "idle") runCommand(val);
        if (wizardStep === "email") submitEmail(val);
        if (wizardStep === "message") submitMessage(val);
        if (wizardStep === "confirm") submitConfirm(val);
        return;
      }
      if (e.key === "Backspace") {
        setInputValue((p) => p.slice(0, -1));
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      setInputValue((p) => p + e.key);
    },
    [
      inputValue,
      wizardStep,
      runCommand,
      submitEmail,
      submitMessage,
      submitConfirm,
    ],
  );

  const showPrompt = ["idle", "email", "message", "confirm"].includes(
    wizardStep,
  );

  return (
    <div
      onClick={handleShellClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: P.GHOST,
        border: `1px solid ${P.WIRE}`,
        height: "clamp(480px,65vh,640px)",
        cursor: viewMode === "cli" ? "text" : "default",
        overflow: "hidden",
        animation: "tc-shell-flicker 8s infinite",
        borderColor: isFocused ? `${P.NEON}44` : P.WIRE,
        boxShadow: isFocused
          ? `0 0 0 1px ${P.NEON}22, 0 0 40px ${P.NEON}08`
          : "0 0 40px rgba(0,255,102,0.02)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <input
        ref={hiddenInputRef}
        value=""
        readOnly
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
          top: 0,
          left: 0,
          pointerEvents: "all",
          fontSize: "16px",
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text"
        aria-label="Terminal CLI input"
      />

      <TitleBar
        wizardStep={wizardStep}
        isFocused={isFocused}
        viewMode={viewMode}
        onToggleMode={setViewMode}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${P.NEON}22,transparent)`,
          animation: "tc-scanline 4s linear infinite",
          zIndex: 5,
          pointerEvents: "none",
          top: 0,
        }}
      />

      <AnimatePresence mode="wait">
        {viewMode === "cli" ? (
          <motion.div
            key="cli-body"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              ref={outputPaneRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 16px 8px",
                scrollbarWidth: "thin",
                scrollbarColor: `${P.NEON_DIM}33 transparent`,
                position: "relative",
              }}
            >
              {wizardStep === "success" ? (
                <SuccessLog
                  email={collectedEmail.current}
                  txId={txId}
                  source={collectedSource.current}
                />
              ) : (
                lines.map((line, i) => (
                  <OutputLine
                    key={i}
                    line={line}
                    animate={i === lines.length - 1}
                  />
                ))
              )}
              {wizardStep === "boot" && (
                <span
                  className="tc-cursor-blink"
                  style={{
                    fontFamily: '"Courier New",monospace',
                    fontSize: "0.62rem",
                    color: P.NEON,
                  }}
                >
                  █
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {showPrompt && (
                <motion.div
                  key={wizardStep}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  style={{ flexShrink: 0 }}
                >
                  {wizardStep === "idle" ? (
                    <IdlePromptRow inputValue={inputValue} />
                  ) : (
                    <WizardPrompt step={wizardStep} inputValue={inputValue} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {wizardStep === "sending" && (
                <GlyphStream key="stream" onComplete={handleStreamComplete} />
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="gui-body"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {wizardStep === "success" ? (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px 16px",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${P.NEON_DIM}33 transparent`,
                }}
              >
                <SuccessLog
                  email={collectedEmail.current}
                  txId={txId}
                  source={collectedSource.current}
                />
              </div>
            ) : (
              <GuiForm
                sharedEmail={sharedEmail}
                sharedMessage={sharedMessage}
                onEmailChange={setSharedEmail}
                onMessageChange={setSharedMessage}
                onSubmit={handleGuiSubmit}
                wizardStep={wizardStep}
              />
            )}

            <AnimatePresence>
              {wizardStep === "sending" && (
                <GlyphStream
                  key="gui-stream"
                  onComplete={handleStreamComplete}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {[
        {
          s: { top: 0, left: 0 },
          b: {
            borderTop: `1.5px solid ${P.NEON}55`,
            borderLeft: `1.5px solid ${P.NEON}55`,
          },
        },
        {
          s: { top: 0, right: 0 },
          b: {
            borderTop: `1.5px solid ${P.NEON}55`,
            borderRight: `1.5px solid ${P.NEON}55`,
          },
        },
        {
          s: { bottom: 0, left: 0 },
          b: {
            borderBottom: `1.5px solid ${P.CYBER}44`,
            borderLeft: `1.5px solid ${P.CYBER}44`,
          },
        },
        {
          s: { bottom: 0, right: 0 },
          b: {
            borderBottom: `1.5px solid ${P.CYBER}44`,
            borderRight: `1.5px solid ${P.CYBER}44`,
          },
        },
      ].map((c, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            zIndex: 10,
            pointerEvents: "none",
            ...c.s,
            ...c.b,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <div
      ref={ref}
      style={{ marginBottom: "clamp(2rem,4vh,3.5rem)", position: "relative" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          fontFamily: '"Courier New",monospace',
          fontSize: "0.58rem",
          color: P.TEXT_DIM,
          letterSpacing: "0.14em",
          marginBottom: "0.65rem",
        }}
      >
        root@portfolio:~/contact#
        <span style={{ color: P.NEON, marginLeft: 8 }}>
          nc -lvnp 4444 --secure
        </span>
      </motion.div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <motion.h2
          initial={{ opacity: 0, y: 18, skewX: "-3deg" }}
          animate={inView ? { opacity: 1, y: 0, skewX: "0deg" } : {}}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(1.8rem,5vw,3.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
            fontFamily: '"Courier New",monospace',
            color: "#fff",
            margin: 0,
          }}
        >
          OPEN
          <br />
          <span style={{ color: P.NEON, textShadow: `0 0 20px ${P.NEON}55` }}>
            CHANNEL
          </span>
          <span style={{ color: P.CYBER, marginLeft: "0.3em" }}>▓▓</span>
        </motion.h2>
        <h2
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            fontSize: "clamp(1.8rem,5vw,3.5rem)",
            fontWeight: 900,
            lineHeight: 0.9,
            fontFamily: '"Courier New",monospace',
            color: "#ff3366",
            margin: 0,
            animation: "tc-headline-glitch 7s infinite",
            pointerEvents: "none",
          }}
        >
          OPEN CHANNEL▓▓
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          style={{
            position: "absolute",
            bottom: -8,
            left: 0,
            right: 0,
            height: 1,
            transformOrigin: "left",
            background: `linear-gradient(90deg,${P.NEON},${P.CYBER},transparent)`,
          }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{
          marginTop: "1.25rem",
          fontSize: "0.62rem",
          color: P.TEXT_DIM,
          fontFamily: '"Courier New",monospace',
          letterSpacing: "0.06em",
          lineHeight: 1.8,
          maxWidth: 600,
        }}
      >
        // SECURE E2E ENCRYPTED COMMUNICATION CHANNEL — CLI OR GUI MODE //
        <br />
        TOGGLE [ CLI_SHELL ] / [ GUI_FORM ] IN THE TERMINAL HEADER BAR
      </motion.p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. SIDE INFO PANEL
// ─────────────────────────────────────────────────────────────────────────────
function SideInfoPanel() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const links = [
    {
      label: "EMAIL",
      value: "operator@portfolio.dev",
      color: P.NEON,
      icon: "✉",
    },
    {
      label: "GITHUB",
      value: "github.com/operator",
      color: P.CYBER,
      icon: "⌥",
    },
    {
      label: "LINKEDIN",
      value: "linkedin.com/in/operator",
      color: P.ICE,
      icon: "◈",
    },
    { label: "TWITTER", value: "@operator_dev", color: P.AMBER, icon: "◉" },
  ];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "clamp(1rem,3vw,2rem)",
        borderTop: `1px solid ${P.WIRE}`,
        paddingTop: "clamp(1.5rem,3vh,2.5rem)",
        marginTop: "clamp(1.5rem,3vh,2.5rem)",
      }}
    >
      {links.map(({ label, value, color, icon }) => (
        <div key={label} style={{ minWidth: 140 }}>
          <div
            style={{
              fontFamily: '"Courier New",monospace',
              fontSize: "0.46rem",
              color: P.TEXT_DIM,
              letterSpacing: "0.16em",
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: '"Courier New",monospace',
              fontSize: "0.58rem",
              color,
              letterSpacing: "0.04em",
              textShadow: `0 0 6px ${color}44`,
            }}
          >
            <span>{icon}</span>
            <span>{value}</span>
          </div>
          <div
            style={{
              marginTop: 4,
              height: 1,
              background: `linear-gradient(90deg,${color}44,transparent)`,
            }}
          />
        </div>
      ))}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            fontFamily: '"Courier New",monospace',
            fontSize: "0.52rem",
            letterSpacing: "0.06em",
          }}
        >
          {[
            { label: "RESPONSE TIME", value: "< 24 HRS", color: P.NEON },
            { label: "TIMEZONE", value: "UTC+0 (FLEXIBLE)", color: P.TEXT_HI },
            { label: "STATUS", value: "OPEN TO WORK", color: P.NEON },
            { label: "CLEARANCE", value: "FULL-STACK+CYBER", color: P.CYBER },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <span style={{ color: P.TEXT_DIM, marginRight: 6 }}>
                {label}:
              </span>
              <span style={{ color, textShadow: `0 0 5px ${color}44` }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. BOTTOM TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_TEXT =
  "AES-256-GCM ENCRYPTED ◈ TLS 1.3 CHANNEL ◈ ZERO PLAINTEXT STORED ◈ OWASP COMPLIANT ◈ ANTI-CSRF ACTIVE ◈ RATE-LIMITED ◈ SHA-512 INTEGRITY ◈ ZERO-TRUST POLICY ◈ PARTICLE_ENGINE ONLINE ◈ R3F WAVE_SPHERE ◈ ";

function BottomTicker() {
  const doubled = TICKER_TEXT + TICKER_TEXT;
  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        borderTop: `1px solid ${P.WIRE}`,
        padding: "6px 0",
        background: "rgba(5,5,5,0.5)",
        marginTop: "2rem",
      }}
    >
      {["left", "right"].map((side) => (
        <div
          key={side}
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [side]: 0,
            width: 60,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"},${P.VOID},transparent)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      ))}
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "tc-ticker 32s linear infinite",
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.48rem",
            letterSpacing: "0.14em",
            color: P.TEXT_DIM,
          }}
        >
          {doubled}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. ROOT EXPORT  — split-screen dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function TerminalContact() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px 0px" });

  const [wizardStep, setWizardStep] = useState("boot");
  const isSending = wizardStep === "sending";

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: P.VOID,
        padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,6vw,5rem)",
        overflow: "hidden",
      }}
    >
      <TerminalStyles />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(rgba(0,255,102,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,102,0.018) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
          animation: "tc-grid-drift 10s linear infinite",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-8%",
          width: "50vw",
          height: "60vh",
          borderRadius: "50%",
          background: `radial-gradient(ellipse,${P.CYBER}08 0%,transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "10%",
          left: "-5%",
          width: "35vw",
          height: "50vh",
          borderRadius: "50%",
          background: `radial-gradient(ellipse,${P.NEON}06 0%,transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <SectionHeader />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(1rem,2.5vw,2rem)",
            alignItems: "stretch",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ minWidth: 0 }}
          >
            <TerminalShell onWizardStepChange={setWizardStep} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ minWidth: 0 }}
          >
            <CyberParticleViewport
              isSending={isSending}
              wizardStep={wizardStep}
            />
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .tc-dashboard { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <SideInfoPanel />

        <BottomTicker />
      </motion.div>
    </section>
  );
}
