import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  memo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Sparkles, Trail } from "@react-three/drei";
import { motion, AnimatePresence, useInView } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const P = {
  NEON: "#00ff66",
  NEON_V: 0x00ff66,
  NEON_DIM: "#00cc55",
  CYBER: "#9d00ff",
  CYBER_V: 0x9d00ff,
  CYBER_DIM: "#6600bb",
  VOID: "#050505",
  GHOST: "#0d0d0d",
  WIRE: "#1a1a1a",
  WARN: "#ff3366",
  WARN_V: 0xff3366,
  AMBER: "#ffaa00",
  AMBER_V: 0xffaa00,
  ICE: "#00ccff",
  ICE_V: 0x00ccff,
  TEXT_DIM: "#3a3a3a",
  TEXT_MID: "#555",
  WHITE: "#ffffff",
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-SCOPE GEOMETRY CONSTANTS  (never re-instantiated)
// ─────────────────────────────────────────────────────────────────────────────
const NODE_GEOMETRY = new THREE.IcosahedronGeometry(0.18, 1);
const RING_GEO_OUTER = new THREE.TorusGeometry(4.2, 0.008, 4, 120);
const RING_GEO_INNER = new THREE.TorusGeometry(2.6, 0.006, 4, 90);
const RING_GEO_MID = new THREE.TorusGeometry(3.4, 0.005, 4, 100);
const STAR_GEO = new THREE.SphereGeometry(0.012, 4, 4);

// ─────────────────────────────────────────────────────────────────────────────
// TOOL NODE DATA
// Two orbital shells:
//   CYBER group  — inner ring  radius ~2.6, tilted ±25°
//   FULLSTACK    — outer ring  radius ~4.2, counter-rotation
//   CENTER       — origin node (the portfolio "core")
// ─────────────────────────────────────────────────────────────────────────────
const NODES = [
  // ── CENTRE ──────────────────────────────────────────────────────────────
  {
    id: "core",
    label: "CORE",
    group: "core",
    color: P.NEON_V,
    glowColor: P.NEON,
    position: [0, 0, 0],
    scale: 2.1,
    hud: {
      title: "PORTFOLIO CORE",
      subtitle: "FULL-STACK × CYBER",
      tags: ["REACT 19", "NODE 22", "ZERO-TRUST"],
      lines: [
        "// SYSTEM ARCHITECT",
        "// THREAT MODELLER",
        "// EXPLOIT DEVELOPER",
        "STATUS :: FULLY OPERATIONAL",
      ],
      score: "∞",
      scoreLabel: "SKILL INDEX",
    },
  },

  // ── CYBERSECURITY GROUP — inner shell ───────────────────────────────────
  {
    id: "burpsuite",
    label: "BURP SUITE",
    group: "cyber",
    color: P.WARN_V,
    glowColor: P.WARN,
    position: [2.5, 0.6, 0.4],
    scale: 1.0,
    hud: {
      title: "BURP SUITE PRO",
      subtitle: "WEB APP PENTEST PLATFORM",
      tags: ["INTERCEPTING PROXY", "ACTIVE SCANNER", "INTRUDER"],
      lines: [
        "// HTTP INTERCEPT & REPLAY",
        "// AUTH BYPASS EXPLOITATION",
        "// IDOR & PRIVILEGE ESCALATION",
        "// CUSTOM EXTENSION (BApp STORE)",
        "PROFICIENCY :: EXPERT 97%",
      ],
      score: "97",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "wireshark",
    label: "WIRESHARK",
    group: "cyber",
    color: P.ICE_V,
    glowColor: P.ICE,
    position: [0.8, 2.4, 1.0],
    scale: 1.0,
    hud: {
      title: "WIRESHARK 4.x",
      subtitle: "DEEP PACKET INSPECTION ENGINE",
      tags: ["PACKET SNIFFING", "PROTOCOL ANALYSIS", "TLS DECRYPTION"],
      lines: [
        "// LIVE TRAFFIC CAPTURE + FILTER",
        "// DEEP PROTOCOL DISSECTION",
        "// COMPROMISED SESSION RECOVERY",
        "// DISPLAY FILTER SCRIPTING",
        "PROFICIENCY :: EXPERT 94%",
      ],
      score: "94",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "nmap",
    label: "NMAP",
    group: "cyber",
    color: P.AMBER_V,
    glowColor: P.AMBER,
    position: [-2.1, 1.0, -1.0],
    scale: 1.0,
    hud: {
      title: "NMAP 7.9x",
      subtitle: "NETWORK RECONNAISSANCE ENGINE",
      tags: ["PORT SCANNING", "OS DETECTION", "NSE SCRIPTS"],
      lines: [
        "// SYN STEALTH SCAN (-sS)",
        "// SERVICE VERSION DETECTION",
        "// NSE VULN SCRIPT EXECUTION",
        "// FIREWALL EVASION TECHNIQUES",
        "PROFICIENCY :: ADVANCED 91%",
      ],
      score: "91",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "metasploit",
    label: "METASPLOIT",
    group: "cyber",
    color: P.WARN_V,
    glowColor: P.WARN,
    position: [-1.0, -2.3, 0.8],
    scale: 1.0,
    hud: {
      title: "METASPLOIT FRAMEWORK 6",
      subtitle: "EXPLOIT DEVELOPMENT PLATFORM",
      tags: ["EXPLOIT DB", "METERPRETER", "POST MODULES"],
      lines: [
        "// EXPLOIT MODULE SELECTION",
        "// PAYLOAD GENERATION & STAGING",
        "// METERPRETER SESSION MGMT",
        "// CUSTOM MODULE DEVELOPMENT",
        "PROFICIENCY :: ADVANCED 88%",
      ],
      score: "88",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "owaspzap",
    label: "OWASP ZAP",
    group: "cyber",
    color: P.CYBER_V,
    glowColor: P.CYBER,
    position: [1.2, -1.8, -2.0],
    scale: 1.0,
    hud: {
      title: "OWASP ZAP 2.14",
      subtitle: "AUTOMATED DAST SCANNER",
      tags: ["DAST", "SPIDER", "AJAX SCAN"],
      lines: [
        "// AUTOMATED ACTIVE SCANNING",
        "// OWASP TOP 10 COVERAGE",
        "// CI/CD PIPELINE INTEGRATION",
        "// CUSTOM SCAN POLICY CONFIG",
        "PROFICIENCY :: EXPERT 93%",
      ],
      score: "93",
      scoreLabel: "PROFICIENCY",
    },
  },

  // ── FULL-STACK GROUP — outer shell ───────────────────────────────────────
  {
    id: "react",
    label: "REACT 19",
    group: "fullstack",
    color: 0x00d8ff,
    glowColor: "#00d8ff",
    position: [3.8, 1.2, 1.5],
    scale: 1.0,
    hud: {
      title: "REACT 19",
      subtitle: "UI COMPONENT ARCHITECTURE",
      tags: ["RSC", "XSS-MITIGATION", "ACTIONS API"], // Replaced CONCURRENT with XSS-MITIGATION
      lines: [
        "// SERVER COMPONENTS (RSC)",
        "// SANITIZED COMPONENT RENDERING ARCHITECTURE",
        "// REACT 19 ACTIONS + TRANSITIONS",
        "// MERN ARCHITECTURE MASTERY",
        "// R3F / THREE.JS INTEGRATION",
        "PROFICIENCY :: EXPERT 98%",
      ],
      score: "98",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "nodejs",
    label: "NODE.JS",
    group: "fullstack",
    color: 0x68a063,
    glowColor: "#68a063",
    position: [-3.5, 0.5, 2.2],
    scale: 1.0,
    hud: {
      title: "NODE.JS 22 LTS",
      subtitle: "ASYNC SERVER RUNTIME",
      tags: ["EXPRESS", "FASTIFY", "STREAMS"],
      lines: [
        "// EVENT LOOP OPTIMISATION & DOS DEFENSE",
        "// SECURE MIDDLEWARE & CORS GATEWAYS",
        "// WORKER THREADS & CRYPTO MODULES",
        "// MICROSERVICES AUTHENTICATION BARRIER",
        "PROFICIENCY :: EXPERT 96%",
      ],
      score: "96",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "nextjs",
    label: "NEXT.JS",
    group: "fullstack",
    color: 0xffffff,
    glowColor: "#aaaaaa",
    position: [1.5, -3.8, -1.8],
    scale: 1.0,
    hud: {
      title: "NEXT.JS 15 (APP ROUTER)",
      subtitle: "FULL-STACK REACT FRAMEWORK",
      tags: ["APP ROUTER", "ISR", "EDGE RUNTIME"],
      lines: [
        "// APP ROUTER + SERVER ACTIONS",
        "// INCREMENTAL STATIC REGEN",
        "// EDGE RUNTIME DEPLOYMENT",
        "// TURBOPACK BUILD PIPELINE",
        "PROFICIENCY :: ADVANCED 92%",
      ],
      score: "92",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "mongodb",
    label: "MONGODB",
    group: "fullstack",
    color: 0x00ed64,
    glowColor: "#00ed64",
    position: [-2.2, -3.2, 1.0],
    scale: 1.0,
    hud: {
      title: "MONGODB ATLAS",
      subtitle: "DOCUMENT DATABASE ENGINE",
      tags: ["AGGREGATION", "ATLAS SEARCH", "CHANGE STREAMS"],
      lines: [
        "// AGGREGATION PIPELINE DESIGN",
        "// SCHEMA ENCRYPTION AT REST",
        "// ATLAS VECTOR SEARCH",
        "// CHANGE STREAM REAL-TIME SYNC",
        "PROFICIENCY :: EXPERT 95%",
      ],
      score: "95",
      scoreLabel: "PROFICIENCY",
    },
  },
  // ── ADDITIONAL FULL-STACK SECURE NODES ──────────────────────────────────
  {
    id: "typescript",
    label: "TS / JS",
    group: "fullstack",
    color: 0x3178c6,
    glowColor: "#3178c6",
    position: [-1.5, 3.8, -1.5], // Orbit shell 4.2 compliant
    scale: 1.0,
    hud: {
      title: "TYPESCRIPT / ES6+",
      subtitle: "STRICT RUNTIME ARCHITECTURE",
      tags: ["TYPE SAFETY", "ASYNC/AWAIT", "MEMORY MGMT"],
      lines: [
        "// COMPILE-TIME TYPE ENFORCEMENT",
        "// SECURE DOM MANIPULATION OPERATIONS",
        "// STRICT NULL POINTER CHECKING",
        "// MEMORY LEAK ANALYSIS & OPTIMISATION",
        "PROFICIENCY :: EXPERT 94%",
      ],
      score: "94",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "tailwind",
    label: "TAILWIND 4",
    group: "fullstack",
    color: 0x38bdf8,
    glowColor: "#38bdf8",
    position: [3.0, -2.5, 2.0], // Orbit shell 4.2 compliant
    scale: 1.0,
    hud: {
      title: "TAILWIND CSS v4",
      subtitle: "OPTIMIZED DESIGN ENGINE",
      tags: ["UTILITY-FIRST", "JIT COMPILER", "RESPONSIVE UI"],
      lines: [
        "// ZERO-RUNTIME STYLE INJECTION",
        "// CONTENT SECURITY POLICY (CSP) COMPLIANT",
        "// FLUID MOBILE-FIRST BREAKPOINTS",
        "// CUSTOM DESIGN SYSTEM HARDENING",
        "PROFICIENCY :: EXPERT 96%",
      ],
      score: "96",
      scoreLabel: "PROFICIENCY",
    },
  },
  {
    id: "sql",
    label: "SQL / POSTGRES",
    group: "fullstack",
    color: 0x336791,
    glowColor: "#336791",
    position: [2.5, 2.5, -2.5], // Orbit shell 4.2 compliant
    scale: 1.0,
    hud: {
      title: "SQL / RELATIONAL DB",
      subtitle: "STRUCTURED DATA MANAGEMENT",
      tags: ["POSTGRESQL", "ACID", "INDEXING"],
      lines: [
        "// PARAMETERIZED QUERY ENFORCEMENT",
        "// PREVENTION OF INJECTION ATTACKS",
        "// COMPLEX JOIN OPTIMISATION",
        "// ROLE-BASED ACCESS CONTROL (RBAC)",
        "PROFICIENCY :: ADVANCED 86%",
      ],
      score: "86",
      scoreLabel: "PROFICIENCY",
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDGE PAIRS  (indices into NODES array)
// ─────────────────────────────────────────────────────────────────────────────
const EDGES = [
  // core → each node (Updated to link all 12 operational sub-nodes)
  [0, 1], // core → burpsuite
  [0, 2], // core → wireshark
  [0, 3], // core → nmap
  [0, 4], // core → metasploit
  [0, 5], // core → owaspzap
  [0, 6], // core → react
  [0, 7], // core → nodejs
  [0, 8], // core → nextjs
  [0, 9], // core → mongodb
  [0, 10], // core → typescript (NEW)
  [0, 11], // core → tailwind   (NEW)
  [0, 12], // core → sql        (NEW)

  // cyber ring cross-links (Internal defensive perimeter cluster)
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 1],

  // fullstack ring cross-links (Expanded to complete the loop with new assets)
  [6, 7], // React → Node
  [7, 8], // Node → Next
  [8, 9], // Next → Mongo
  [9, 10], // Mongo → TypeScript (NEW Connection)
  [10, 11], // TypeScript → Tailwind (NEW Connection)
  [11, 12], // Tailwind → SQL (NEW Connection)
  [12, 6], // SQL → React loops back to close the full-stack ring

  // cross-group strategic links (DevSecOps cross-compilation vectors)
  [1, 6], // Burp → React (Client-side DOM vulnerability verification)
  [2, 7], // Wireshark → Node (Runtime backend transaction analysis)
  [3, 9], // Nmap → MongoDB (Database port surface scanning)
  [5, 8], // OWASP ZAP → Next.js (Automated DAST build scanning)
  [12, 4], // SQL → Metasploit (Relational database injection profiling)
];
// ─────────────────────────────────────────────────────────────────────────────
// SCOPED KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────
function ArsenalStyles() {
  return (
    <style>{`
      @keyframes ar-hud-in {
        from { opacity:0; transform: translateY(-6px) scale(0.94); filter:blur(3px); }
        to   { opacity:1; transform: translateY(0)    scale(1);    filter:blur(0); }
      }
      @keyframes ar-scanline {
        0%   { top: -4%; }
        100% { top: 104%; }
      }
      @keyframes ar-pulse-border {
        0%,100% { box-shadow: 0 0 0 1px var(--hud-color,#00ff66), 0 0 10px var(--hud-color,#00ff66)33; }
        50%     { box-shadow: 0 0 0 1px var(--hud-color,#00ff66), 0 0 22px var(--hud-color,#00ff66)66; }
      }
      @keyframes ar-bar-fill {
        from { width: 0%; }
        to   { width: var(--bar-w, 90%); }
      }
      @keyframes ar-ticker {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes ar-neon-flicker {
        0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
        20%,24%,55% { opacity:0.3; }
      }
      @keyframes ar-grid-drift {
        from { background-position: 0 0; }
        to   { background-position: 40px 40px; }
      }
      @keyframes ar-section-in {
        from { opacity:0; transform: translateY(30px); }
        to   { opacity:1; transform: translateY(0); }
      }
      @keyframes ar-score-count {
        from { letter-spacing: 0.5em; opacity:0; }
        to   { letter-spacing: 0.08em; opacity:1; }
      }

      .ar-hud          { animation: ar-hud-in 0.28s cubic-bezier(0.16,1,0.3,1) both; }
      .ar-pulse-border { animation: ar-pulse-border 2.4s ease-in-out infinite; }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD PANEL  (rendered via <Html> inside the canvas)
// ─────────────────────────────────────────────────────────────────────────────
const HudPanel = memo(function HudPanel({ node, onClose }) {
  const isCyber = node.group === "cyber";
  const accentCss = node.glowColor;

  return (
    <div
      className="ar-hud"
      style={{
        "--hud-color": accentCss,
        width: 230,
        background: "rgba(5,5,5,0.96)",
        border: `1px solid ${accentCss}55`,
        padding: 0,
        fontFamily: '"Courier New", monospace',
        pointerEvents: "all",
        contain: "strict", // compositor hint
        willChange: "transform",
      }}
    >
      {/* ── TOP TAPE ─────────────────────────────────── */}
      <div
        style={{
          background: `repeating-linear-gradient(
          -45deg,
          ${accentCss}18 0,${accentCss}18 5px,
          transparent 5px,transparent 10px
        )`,
          borderBottom: `1px solid ${accentCss}44`,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.48rem",
            color: accentCss,
            letterSpacing: "0.18em",
          }}
        >
          {isCyber ? "[ CYBER-TOOL ]" : "[ TECH-STACK ]"}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `1px solid ${accentCss}44`,
            cursor: "pointer",
            color: accentCss,
            fontSize: "0.45rem",
            padding: "1px 5px",
            fontFamily: "inherit",
            letterSpacing: "0.1em",
          }}
        >
          ✕
        </button>
      </div>

      {/* ── HEADER ───────────────────────────────────── */}
      <div
        style={{ padding: "8px 10px 6px", borderBottom: `1px solid #1a1a1a` }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          {node.hud.title}
        </div>
        <div
          style={{
            fontSize: "0.52rem",
            color: "#444",
            letterSpacing: "0.1em",
            marginTop: 3,
          }}
        >
          {node.hud.subtitle}
        </div>
        {/* Tags */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}
        >
          {node.hud.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.44rem",
                letterSpacing: "0.1em",
                padding: "1px 5px",
                border: `1px solid ${accentCss}55`,
                color: accentCss,
                background: `${accentCss}0d`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── TELEMETRY LINES ──────────────────────────── */}
      <div style={{ padding: "7px 10px", borderBottom: "1px solid #1a1a1a" }}>
        {/* Scan line sweep */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg,transparent,${accentCss}88,transparent)`,
              animation: "ar-scanline 2s linear infinite",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          {node.hud.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.54rem",
                lineHeight: 1.75,
                letterSpacing: "0.03em",
                color:
                  line.startsWith("STATUS") || line.startsWith("PROFICIENCY")
                    ? accentCss
                    : "#404040",
                textShadow:
                  line.startsWith("STATUS") || line.startsWith("PROFICIENCY")
                    ? `0 0 6px ${accentCss}88`
                    : "none",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* ── SCORE BAR ────────────────────────────────── */}
      {node.hud.score !== "∞" && (
        <div style={{ padding: "7px 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.48rem",
              color: "#333",
              letterSpacing: "0.12em",
              marginBottom: 5,
            }}
          >
            <span>{node.hud.scoreLabel}</span>
            <span
              style={{
                color: accentCss,
                textShadow: `0 0 8px ${accentCss}`,
                animation: "ar-score-count 0.6s ease both",
              }}
            >
              {node.hud.score}%
            </span>
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
              style={{
                height: "100%",
                "--bar-w": `${node.hud.score}%`,
                width: `${node.hud.score}%`,
                background: `linear-gradient(90deg,${accentCss},${accentCss}88)`,
                boxShadow: `0 0 6px ${accentCss}`,
                animation: "ar-bar-fill 0.9s cubic-bezier(0.16,1,0.3,1) both",
              }}
            />
          </div>
        </div>
      )}

      {/* ── HEX corners ──────────────────────────────── */}
      {[
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: 10,
            height: 10,
            borderTop: `1.5px solid ${accentCss}`,
            borderLeft: `1.5px solid ${accentCss}`,
          },
        },
        {
          style: {
            position: "absolute",
            top: 0,
            right: 0,
            width: 10,
            height: 10,
            borderTop: `1.5px solid ${accentCss}`,
            borderRight: `1.5px solid ${accentCss}`,
          },
        },
        {
          style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 10,
            height: 10,
            borderBottom: `1.5px solid ${accentCss}44`,
            borderLeft: `1.5px solid ${accentCss}44`,
          },
        },
        {
          style: {
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderBottom: `1.5px solid ${accentCss}44`,
            borderRight: `1.5px solid ${accentCss}44`,
          },
        },
      ].map((c, i) => (
        <div key={i} aria-hidden style={c.style} />
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EDGE LINES  — glowing connections between nodes
//   Each edge pulses its opacity independently via useFrame mutation
// ─────────────────────────────────────────────────────────────────────────────
function EdgeLines({ hoveredId, focusedId }) {
  // Build point pairs once
  const edgeData = useMemo(
    () =>
      EDGES.map(([ai, bi]) => {
        const a = NODES[ai].position;
        const b = NODES[bi].position;
        const isCyberEdge =
          NODES[ai].group !== "fullstack" && NODES[bi].group !== "fullstack";
        const isStackEdge =
          NODES[ai].group === "fullstack" && NODES[bi].group === "fullstack";
        const isCrossEdge = !isCyberEdge && !isStackEdge;
        const isCoreEdge =
          NODES[ai].group === "core" || NODES[bi].group === "core";

        let baseColor = P.NEON;
        if (isStackEdge) baseColor = "#00d8ff";
        if (isCrossEdge) baseColor = P.CYBER;
        if (isCoreEdge) baseColor = NODES[ai].glowColor || NODES[bi].glowColor;

        // Involves hovered/focused node?
        const involvedA =
          NODES[ai].id === hoveredId || NODES[ai].id === focusedId;
        const involvedB =
          NODES[bi].id === hoveredId || NODES[bi].id === focusedId;
        const active = involvedA || involvedB;

        return {
          points: [new THREE.Vector3(...a), new THREE.Vector3(...b)],
          color: baseColor,
          active,
          phase: Math.random() * Math.PI * 2,
        };
      }),
    [hoveredId, focusedId],
  ); // recompute only when hover/focus changes

  // Each line gets a ref for direct opacity mutation
  const lineRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    edgeData.forEach((edge, i) => {
      const lRef = lineRefs.current[i];
      if (!lRef) return;
      // Pulse dim edges, keep active edges bright
      const base = edge.active ? 0.7 : 0.12;
      const amp = edge.active ? 0.25 : 0.06;
      const opacity = base + Math.sin(t * 1.6 + edge.phase) * amp;
      // Line component exposes material via its internal mesh
      if (lRef.material) {
        lRef.material.opacity = opacity;
      }
    });
  });

  return (
    <>
      {edgeData.map((edge, i) => (
        <Line
          key={i}
          ref={(el) => (lineRefs.current[i] = el)}
          points={edge.points}
          color={edge.color}
          lineWidth={edge.active ? 1.2 : 0.5}
          transparent
          opacity={edge.active ? 0.7 : 0.12}
          depthWrite={false}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL NODE MESH
// ─────────────────────────────────────────────────────────────────────────────
function ToolNode({ node, isHovered, isFocused, onHover, onUnhover, onFocus }) {
  const meshRef = useRef(null);
  const outerRef = useRef(null); // wireframe shell
  const lightRef = useRef(null);
  const t = useRef(Math.random() * Math.PI * 2); // phase offset

  // Animate emissive + scale + outer ring via ref mutations only
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta;

    const mat = meshRef.current.material;
    const active = isHovered || isFocused;

    // Emissive intensity lerp
    const targetIntensity = active ? 2.2 : node.group === "core" ? 1.0 : 0.4;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      targetIntensity + Math.sin(t.current * 1.8) * (active ? 0.4 : 0.12),
      delta * 5,
    );

    // Scale lerp
    const targetScale = active
      ? node.scale * 1.35
      : node.scale * (1 + Math.sin(t.current * 0.9) * 0.04);
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 5),
    );

    // Outer wireframe shell
    if (outerRef.current) {
      outerRef.current.material.opacity = THREE.MathUtils.lerp(
        outerRef.current.material.opacity,
        active ? 0.55 : 0.0,
        delta * 7,
      );
      outerRef.current.rotation.x += delta * 0.4;
      outerRef.current.rotation.z += delta * 0.25;
    }

    // Slow idle rotation on core
    if (node.group === "core") {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.15;
    } else {
      meshRef.current.rotation.y += delta * (active ? 1.2 : 0.4);
      meshRef.current.rotation.x += delta * (active ? 0.6 : 0.2);
    }

    // Point light intensity
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        active ? 3.5 : 0.6,
        delta * 6,
      );
    }
  });

  const pos = new THREE.Vector3(...node.position);

  return (
    <group position={pos}>
      {/* Inner solid node */}
      <mesh
        ref={meshRef}
        geometry={NODE_GEOMETRY}
        scale={[node.scale, node.scale, node.scale]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = "crosshair";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFocus(isFocused ? null : node.id);
        }}
        castShadow
      >
        <meshStandardMaterial
          color={node.color}
          emissive={new THREE.Color(node.color)}
          emissiveIntensity={node.group === "core" ? 1.0 : 0.4}
          roughness={0.05}
          metalness={0.9}
          transparent={false}
        />
      </mesh>

      {/* Wireframe expansion shell — appears on hover/focus */}
      <mesh
        ref={outerRef}
        geometry={NODE_GEOMETRY}
        scale={[node.scale * 2.2, node.scale * 2.2, node.scale * 2.2]}
        renderOrder={1}
      >
        <meshBasicMaterial
          color={node.color}
          wireframe
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Per-node point light */}
      <pointLight
        ref={lightRef}
        color={node.color}
        intensity={0.6}
        distance={node.group === "core" ? 3.5 : 1.8}
        decay={2}
      />

      {/* HUD panel via Drei Html */}
      {(isHovered || isFocused) && (
        <Html
          distanceFactor={8}
          position={[0.28, 0.28, 0]}
          style={{ pointerEvents: isFocused ? "all" : "none" }}
          zIndexRange={[100, 200]}
          occlude={false}
        >
          <HudPanel node={node} onClose={() => onFocus(null)} />
        </Html>
      )}

      {/* Label below node (always visible, small) */}
      <Html
        distanceFactor={10}
        position={[0, -(node.scale * 0.26 + 0.18), 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "0.44rem",
            letterSpacing: "0.14em",
            color: isHovered || isFocused ? node.glowColor : "#2a2a2a",
            textShadow:
              isHovered || isFocused ? `0 0 8px ${node.glowColor}` : "none",
            whiteSpace: "nowrap",
            userSelect: "none",
            transition: "color 0.25s, text-shadow 0.25s",
          }}
        >
          {node.label}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA CONTROLLER
//   Smoothly lerps toward focusedNode position + offset.
//   Locks OrbitControls during travel, re-enables on arrival.
// ─────────────────────────────────────────────────────────────────────────────
function CameraController({ focusedNodeId, orbitRef }) {
  const { camera } = useThree();

  // Target position (camera sits offset from the node)
  const targetPos = useRef(new THREE.Vector3(0, 0, 11));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const traveling = useRef(false);

  useEffect(() => {
    if (!focusedNodeId) {
      // Return home
      targetPos.current.set(0, 0, 11);
      targetLook.current.set(0, 0, 0);
      traveling.current = true;
    } else {
      const node = NODES.find((n) => n.id === focusedNodeId);
      if (!node) return;
      const p = new THREE.Vector3(...node.position);
      // Sit 1.8 units away from the node in the Z direction (relative)
      const dir = p.clone().normalize();
      targetPos.current.copy(p).add(dir.multiplyScalar(1.8));
      targetLook.current.copy(new THREE.Vector3(...node.position));
      traveling.current = true;
    }
    // Disable orbit while traveling
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [focusedNodeId, orbitRef]);

  useFrame((_, delta) => {
    if (!traveling.current) return;

    const lerpSpeed = delta * 3.5;

    camera.position.lerp(targetPos.current, lerpSpeed);
    // Lerp lookAt via a temp vector3
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desiredLook = targetLook.current
      .clone()
      .sub(camera.position)
      .normalize();
    currentLook.lerp(desiredLook, lerpSpeed);

    const distSq = camera.position.distanceToSquared(targetPos.current);
    if (distSq < 0.001) {
      camera.position.copy(targetPos.current);
      traveling.current = false;
      // Re-enable orbit once arrived
      if (orbitRef.current) {
        orbitRef.current.target.copy(targetLook.current);
        orbitRef.current.enabled = true;
      }
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT RINGS  — decorative torus rings give depth reference
// ─────────────────────────────────────────────────────────────────────────────
function OrbitRings() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const midRef = useRef(null);

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.04;
      outerRef.current.rotation.z += delta * 0.02;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.06;
      innerRef.current.rotation.y += delta * 0.03;
    }
    if (midRef.current) {
      midRef.current.rotation.z += delta * 0.05;
      midRef.current.rotation.x -= delta * 0.02;
    }
  });

  return (
    <>
      <mesh
        ref={outerRef}
        geometry={RING_GEO_OUTER}
        rotation={[Math.PI / 2.8, 0.3, 0]}
      >
        <meshBasicMaterial
          color={P.NEON_V}
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={innerRef}
        geometry={RING_GEO_INNER}
        rotation={[Math.PI / 3.2, 0.8, 0.4]}
      >
        <meshBasicMaterial
          color={P.CYBER_V}
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={midRef}
        geometry={RING_GEO_MID}
        rotation={[Math.PI / 2.2, 0.5, 0.2]}
      >
        <meshBasicMaterial
          color={P.ICE_V}
          transparent
          opacity={0.04}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR FIELD — 600 tiny random spheres
// ─────────────────────────────────────────────────────────────────────────────
function StarField() {
  const groupRef = useRef(null);

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 600; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 14 + Math.random() * 10;
      arr.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.006;
    }
  });

  return (
    <group ref={groupRef}>
      {stars.map((pos, i) => (
        <mesh key={i} geometry={STAR_GEO} position={pos}>
          <meshBasicMaterial
            color={i % 3 === 0 ? P.NEON_V : i % 3 === 1 ? P.CYBER_V : 0xffffff}
            transparent
            opacity={0.25 + Math.random() * 0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTELLATION WEB  — composes all nodes + edges
// ─────────────────────────────────────────────────────────────────────────────
function ConstellationWeb({
  hoveredId,
  focusedId,
  onHover,
  onUnhover,
  onFocus,
}) {
  // Slow global constellation rotation (ref-driven, no state)
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Pause rotation if a node is focused (camera is close)
    if (!focusedId) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <EdgeLines hoveredId={hoveredId} focusedId={focusedId} />

      {NODES.map((node) => (
        <ToolNode
          key={node.id}
          node={node}
          isHovered={hoveredId === node.id}
          isFocused={focusedId === node.id}
          onHover={onHover}
          onUnhover={onUnhover}
          onFocus={onFocus}
        />
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE LIGHTS
// ─────────────────────────────────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.05} />
      {/* Neon fill from front-left */}
      <pointLight
        position={[-5, 4, 5]}
        color={P.NEON_V}
        intensity={1.4}
        distance={20}
        decay={2}
      />
      {/* Cyber rim from back-right */}
      <pointLight
        position={[5, -3, -6]}
        color={P.CYBER_V}
        intensity={1.6}
        distance={20}
        decay={2}
      />
      {/* Warn pulse from bottom */}
      <pointLight
        position={[0, -6, 2]}
        color={P.WARN_V}
        intensity={0.6}
        distance={12}
        decay={2}
      />
      {/* Ice top */}
      <pointLight
        position={[0, 8, 0]}
        color={P.ICE_V}
        intensity={0.5}
        distance={14}
        decay={2}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER CANVAS SCENE  — owns all R3F state
// ─────────────────────────────────────────────────────────────────────────────
function InnerScene({ hoveredId, focusedId, onHover, onUnhover, onFocus }) {
  const orbitRef = useRef(null);

  return (
    <>
      <SceneLights />

      <Suspense fallback={null}>
        <StarField />
        <OrbitRings />
        <ConstellationWeb
          hoveredId={hoveredId}
          focusedId={focusedId}
          onHover={onHover}
          onUnhover={onUnhover}
          onFocus={onFocus}
        />
      </Suspense>

      <fog attach="fog" args={["#050505", 12, 30]} />

      {/* Camera controller must come before OrbitControls in tree */}
      <CameraController focusedNodeId={focusedId} orbitRef={orbitRef} />

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        minDistance={3}
        maxDistance={16}
        dampingFactor={0.05}
        enableDamping
        autoRotate={!focusedId}
        autoRotateSpeed={0.25}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER  (HTML layer)
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ focusedId }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  const focused = NODES.find((n) => n.id === focusedId);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "clamp(1.5rem, 4vh, 3rem)",
        left: "clamp(1.5rem, 4vw, 4rem)",
        zIndex: 20,
        pointerEvents: "none",
        maxWidth: 520,
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: "0.58rem",
          color: "#2a2a2a",
          letterSpacing: "0.14em",
          marginBottom: "0.65rem",
        }}
      >
        root@portfolio:~/arsenal#
        <span style={{ color: P.NEON, marginLeft: 8 }}>
          node system.js --audit-mesh --trace-tls constellation.local
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, skewX: "-3deg" }}
        animate={inView ? { opacity: 1, y: 0, skewX: "0deg" } : {}}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          style={{
            fontSize: "clamp(1.6rem, 4.5vw, 3rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
            fontFamily: '"Courier New", monospace',
            color: "#fff",
            margin: 0,
            textShadow: "0 0 40px rgba(255,255,255,0.05)",
          }}
        >
          HARDENED
          <br />
          <span style={{ color: P.NEON, textShadow: `0 0 20px ${P.NEON}66` }}>
            ARSENAL
          </span>
          <span style={{ color: P.CYBER, marginLeft: "0.3em" }}>▓</span>
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.55, duration: 0.4 }}
        style={{
          marginTop: "0.9rem",
          fontSize: "0.6rem",
          color: "#2f2f2f",
          fontFamily: '"Courier New", monospace',
          letterSpacing: "0.06em",
          lineHeight: 1.75,
          maxWidth: 360,
        }}
      >
        // {NODES.length - 1} NODES COMPREHENSIVELY COMPRESSED INTO TWO ORBITAL
        SHELLS
        <br />
        INTERACT WITH ANY INTERPOLATED ASSET TO FIELD-TEST SECURE TELEMETRY LOGS
      </motion.p>

      {/* Live node status strip */}
      <AnimatePresence mode="wait">
        {focused ? (
          <motion.div
            key={focused.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: '"Courier New",monospace',
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: focused.glowColor,
                boxShadow: `0 0 6px ${focused.glowColor}`,
                animation: "ar-neon-flicker 2s infinite",
              }}
            />
            <span style={{ color: focused.glowColor }}>TARGET_TRACE:</span>
            <span style={{ color: "#555" }}>{focused.hud.title}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: '"Courier New",monospace',
              fontSize: "0.55rem",
              color: "#2a2a2a",
              letterSpacing: "0.12em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: P.NEON,
                boxShadow: `0 0 6px ${P.NEON}`,
                animation: "ar-neon-flicker 3s infinite",
              }}
            />
            SECURE MESH ACTIVE — SECURING CONSTELLATION AIRSPACE
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGEND PANEL  (bottom-right overlay)
// ─────────────────────────────────────────────────────────────────────────────
function LegendPanel() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const groups = [
    { color: P.WARN, label: "CYBER TOOLS", count: 5 },
    { color: "#00d8ff", label: "FULL-STACK", count: 4 },
    { color: P.NEON, label: "CORE SYSTEM", count: 1 },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.8, duration: 0.45 }}
      style={{
        position: "absolute",
        bottom: "clamp(1.5rem,4vh,3rem)",
        right: "clamp(1.5rem,4vw,4rem)",
        zIndex: 20,
        pointerEvents: "none",
        fontFamily: '"Courier New",monospace',
      }}
    >
      <div
        style={{
          fontSize: "0.44rem",
          color: "#222",
          letterSpacing: "0.16em",
          marginBottom: 8,
          textAlign: "right",
        }}
      >
        ── NODE LEGEND ──
      </div>
      {groups.map((g) => (
        <div
          key={g.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "flex-end",
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: "0.5rem",
              color: "#333",
              letterSpacing: "0.1em",
            }}
          >
            {g.label} [{g.count}]
          </span>
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: 1,
              background: g.color,
              boxShadow: `0 0 5px ${g.color}`,
            }}
          />
        </div>
      ))}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #1a1a1a",
          fontSize: "0.44rem",
          color: "#1f1f1f",
          letterSpacing: "0.1em",
          textAlign: "right",
          lineHeight: 1.8,
        }}
      >
        DRAG TO ORBIT
        <br />
        SCROLL TO ZOOM
        <br />
        CLICK NODE TO FOCUS
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM DATA TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER =
  "BURP SUITE PRO ◈ WIRESHARK 4.x ◈ NMAP 7.9 ◈ METASPLOIT 6 ◈ OWASP ZAP 2.14 ◈ REACT 19 ◈ NODE.JS 22 ◈ NEXT.JS 15 ◈ MONGODB ATLAS ◈ DOCKER ◈ GITHUB ACTIONS ◈ AWS ◈ POSTGRESQL ◈ REDIS ◈ TYPESCRIPT ◈ GRAPHQL ◈ TAILWIND CSS v4 ◈ ";

function DataTicker() {
  const doubled = TICKER + TICKER;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        overflow: "hidden",
        borderTop: `1px solid ${P.WIRE}`,
        padding: "6px 0",
        background: "rgba(5,5,5,0.7)",
        backdropFilter: "blur(8px)",
        pointerEvents: "none",
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
            width: 80,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"},${P.VOID},transparent)`,
            zIndex: 1,
          }}
        />
      ))}
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "ar-ticker 32s linear infinite",
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.48rem",
            letterSpacing: "0.14em",
            color: "#222",
          }}
        >
          {doubled}
        </span>
        <span
          style={{
            fontFamily: '"Courier New",monospace',
            fontSize: "0.48rem",
            letterSpacing: "0.14em",
            color: P.NEON_DIM,
            opacity: 0.2,
          }}
        >
          {doubled}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET BUTTON  (visible when a node is focused)
// ─────────────────────────────────────────────────────────────────────────────
function ResetButton({ visible, onClick }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="reset"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          style={{
            position: "absolute",
            top: "clamp(1.5rem,4vh,3rem)",
            right: "clamp(1.5rem,4vw,4rem)",
            zIndex: 30,
            background: "transparent",
            border: `1px solid ${P.NEON}`,
            color: P.NEON,
            fontFamily: '"Courier New",monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.16em",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            boxShadow: `0 0 0 1px ${P.NEON}22, 0 0 20px ${P.NEON}0a`,
            transition: "box-shadow 0.25s ease, background 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${P.NEON}12`;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${P.NEON}, 0 0 24px ${P.NEON}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = `0 0 0 1px ${P.NEON}22, 0 0 20px ${P.NEON}0a`;
          }}
        >
          [ RESET_VIEW ]
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARSENAL ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Arsenal() {
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, {
    once: true,
    margin: "-80px 0px",
  });

  // Hover + focus state — declared in HTML layer, passed as props into canvas
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);

  const handleHover = useCallback((id) => setHoveredId(id), []);
  const handleUnhover = useCallback(() => setHoveredId(null), []);
  const handleFocus = useCallback((id) => setFocusedId(id), []);
  const handleReset = useCallback(() => {
    setFocusedId(null);
    setHoveredId(null);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 600,
        background: P.VOID,
        overflow: "hidden",
      }}
    >
      <ArsenalStyles />

      {/* ── Ambient grid bg ──────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(rgba(0,255,102,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,102,0.02) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
          animation: "ar-grid-drift 10s linear infinite",
        }}
      />

      {/* ── Purple depth aura ─────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "15%",
          right: "-5%",
          width: "45vw",
          height: "70vh",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${P.CYBER}09 0%, transparent 70%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── R3F Canvas  (full-section) ────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={sectionInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        style={{ position: "absolute", inset: 0, zIndex: 5 }}
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.85,
            alpha: true,
          }}
          camera={{ fov: 55, near: 0.1, far: 60, position: [0, 0, 11] }}
          style={{ background: "transparent" }}
          // Pass hover/focus state changes out of canvas via event handlers
          onCreated={({ gl }) => {
            gl.setClearColor(0x050505, 1);
          }}
        >
          <InnerScene
            hoveredId={hoveredId}
            focusedId={focusedId}
            onHover={handleHover}
            onUnhover={handleUnhover}
            onFocus={handleFocus}
          />
        </Canvas>
      </motion.div>

      {/* ── HTML overlay layers ───────────────────────── */}
      <SectionHeader focusedId={focusedId} />
      <LegendPanel />
      <ResetButton visible={!!focusedId} onClick={handleReset} />
      <DataTicker />
    </section>
  );
}
