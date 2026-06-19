import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// THEME CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  NEON: "#00ff66",
  NEON_DIM: "#00cc55",
  CYBER: "#9d00ff",
  CYBER_DIM: "#6600bb",
  VOID: "#050505",
  GHOST: "#0d0d0d",
  WIRE: "#1a1a1a",
  WARN: "#ff3366",
  WARN_DIM: "#cc1144",
  AMBER: "#ffaa00",
  TEXT_DIM: "#3a3a3a",
  TEXT_MID: "#555555",
  WHITE: "#ffffff",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCOPED KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────
function SectionStyles() {
  return (
    <style>{`
      /* ── Section glitch entrance ──────────────────────────── */
      @keyframes cp-breach-flash {
        0%          { opacity: 0; }
        8%          { opacity: 1; background: rgba(0,255,102,0.07); }
        10%         { background: transparent; }
        12%         { background: rgba(157,0,255,0.06); }
        14%         { background: transparent; }
        16%         { opacity: 1; }
        100%        { opacity: 1; }
      }

      /* ── Card-level glitch on scroll-in ──────────────────── */
      @keyframes cp-card-in {
        0%   { opacity: 0; transform: translateY(32px) skewY(1.5deg); filter: blur(3px); }
        30%  { opacity: 1; transform: translateY(-4px) skewY(-0.5deg); filter: blur(0); }
        50%  { transform: translateY(2px) skewY(0.3deg); }
        65%  { transform: translateY(-1px) skewY(0deg); }
        100% { transform: translateY(0) skewY(0deg); opacity: 1; }
      }

      /* ── Chromatic split on card reveal ─────────────────── */
      @keyframes cp-chroma-split {
        0%,100% { text-shadow: none; }
        20%     { text-shadow: -4px 0 #ff3366, 4px 0 #00ccff; }
        22%     { text-shadow: 2px 0 #ff3366, -2px 0 #00ccff; }
        24%     { text-shadow: none; }
      }

      /* ── Classification tape blink ───────────────────────── */
      @keyframes cp-tape-blink {
        0%,48%  { opacity: 1; }
        50%,98% { opacity: 0.7; }
        100%    { opacity: 1; }
      }

      /* ── Scan line sweep ─────────────────────────────────── */
      @keyframes cp-scanline {
        0%   { top: -2%; }
        100% { top: 102%; }
      }

      /* ── Terminal cursor blink ───────────────────────────── */
      @keyframes cp-cursor {
        0%,49%  { opacity: 1; }
        50%,100%{ opacity: 0; }
      }

      /* ── Integrity score count-up glow ──────────────────── */
      @keyframes cp-score-glow {
        0%,100% { text-shadow: 0 0 8px #00ff66, 0 0 20px #00ff66; }
        50%     { text-shadow: 0 0 16px #00ff66, 0 0 40px #00cc55, 0 0 60px #00ff6644; }
      }

      /* ── Ticker scroll ───────────────────────────────────── */
      @keyframes cp-ticker {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      /* ── Threat level pulse ──────────────────────────────── */
      @keyframes cp-threat-pulse {
        0%,100% { box-shadow: 0 0 0 1px currentColor, 0 0 6px currentColor; }
        50%     { box-shadow: 0 0 0 1px currentColor, 0 0 14px currentColor; }
      }

      /* ── Hex-corner draw ─────────────────────────────────── */
      @keyframes cp-corner-draw {
        from { stroke-dashoffset: 60; }
        to   { stroke-dashoffset: 0; }
      }

      /* ── Scan button hover ripple ────────────────────────── */
      @keyframes cp-ripple {
        from { transform: scale(0.8); opacity: 0.6; }
        to   { transform: scale(2.2); opacity: 0; }
      }

      /* ── Pass badge pop ──────────────────────────────────── */
      @keyframes cp-badge-pop {
        0%   { transform: scale(0.6); opacity: 0; }
        70%  { transform: scale(1.1); }
        100% { transform: scale(1);   opacity: 1; }
      }

      /* ── Grid drift ──────────────────────────────────────── */
      @keyframes cp-grid-drift {
        from { background-position: 0 0; }
        to   { background-position: 40px 40px; }
      }

      .cp-section-reveal { animation: cp-breach-flash 0.6s ease forwards; }
      .cp-card-glitch    { animation: cp-card-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      .cp-title-chroma   { animation: cp-chroma-split 5s ease-in-out infinite; }
      .cp-score-glow     { animation: cp-score-glow 1.6s ease-in-out infinite; }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROJECT DATA — full objects, no placeholders
// ─────────────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: "PROJ-0x02",
    classLevel: "PRODUCTION LAYER // TRANSACTIONAL FLEET ENGINE",
    codename: "SYSTEM CORE: GREENBUS",
    title: "GreenBus Online Transit Platform",
    subtitle: "High-Availability Fleet Management & Booking System",
    threatLevel: "TRANSACTIONAL ASSET",
    threatColor: T.CYBER,
    status: "LIVE // OPERATIONAL",
    statusColor: T.NEON,
    year: "2026",
    auditRef: "SEC-AUDIT-9921",
    description:
      "Enterprise-grade web architecture providing real-time scheduling, ticketing pipelines, and synchronized seat allocation mechanics. Engineered with strict concurrency controls to handle high-traffic booking volumes while enforcing encrypted data flow across third-party endpoints.",
    stack: {
      frontend: [
        "React 19",
        "Vite",
        "Tailwind CSS v4",
        "Lucide React",
        "Axios Engine",
      ],
      backend: [
        "Node.js",
        "Express Runtime",
        "Redis (Route Caching)",
        "REST API Layer",
      ],
      database: [
        "PostgreSQL (Transactional Ledger)",
        "MongoDB Atlas (System Analytics & Logs)",
      ],
      security: [
        "JWT Session Isolation",
        "Bcrypt String Hashing",
        "Helmet Content Security Policies",
        "CORS Strict Domain Whitelisting",
        "Express Rate Limiter",
      ],
      devops: [
        "Nginx Reverse Proxy",
        "Docker Containers",
        "PM2 Process Daemon",
        "Let's Encrypt SSL/TLS Lifecycle",
      ],
    },
    owaspFeatures: [
      {
        id: "A01",
        label: "Broken Access Control",
        fix: "Session-isolated middleware protecting sensitive passenger manifest parameters",
      },
      {
        id: "A03",
        label: "Injection",
        fix: "Parameterized SQL inputs and schema verification guards for route queries",
      },
      {
        id: "A04",
        label: "Insecure Design",
        fix: "Atomic transactions prevent race conditions during concurrent seat lockouts",
      },
      {
        id: "A06",
        label: "Vulnerable Components",
        fix: "Automated Dependabot patch auditing across Node package boundaries",
      },
      {
        id: "A07",
        label: "Auth & Session Failures",
        fix: "HTTP-Only cookies tracking user state to defend against XSS-token leakage",
      },
    ],
    links: {
      github: "https://github.com/Ahme-Byte/electro",
      live: "https://greenbus.online",
      report: "#",
    },
    scanLog: [
      {
        delay: 0,
        text: "> TARGET INITIALIZED: GREENBUS CORE ENGINE",
        color: T.CYBER,
      },
      {
        delay: 150,
        text: "> ESTABLISHING HANDSHAKE WITH HOSTNAME: greenbus.online...",
        color: T.TEXT_MID,
      },
      {
        delay: 320,
        text: "> [SSL/TLS STATUS] : VERIFIED -> DigiCert TLS v1.3 Secure Cipher Block",
        color: T.NEON,
      },
      {
        delay: 500,
        text: "> [DNS LOOKUP]     : CLOUDFLARE EDGE ROUTING DETECTED",
        color: T.CYBER,
      },
      {
        delay: 680,
        text: "> SCANNING TRANSACTION CHANNELS & PAYMENT GATEWAYS...",
        color: T.AMBER,
      },
      {
        delay: 850,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 1000,
        text: "> [XSS Vector Check]        → SANITIZED (DOM Hardened) ✓",
        color: T.NEON,
      },
      {
        delay: 1150,
        text: "> [SQLi Payload Injection]  → MITIGATED (ORMLayer Isolation) ✓",
        color: T.NEON,
      },
      {
        delay: 1300,
        text: "> [CSRF Token Validation]   → REINFORCED (Strict Domain CORS) ✓",
        color: T.NEON,
      },
      {
        delay: 1450,
        text: "> [Concurrency Lock Test]   → SUCCESS (0% Duplicate Allocation) ✓",
        color: T.NEON,
      },
      {
        delay: 1600,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 1800,
        text: "> CALIBRATING FLEET NETWORK LOGISTICS...",
        color: T.AMBER,
      },
      {
        delay: 2000,
        text: "> PROGRESS TELEMETRY: ████████████████████ 100%",
        color: T.NEON,
      },
      {
        delay: 2200,
        text: "> ╔══════════════════════════════════════════╗",
        color: T.NEON,
      },
      {
        delay: 2350,
        text: "> ║  PRODUCTION GATEWAY STATUS : OPERATIONAL ║",
        color: T.NEON,
      },
      {
        delay: 2500,
        text: "> ║  API RUNTIME LATENCY       : 42ms        ║",
        color: T.NEON,
      },
      {
        delay: 2650,
        text: "> ║  INTEGRITY CONFIRMATION    : SECURE ✓    ║",
        color: T.NEON,
      },
      {
        delay: 2800,
        text: "> ╚══════════════════════════════════════════╝",
        color: T.NEON,
      },
    ],
  },
  {
    id: "PROJ-0x02",
    classLevel: "PRODUCTION LAYER // SECURE MONOLITHIC SSR",
    codename: "SYSTEM CORE: STAYMESH", // Real-world marketplace identifier
    title: "Secure Distributed Rental & Property Engine",
    subtitle: "Express × EJS Hardened Marketplace Architecture",
    threatLevel: "USER DATA CRITICAL",
    threatColor: T.AMBER,
    status: "LIVE // FUNCTIONAL",
    statusColor: T.NEON,
    year: "2025",
    auditRef: "SEC-AUDIT-7732", // Hardened from raw CVE identifier
    description:
      "Full-stack marketplace architecture mirroring modern lodging platforms. Implements stateful server-side rendering via EJS-Mate layouts seamlessly bound to a hardened database layer. Enforces ironclad resource-level access controls guarding multi-tenant CRUD flows and user telemetry logs.",
    stack: {
      frontend: [
        "EJS (Embedded JavaScript)",
        "EJS-Mate (Dynamic Templates & Partial Layouts)",
        "Vanilla CSS",
        "Vanilla JS Form Validations",
      ],
      backend: [
        "Node.js Core Runtime",
        "Express.js Framework",
        "Passport.js (Identity Engine)",
        "Passport-Local Strategy",
        "Express-Session Orchestrator",
      ],
      database: [
        "MongoDB Atlas (Cloud Cluster)",
        "Mongoose ODM (Schema Isolation)",
        "Mongo-Store (Hardened Session Persistence)",
      ],
      security: [
        "Passport-Local-Mongoose Salting & Hashing",
        "Strict Resource-Level Authorization Guards",
        "Method-Override Data Sanitation",
        "Session Lifecycle Hardening",
        "NoSQL Injection Mitigation Filters",
      ],
      devops: [
        "Nginx Reverse Proxy Container",
        "PM2 Daemon Process Engine",
        "GitHub Actions Deployment Pipelines",
        "Environment Variables Enclosure",
      ],
    },
    owaspFeatures: [
      {
        id: "A01",
        label: "Broken Access Control",
        fix: "Custom authorization middleware verifying listing/review ownership before allowing PUT/DELETE mutations",
      },
      {
        id: "A03",
        label: "Injection",
        fix: "Strict Mongoose schema typing and cast-validation filters to neutralize deep object NoSQL injections",
      },
      {
        id: "A05",
        label: "Security Misconfiguration",
        fix: "Transitioned from vulnerable MemoryStore to production-hardened MongoStore for stateless-style session scaling",
      },
      {
        id: "A07",
        label: "Identification & Auth Failures",
        fix: "Automated iteration cryptography via passport-local-mongoose providing pbkdf2 salting and hash verification gates",
      },
    ],
    links: {
      github: "https://github.com/Ahme-Byte/Airbnb-basic.git",
      live: "https://airbnb-basic.onrender.com",
      report: "#",
    },
    scanLog: [
      {
        delay: 0,
        text: "> INITIALISING INTEGRITY ENGINE v4.2.1...",
        color: T.NEON,
      },
      {
        delay: 180,
        text: "> CONNECTING TO AUDIT ORACLE...",
        color: T.TEXT_MID,
      },
      {
        delay: 360,
        text: "> TARGET: IRONMARKET / MERN STACK + PAYMENT LAYER",
        color: T.AMBER,
      },
      {
        delay: 540,
        text: "> [SCANNING SOURCE CODE — 22,194 lines...]",
        color: T.TEXT_MID,
      },
      {
        delay: 720,
        text: "> [CHECKING AGAINST OWASP TOP 10 — 2021 EDITION]",
        color: T.CYBER,
      },
      {
        delay: 900,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 1080,
        text: "> [A01: Broken Access Control]       → SECURE ✓",
        color: T.NEON,
      },
      {
        delay: 1200,
        text: "> [A02: Cryptographic Failures]      → HARDENED ✓",
        color: T.NEON,
      },
      {
        delay: 1320,
        text: "> [A03: Injection Attack Vectors]    → SANITISED ✓",
        color: T.NEON,
      },
      {
        delay: 1440,
        text: "> [A04: Insecure Design Patterns]    → MITIGATED ✓",
        color: T.NEON,
      },
      {
        delay: 1560,
        text: "> [A05: Security Misconfiguration]   → LOCKED ✓",
        color: T.NEON,
      },
      {
        delay: 1680,
        text: "> [A06: Vulnerable Components]       → PATCHED ✓",
        color: T.NEON,
      },
      {
        delay: 1800,
        text: "> [A07: Auth & Session Failures]     → SECURED ✓",
        color: T.NEON,
      },
      {
        delay: 1920,
        text: "> [A08: Software Integrity Failures] → VERIFIED ✓",
        color: T.NEON,
      },
      {
        delay: 2040,
        text: "> [A09: Logging & Monitoring Gaps]   → ACTIVE ✓",
        color: T.NEON,
      },
      {
        delay: 2160,
        text: "> [A10: Server-Side Request Forgery] → BLOCKED ✓",
        color: T.NEON,
      },
      {
        delay: 2300,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 2480,
        text: "> [PAYMENT TOKENISATION AUDIT]       → CLEAN ✓",
        color: T.NEON,
      },
      {
        delay: 2620,
        text: "> [CSRF DOUBLE-SUBMIT CHECK]         → VALID ✓",
        color: T.NEON,
      },
      {
        delay: 2760,
        text: "> [MONGOOSE INJECTION FUZZ TEST]     → SAFE ✓",
        color: T.NEON,
      },
      {
        delay: 2900,
        text: "> [SNYK DEPENDENCY AUDIT]            → 0 CVEs ✓",
        color: T.NEON,
      },
      {
        delay: 3050,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      { delay: 3200, text: "> COMPILING REPORT...", color: T.AMBER },
      { delay: 3450, text: "> ██████████████████████████ 100%", color: T.NEON },
      {
        delay: 3700,
        text: "> ╔══════════════════════════════════════════╗",
        color: T.NEON,
      },
      {
        delay: 3800,
        text: "> ║  INTEGRITY SCORE : 10 / 10  [ PASS ]    ║",
        color: T.NEON,
      },
      {
        delay: 3900,
        text: "> ║  PAYMENT SURFACE : PCI-DSS COMPLIANT    ║",
        color: T.NEON,
      },
      {
        delay: 4000,
        text: "> ║  AUDIT STATUS    : CERTIFIED            ║",
        color: T.NEON,
      },
      {
        delay: 4100,
        text: "> ╚══════════════════════════════════════════╝",
        color: T.NEON,
      },
    ],
  },

  {
    id: "PROJ-0x03",
    classLevel: "SECRET // EYES-ONLY",
    codename: "OPERATION: METEO-SHIELD",
    title: "Secure Weather Intelligence System",
    subtitle: "Role-Based Environmental Monitoring Platform",
    threatLevel: "MODERATE",
    threatColor: T.WARN,
    status: "PRODUCTION",
    statusColor: T.CYBER,
    year: "2026",
    caseId: "CVE-METEO-4402",
    description:
      "Full-stack weather intelligence platform featuring state-of-the-art authentication and role-based access controls. Implements mandatory multi-step email verification for account registration, secure password resets, and critical profile modifications. All weather data queries are securely proxied with aggressive API token protection and strict request rate-limiting.",
    stack: {
      frontend: [
        "React 19",
        "Vite PWA plugin",
        "Context API (Auth State)",
        "Tailwind v4",
        "Axios (Secure Interceptors)",
      ],
      backend: [
        "Node.js 22",
        "Fastify / Express",
        "JSON Web Tokens (JWT)",
        "Bcrypt (Password Hashing)",
        "Nodemailer (SMTP Relay)",
      ],
      database: [
        "MongoDB Atlas (Mongoose)",
        "Redis (Token Blacklisting & Rate Limiting)",
        "Encrypted Session Stores",
      ],
      security: [
        "HMAC Verification Tokens",
        "Secure/HTTPOnly Cookies",
        "CORS Whitelisting",
        "Helmet.js Security Headers",
        "Express-Rate-Limit",
        "CSP Level 3",
      ],
      devops: [
        "Docker + Traefik",
        "Cloudflare DNS Shield",
        "GitHub Actions CI/CD",
        "Environment Secret Vaults",
      ],
    },
    owaspFeatures: [
      {
        id: "A01",
        label: "Broken Access Control",
        fix: "Role-based verification checks on all premium weather endpoints; strict middleware validation.",
      },
      {
        id: "A02",
        label: "Cryptographic Failures",
        fix: "Enforced HTTPS-only transit; high-entropy salt generation via Bcrypt for credential storage.",
      },
      {
        id: "A03",
        label: "Injection",
        fix: "Mongoose ODM Object Modeling to prevent NoSQL injection vectors; strict input schema validation.",
      },
      {
        id: "A04",
        label: "Insecure Design",
        fix: "Mandatory stateful email verification flow required before unlocking active user privileges.",
      },
      {
        id: "A05",
        label: "Security Misconfiguration",
        fix: "HTTPOnly, SameSite=Strict cookies to insulate application from XSS and session hijacking.",
      },
      {
        id: "A07",
        label: "Identification & Auth Failures",
        fix: "Secure token expiration, temporary account lockouts, and robust verification links for resets.",
      },
    ],
    links: {
      github: "https://github.com/Ahme-Byte/Full_stack-weather",
      live: "#",
      report: "#",
    },
    scanLog: [
      {
        delay: 0,
        text: "> INITIALISING INTEGRITY ENGINE v4.2.1...",
        color: T.NEON,
      },
      {
        delay: 180,
        text: "> CONNECTING TO AUDIT ORACLE...",
        color: T.TEXT_MID,
      },
      {
        delay: 360,
        text: "> TARGET: METEO-SHIELD / AUTH LAYER + WEATHER PROXY",
        color: T.WARN,
      },
      {
        delay: 540,
        text: "> [SCANNING APIS AND STACK UTILITIES — 4,120 lines...]",
        color: T.TEXT_MID,
      },
      {
        delay: 720,
        text: "> [CHECKING AGAINST OWASP TOP 10 — AUTHENTICATION STANDARDS]",
        color: T.CYBER,
      },
      {
        delay: 900,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 1080,
        text: "> [A01: Broken Access Control]       → ENFORCED ✓",
        color: T.NEON,
      },
      {
        delay: 1200,
        text: "> [A02: Cryptographic Failures]      → PASS ✓",
        color: T.NEON,
      },
      {
        delay: 1320,
        text: "> [A03: NoSQL Injection Vectors]     → SANITISED ✓",
        color: T.NEON,
      },
      {
        delay: 1440,
        text: "> [A04: Secure Verification Flows]   → VALIDATED ✓",
        color: T.NEON,
      },
      {
        delay: 1560,
        text: "> [A05: Cookie & Header Policies]    → LOCKED ✓",
        color: T.NEON,
      },
      {
        delay: 1680,
        text: "> [A06: Third-Party API Dependencies]→ MONITORING ✓",
        color: T.NEON,
      },
      {
        delay: 1800,
        text: "> [A07: Session & Token Lifecycle]   → SECURED ✓",
        color: T.NEON,
      },
      {
        delay: 1920,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      {
        delay: 2100,
        text: "> [EMAIL VERIFICATION DISPATCH TEST] → SMTP SUCCESS ✓",
        color: T.NEON,
      },
      {
        delay: 2250,
        text: "> [PASSWORD RESET TOKEN EXPIRATION]  → 15m TIMEOUT ✓",
        color: T.NEON,
      },
      {
        delay: 2400,
        text: "> [WEATHER API KEY EXPOSURE SCAN]    → 0 KEYS LEAKED ✓",
        color: T.NEON,
      },
      {
        delay: 2550,
        text: "> [HTTPONLY COOKIE HIJACK TEST]      → INACCESSIBLE ✓",
        color: T.NEON,
      },
      {
        delay: 2700,
        text: "> ────────────────────────────────────────────",
        color: T.WIRE,
      },
      { delay: 2850, text: "> COMPILING AUDIT DATA...", color: T.AMBER },
      { delay: 3000, text: "> ██████████████████████████ 100%", color: T.NEON },
      {
        delay: 3150,
        text: "> ╔══════════════════════════════════════════╗",
        color: T.NEON,
      },
      {
        delay: 3250,
        text: "> ║  SECURITY SCORE  : 9.8 / 10  [ PASS ]    ║",
        color: T.NEON,
      },
      {
        delay: 3350,
        text: "> ║  AUTH HARDENING  : ADVANCED STACK        ║",
        color: T.NEON,
      },
      {
        delay: 3450,
        text: "> ║  DEPLOYMENT      : SECURE PRODUCTION     ║",
        color: T.NEON,
      },
      {
        delay: 3550,
        text: "> ╚══════════════════════════════════════════╝",
        color: T.NEON,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEX-CORNER SVG BRACKETS (code-brutalism frame detail)
// ─────────────────────────────────────────────────────────────────────────────
function HexCorner({
  position = "tl",
  color = T.NEON,
  size = 22,
  animate = false,
}) {
  const transforms = {
    tl: "translate(0,0)",
    tr: `translate(${size},0) scale(-1,1)`,
    bl: `translate(0,${size}) scale(1,-1)`,
    br: `translate(${size},${size}) scale(-1,-1)`,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        ...(position === "tl" && { top: 0, left: 0 }),
        ...(position === "tr" && { top: 0, right: 0 }),
        ...(position === "bl" && { bottom: 0, left: 0 }),
        ...(position === "br" && { bottom: 0, right: 0 }),
        pointerEvents: "none",
      }}
    >
      <g transform={transforms[position]}>
        <polyline
          points={`0,${size} 0,0 ${size},0`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="square"
          style={
            animate
              ? {
                  strokeDasharray: 60,
                  strokeDashoffset: 60,
                  animation: "cp-corner-draw 0.5s ease forwards",
                }
              : {}
          }
        />
        {/* Hex dot at origin */}
        <circle cx="0" cy="0" r="2.5" fill={color} />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STACK BADGE
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  React: { bg: "#00d8ff18", border: "#00d8ff", text: "#00d8ff" },
  Node: { bg: "#68a06318", border: "#68a063", text: "#68a063" },
  MongoDB: { bg: "#00ed6418", border: "#00ed64", text: "#00ed64" },
  Docker: { bg: "#2496ed18", border: "#2496ed", text: "#2496ed" },
  Solidity: { bg: "#9d00ff18", border: "#9d00ff", text: "#9d00ff" },
  default: { bg: "#ffffff08", border: "#333", text: "#555" },
};

function resolveBadgeColor(label) {
  for (const key of Object.keys(BADGE_COLORS)) {
    if (key !== "default" && label.toLowerCase().includes(key.toLowerCase())) {
      return BADGE_COLORS[key];
    }
  }
  return BADGE_COLORS.default;
}

const StackBadge = memo(function StackBadge({ label }) {
  const c = resolveBadgeColor(label);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: "0.55rem",
        letterSpacing: "0.08em",
        fontFamily: '"Courier New", monospace',
        background: c.bg,
        border: `1px solid ${c.border}55`,
        color: c.text,
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. OWASP FEATURE ROW
// ─────────────────────────────────────────────────────────────────────────────
const OwaspRow = memo(function OwaspRow({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={() => setExpanded((v) => !v)}
      style={{
        borderBottom: `1px solid ${T.WIRE}`,
        padding: "5px 0",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* OWASP ID chip */}
        <span
          style={{
            flexShrink: 0,
            fontSize: "0.5rem",
            letterSpacing: "0.1em",
            color: T.CYBER,
            border: `1px solid ${T.CYBER_DIM}`,
            padding: "1px 5px",
            borderRadius: 2,
            fontFamily: '"Courier New", monospace',
          }}
        >
          {item.id}
        </span>
        {/* Vulnerability label */}
        <span
          style={{
            fontSize: "0.6rem",
            color: "#444",
            fontFamily: '"Courier New", monospace',
            flex: 1,
            letterSpacing: "0.04em",
          }}
        >
          {item.label}
        </span>
        {/* SECURE badge */}
        <span
          style={{
            fontSize: "0.5rem",
            color: T.NEON,
            fontFamily: '"Courier New", monospace',
            letterSpacing: "0.1em",
            textShadow: `0 0 6px ${T.NEON}`,
          }}
        >
          ✓ SECURE
        </span>
        <span style={{ fontSize: "0.55rem", color: "#333" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "5px 0 2px 2.2rem",
                fontSize: "0.57rem",
                color: T.NEON_DIM,
                fontFamily: '"Courier New", monospace',
                letterSpacing: "0.04em",
                lineHeight: 1.6,
                borderLeft: `1px solid ${T.NEON_DIM}44`,
                marginLeft: "1.6rem",
                paddingLeft: "0.6rem",
                marginTop: 4,
              }}
            >
              └ {item.fix}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. INTEGRITY SCAN TERMINAL
//    State machine: 'idle' | 'running' | 'complete'
// ─────────────────────────────────────────────────────────────────────────────
function IntegrityScan({ scanLog }) {
  // 'idle' | 'running' | 'complete'
  const [phase, setPhase] = useState("idle");
  const [visibleLines, setVisible] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const timersRef = useRef([]);
  const scrollRef = useRef(null);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll terminal to bottom as new lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const runScan = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("running");
    setVisible([]);
    setShowScore(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    scanLog.forEach((entry, i) => {
      const id = setTimeout(() => {
        setVisible((prev) => [...prev, entry]);
      }, entry.delay);
      timersRef.current.push(id);
    });

    // After last line + 600ms buffer, mark complete
    const last = scanLog[scanLog.length - 1];
    const finId = setTimeout(() => {
      setPhase("complete");
      setShowScore(true);
    }, last.delay + 600);
    timersRef.current.push(finId);
  }, [phase, scanLog]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("idle");
    setVisible([]);
    setShowScore(false);
  }, []);

  return (
    <div style={{ marginTop: "1.25rem" }}>
      {/* ── Trigger button ─────────────────────────────── */}
      {phase === "idle" && (
        <motion.button
          onClick={runScan}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "relative",
            width: "100%",
            padding: "0.7rem 1rem",
            background: "transparent",
            border: `1px solid ${T.NEON}`,
            color: T.NEON,
            fontFamily: '"Courier New", monospace',
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            cursor: "pointer",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: `0 0 0 1px ${T.NEON}22, 0 0 20px ${T.NEON}0a`,
            transition: "box-shadow 0.25s ease, background 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${T.NEON}0f`;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${T.NEON}, 0 0 28px ${T.NEON}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = `0 0 0 1px ${T.NEON}22, 0 0 20px ${T.NEON}0a`;
          }}
        >
          {/* Ripple bg */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at center, ${T.NEON}11 0%, transparent 70%)`,
              opacity: 0,
              transition: "opacity 0.3s",
            }}
          />
          {/* Animated shield icon */}
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path
              d="M6 1L1 3.5V7C1 9.8 3.2 12.4 6 13C8.8 12.4 11 9.8 11 7V3.5L6 1Z"
              stroke={T.NEON}
              strokeWidth="1"
              fill="none"
              style={{ filter: `drop-shadow(0 0 3px ${T.NEON})` }}
            />
            <path
              d="M3.5 6.5L5.2 8.2L8.5 5"
              stroke={T.NEON}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          RUN APPLICATION INTEGRITY CHECK
          <span style={{ opacity: 0.5 }}>_</span>
        </motion.button>
      )}

      {/* ── Running phase ──────────────────────────────── */}
      {(phase === "running" || phase === "complete") && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "#000",
            border: `1px solid ${T.NEON}33`,
            borderTop: `2px solid ${T.NEON}`,
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 0 20px ${T.NEON}0a, inset 0 0 20px rgba(0,0,0,0.8)`,
          }}
        >
          {/* Terminal header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 10px",
              borderBottom: `1px solid ${T.WIRE}`,
              background: "#050505",
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: "0.5rem",
                color: "#333",
                fontFamily: '"Courier New", monospace',
                letterSpacing: "0.15em",
              }}
            >
              AUDIT_TERMINAL — INTEGRITY_ENGINE v4.2.1
            </span>
            <button
              onClick={reset}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#333",
                fontSize: "0.55rem",
                fontFamily: '"Courier New", monospace',
                letterSpacing: "0.1em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.WARN)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              [CLOSE]
            </button>
          </div>

          {/* Scan line sweep overlay */}
          {phase === "running" && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${T.NEON}88, transparent)`,
                animation: "cp-scanline 1.2s linear infinite",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Log output */}
          <div
            ref={scrollRef}
            style={{
              maxHeight: 240,
              overflowY: "auto",
              padding: "10px 12px",
              scrollbarWidth: "thin",
              scrollbarColor: `${T.NEON_DIM}44 transparent`,
            }}
          >
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: "0.6rem",
                  lineHeight: 1.7,
                  color: line.color,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  letterSpacing: "0.03em",
                  textShadow:
                    line.color === T.NEON ? `0 0 6px ${T.NEON}55` : "none",
                }}
              >
                {line.text}
              </motion.div>
            ))}

            {/* Live cursor */}
            {phase === "running" && (
              <span
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: "0.6rem",
                  color: T.NEON,
                  animation: "cp-cursor 0.8s step-end infinite",
                }}
              >
                █
              </span>
            )}
          </div>

          {/* Complete state footer */}
          <AnimatePresence>
            {showScore && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{
                  borderTop: `1px solid ${T.NEON}44`,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: `${T.NEON}06`,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: T.NEON,
                    className: "cp-score-glow",
                    animation: "cp-score-glow 1.6s ease-in-out infinite",
                  }}
                >
                  INTEGRITY SCORE: 10/10
                </span>
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    background: `${T.NEON}18`,
                    border: `1px solid ${T.NEON}`,
                    borderRadius: 2,
                    fontSize: "0.55rem",
                    letterSpacing: "0.15em",
                    color: T.NEON,
                    fontFamily: '"Courier New", monospace',
                    fontWeight: 700,
                    animation:
                      "cp-badge-pop 0.4s cubic-bezier(0.16,1,0.3,1) both",
                    boxShadow: `0 0 12px ${T.NEON}44`,
                  }}
                >
                  ✓ PASS
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DOSSIER CARD
// ─────────────────────────────────────────────────────────────────────────────
function DossierCard({ project, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [tab, setTab] = useState("owasp"); // 'owasp' | 'stack'

  // Tilt on mouse move
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 18 });
  const sry = useSpring(ry, { stiffness: 80, damping: 18 });
  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      rx.set(cy * -6);
      ry.set(cx * 6);
    },
    [rx, ry],
  );

  const handleMouseLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
  }, [rx, ry]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, skewY: 2 }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              skewY: 0,
              transition: {
                duration: 0.65,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              },
            }
          : {}
      }
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          position: "relative",
          background: T.GHOST,
          border: `1px solid ${T.WIRE}`,
          overflow: "visible",
          transition: "border-color 0.3s ease",
        }}
        whileHover={{
          borderColor: `${project.threatColor}55`,
          boxShadow: `0 0 0 1px ${project.threatColor}22, 0 20px 60px ${project.threatColor}10`,
          transition: { duration: 0.25 },
        }}
      >
        {/* ── Hex corners ──────────────────────────── */}
        <HexCorner
          position="tl"
          color={project.threatColor}
          size={20}
          animate={inView}
        />
        <HexCorner
          position="tr"
          color={project.threatColor}
          size={20}
          animate={inView}
        />
        <HexCorner position="bl" color={T.TEXT_DIM} size={20} />
        <HexCorner position="br" color={T.TEXT_DIM} size={20} />

        {/* ── CLASSIFICATION TAPE ─────────────────── */}
        <div
          style={{
            background: `repeating-linear-gradient(
            -45deg,
            ${project.threatColor}18 0px,
            ${project.threatColor}18 8px,
            transparent 8px,
            transparent 16px
          )`,
            borderBottom: `1px solid ${project.threatColor}33`,
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "cp-tape-blink 3s ease-in-out infinite",
          }}
        >
          <span
            style={{
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: project.threatColor,
              fontFamily: '"Courier New", monospace',
              fontWeight: 700,
              textShadow: `0 0 8px ${project.threatColor}`,
            }}
          >
            ■ {project.classLevel}
          </span>
          <span
            style={{
              fontSize: "0.48rem",
              color: "#333",
              fontFamily: '"Courier New", monospace',
              letterSpacing: "0.12em",
            }}
          >
            {project.caseId} // {project.year}
          </span>
        </div>

        {/* ── CARD HEADER ─────────────────────────── */}
        <div style={{ padding: "14px 16px 10px" }}>
          {/* Codename row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.22em",
                color: T.CYBER,
                fontFamily: '"Courier New", monospace',
                textShadow: `0 0 8px ${T.CYBER}`,
              }}
            >
              {project.codename}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Threat level badge */}
              <span
                style={{
                  fontSize: "0.48rem",
                  letterSpacing: "0.14em",
                  color: project.threatColor,
                  border: `1px solid ${project.threatColor}`,
                  padding: "2px 7px",
                  borderRadius: 2,
                  fontFamily: '"Courier New", monospace',
                  animation: "cp-threat-pulse 2.5s ease-in-out infinite",
                }}
              >
                THREAT: {project.threatLevel}
              </span>
              {/* Status pill */}
              <span
                style={{
                  fontSize: "0.48rem",
                  letterSpacing: "0.14em",
                  color: project.statusColor,
                  background: `${project.statusColor}15`,
                  border: `1px solid ${project.statusColor}44`,
                  padding: "2px 7px",
                  borderRadius: 2,
                  fontFamily: '"Courier New", monospace',
                }}
              >
                {project.status}
              </span>
            </div>
          </div>

          {/* Project title */}
          <h3
            className="cp-title-chroma"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: T.WHITE,
              fontFamily: '"Courier New", monospace',
              letterSpacing: "-0.01em",
              margin: "0 0 4px",
            }}
          >
            {project.title}
          </h3>
          <p
            style={{
              fontSize: "0.62rem",
              color: T.TEXT_MID,
              fontFamily: '"Courier New", monospace',
              letterSpacing: "0.08em",
              margin: "0 0 10px",
            }}
          >
            {project.subtitle}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "0.63rem",
              color: "#464646",
              fontFamily: '"Courier New", monospace',
              lineHeight: 1.75,
              letterSpacing: "0.02em",
              borderLeft: `2px solid ${T.WIRE}`,
              paddingLeft: "0.75rem",
              margin: "0 0 12px",
            }}
          >
            {project.description}
          </p>

          {/* ── TAB SWITCHER ─────────────────────────── */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${T.WIRE}`,
              marginBottom: 10,
            }}
          >
            {[
              { key: "owasp", label: "OWASP DEFENCE MAP" },
              { key: "stack", label: "TECH STACK" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 12px",
                  fontSize: "0.52rem",
                  letterSpacing: "0.14em",
                  fontFamily: '"Courier New", monospace',
                  color: tab === key ? T.NEON : "#333",
                  borderBottom:
                    tab === key
                      ? `1px solid ${T.NEON}`
                      : "1px solid transparent",
                  marginBottom: -1,
                  transition: "color 0.2s ease, border-color 0.2s ease",
                  textShadow: tab === key ? `0 0 8px ${T.NEON}` : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── OWASP panel ──────────────────────────── */}
          <AnimatePresence mode="wait">
            {tab === "owasp" && (
              <motion.div
                key="owasp"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {project.owaspFeatures.map((item, i) => (
                  <OwaspRow key={item.id} item={item} index={i} />
                ))}
              </motion.div>
            )}

            {/* ── Stack panel ──────────────────────────── */}
            {tab === "stack" && (
              <motion.div
                key="stack"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {Object.entries(project.stack).map(([layer, techs]) => (
                  <div key={layer} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: "0.5rem",
                        letterSpacing: "0.18em",
                        color: "#333",
                        marginBottom: 5,
                        fontFamily: '"Courier New", monospace',
                        textTransform: "uppercase",
                      }}
                    >
                      ── {layer} ──
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {techs.map((t) => (
                        <StackBadge key={t} label={t} />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── INTEGRITY SCAN ───────────────────────── */}
          <IntegrityScan scanLog={project.scanLog} />

          {/* ── LINKS ────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${T.WIRE}`,
            }}
          >
            {[
              {
                href: project.links.github,
                label: "[ GITHUB ]",
                color: T.NEON,
              },
              {
                href: project.links.live,
                label: "[ LIVE_DEMO ]",
                color: T.CYBER,
              },
              {
                href: project.links.report,
                label: "[ SEC_REPORT ]",
                color: T.AMBER,
              },
            ].map(({ href, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  fontFamily: '"Courier New", monospace',
                  color,
                  textDecoration: "none",
                  padding: "3px 8px",
                  border: `1px solid ${color}33`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.background = `${color}12`;
                  e.currentTarget.style.textShadow = `0 0 8px ${color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${color}33`;
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── PROJECT ID watermark ─────────────────── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 10,
            right: 14,
            fontSize: "0.45rem",
            color: "#1a1a1a",
            fontFamily: '"Courier New", monospace',
            letterSpacing: "0.12em",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {project.id}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} style={{ marginBottom: "4rem", position: "relative" }}>
      {/* Breach flash on enter */}
      <AnimatePresence>
        {inView && (
          <motion.div
            key="breach"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0, 1, 0, 1],
              transition: { duration: 0.5, times: [0, 0.1, 0.2, 0.35, 0.5, 1] },
            }}
            className="cp-section-reveal"
            style={{
              position: "absolute",
              inset: "-2rem -2rem 0",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      {/* Terminal path */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: "0.6rem",
          color: "#2a2a2a",
          letterSpacing: "0.15em",
          marginBottom: "0.75rem",
        }}
      >
        root@portfolio:~/classified/projects#
        <span style={{ color: T.NEON, marginLeft: 8 }}>
          ls -la --sort=threat_level
        </span>
      </motion.div>

      {/* Main headline with glitch layers */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20, skewX: -3 }}
          animate={inView ? { opacity: 1, y: 0, skewX: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 0.95,
            fontFamily: '"Courier New", monospace',
            color: T.WHITE,
            margin: 0,
            textShadow: `0 0 40px rgba(255,255,255,0.06)`,
          }}
        >
          CLASSIFIED
          <br />
          <span style={{ color: T.NEON, textShadow: `0 0 20px ${T.NEON}66` }}>
            OPERATIONS
          </span>
          <span
            style={{
              color: T.CYBER,
              marginLeft: "0.3em",
              textShadow: `0 0 20px ${T.CYBER}66`,
            }}
          >
            ▓▓
          </span>
        </motion.h2>

        {/* Redaction bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            position: "absolute",
            bottom: -8,
            left: 0,
            right: 0,
            height: 2,
            transformOrigin: "left",
            background: `linear-gradient(90deg, ${T.NEON}, ${T.CYBER}, transparent)`,
          }}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.55 }}
        style={{
          marginTop: "1.5rem",
          fontSize: "0.65rem",
          color: "#333",
          fontFamily: '"Courier New", monospace',
          letterSpacing: "0.1em",
          lineHeight: 1.8,
          maxWidth: 600,
        }}
      >
        // 3 OPERATIONS EXTRACTED FROM CLASSIFIED ARCHIVE //
        <br />
        HOVER EACH DOSSIER FOR BREACH INTEL · CLICK OWASP ENTRIES TO EXPAND
        MITIGATION DETAIL
        <br />
        RUN INTEGRITY CHECK TO VERIFY EACH SYSTEM'S SECURITY POSTURE
      </motion.p>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.75, duration: 0.4 }}
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "OPERATIONS", value: "03", color: T.NEON },
          { label: "OWASP VECTORS", value: "18", color: T.CYBER },
          { label: "CVEs MITIGATED", value: "40+", color: T.WARN },
          { label: "INTEGRITY SCORE", value: "10/10", color: T.NEON },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                color,
                fontFamily: '"Courier New", monospace',
                textShadow: `0 0 10px ${color}66`,
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontSize: "0.48rem",
                color: "#2a2a2a",
                fontFamily: '"Courier New", monospace',
                letterSpacing: "0.18em",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BOTTOM TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_TEXT =
  "OWASP A01 MITIGATED ◈ OWASP A02 ENCRYPTED ◈ OWASP A03 SANITISED ◈ OWASP A04 THREAT-MODELLED ◈ OWASP A05 HARDENED ◈ OWASP A06 PATCHED ◈ OWASP A07 SECURED ◈ OWASP A08 VERIFIED ◈ OWASP A09 MONITORED ◈ OWASP A10 BLOCKED ◈ ALL SYSTEMS NOMINAL ◈ INTEGRITY SCORE 30/30 ◈ ";

function BottomTicker() {
  const doubled = TICKER_TEXT + TICKER_TEXT;
  return (
    <div
      style={{
        marginTop: "4rem",
        overflow: "hidden",
        borderTop: `1px solid ${T.WIRE}`,
        borderBottom: `1px solid ${T.WIRE}`,
        padding: "8px 0",
        position: "relative",
      }}
    >
      {/* Fade edges */}
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
            background: `linear-gradient(to ${side === "left" ? "right" : "left"}, ${T.VOID}, transparent)`,
            zIndex: 1,
          }}
        />
      ))}
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "cp-ticker 28s linear infinite",
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "0.52rem",
            letterSpacing: "0.16em",
            color: "#252525",
          }}
        >
          {doubled}
        </span>
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "0.52rem",
            letterSpacing: "0.16em",
            color: T.NEON_DIM,
            opacity: 0.3,
          }}
        >
          {doubled}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function ClassifiedProjects() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: T.VOID,
        display: "block",
        /* KEEP Horizontal Spacing here so side margins don't break */
        padding: "0 clamp(1.5rem, 6vw, 5rem)",
        overflow: "hidden",
      }}
    >
      {/* ── Scoped keyframes ──────────────────────────────── */}
      <SectionStyles />

      {/* ── Ambient background grid ───────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(rgba(0,255,102,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,102,0.025) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
          animation: "cp-grid-drift 8s linear infinite",
        }}
      />

      {/* ── Purple depth aura ─────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: "40vw",
          height: "60vh",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${T.CYBER}0a 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Content ───────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionHeader />

        {/* Project grid — 3 columns on large, 1 on small */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "clamp(1.5rem, 3vw, 2.5rem)",
            alignItems: "start",
          }}
        >
          {PROJECTS.map((project, i) => (
            <DossierCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <BottomTicker />
      </div>
    </section>
  );
}
