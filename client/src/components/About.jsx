import { useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  BriefcaseBusiness,
} from "lucide-react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";
import { skillPillars } from "../config/data";
import DownloadCvButton from "./DownloadCvButton";
import { useThemeMode } from "../hooks/useThemeMode";
import { ease } from "../theme";

const skillCount = skillPillars.reduce((count, pillar) => count + pillar.skills.length, 0);
const quickInfo = [
  { icon: MapPin, label: "Location", value: "Lahore, Pakistan" },
  {
    icon: GraduationCap,
    label: "Education",
    value: "BS Computer Science · Islamia University Bahawalpur · 7th semester · CGPA 3.2",
  },
  {
    icon: BriefcaseBusiness,
    label: "Currently",
    value: "Full Stack Web Developer at DevArion Solution · since April 2026",
  },
  {
    icon: Languages,
    label: "Languages",
    value: "English, Urdu, Punjabi, Saraiki",
  },
];
const services = [
  { icon: Code2, title: "Full-Stack Development", tone: "accent" },
  { icon: ShieldCheck, title: "Cybersecurity and Pen-Testing", tone: "secure" },
  { icon: Sparkles, title: "3D / Interactive UI", tone: "indigo" },
  { icon: TerminalSquare, title: "Desktop Apps — Cross-platform apps with Electron", tone: "accent" },
];

function seededValue(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createPuzzlePath({ row, column, columns, rows, tileHeight, verticalEdges, horizontalEdges }) {
  const topTab = row === 0 ? 0 : -horizontalEdges[row - 1][column];
  const rightTab = column === columns - 1 ? 0 : verticalEdges[row][column];
  const bottomTab = row === rows - 1 ? 0 : horizontalEdges[row][column];
  const leftTab = column === 0 ? 0 : -verticalEdges[row][column - 1];
  const edge = (startX, startY, endX, endY, normalX, normalY, tab) => {
    const point = (amount, depth = 0) => {
      const x = startX + (endX - startX) * amount + normalX * depth * tab;
      const y = startY + (endY - startY) * amount + normalY * depth * tab;
      return `${x.toFixed(2)} ${y.toFixed(2)}`;
    };

    if (!tab) return `L ${endX} ${endY}`;
    return [
      `L ${point(0.34)}`,
      `C ${point(0.39, 7)} ${point(0.43, 12)} ${point(0.47, 12)}`,
      `C ${point(0.53, 12)} ${point(0.57, 7)} ${point(0.62)}`,
      `L ${endX} ${endY}`,
    ].join(" ");
  };

  return [
    "M 0 0",
    edge(0, 0, 100, 0, 0, -1, topTab),
    edge(100, 0, 100, tileHeight, 1, 0, rightTab),
    edge(100, tileHeight, 0, tileHeight, 0, 1, bottomTab),
    edge(0, tileHeight, 0, 0, -1, 0, leftTab),
    "Z",
  ].join(" ");
}

function createPuzzlePieces(columns, rows) {
  const verticalEdges = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns - 1 }, (_, column) =>
      seededValue(100 + row * columns + column) > 0.5 ? 1 : -1,
    ),
  );
  const horizontalEdges = Array.from({ length: rows - 1 }, (_, row) =>
    Array.from({ length: columns }, (_, column) =>
      seededValue(500 + row * columns + column) > 0.5 ? 1 : -1,
    ),
  );
  const tileHeight = (100 * 4 * columns) / (3 * rows);

  return Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const seed = index + columns * 37 + rows * 13;
    const kind = index % 8;
    const scatter = kind === 0 || kind === 5
      ? { x: seededValue(seed) * 2.2 - 1.1, y: seededValue(seed + 1) * 1.8 - 0.9 }
      : kind === 2 || kind === 6
        ? { x: seededValue(seed) * 1.6 - 0.8, y: kind === 2 ? -2.2 - seededValue(seed + 1) : 2.2 + seededValue(seed + 1) }
        : { x: -2.4 - seededValue(seed) * 2.4, y: seededValue(seed + 1) * 2.2 - 1.1 };

    return {
      row,
      column,
      id: `about-piece-${columns}-${row}-${column}`,
      path: createPuzzlePath({ row, column, columns, rows, tileHeight, verticalEdges, horizontalEdges }),
      tileHeight,
      scatter,
      rotation: seededValue(seed + 2) * 46 - 23,
      scale: 0.78 + seededValue(seed + 3) * 0.25,
      delay: seededValue(seed + 4) * 0.11,
      phase: seededValue(seed + 5) * Math.PI * 2,
    };
  });
}

function Counter({ value, label, active, reducedMotion, suffix = "" }) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const controls = animate(motionValue, value, {
      duration: reducedMotion ? 0 : 1.2,
      ease: "easeOut",
      onUpdate: (current) => setDisplayValue(Math.round(current)),
    });
    return () => controls.stop();
  }, [active, motionValue, reducedMotion, value]);

  return (
    <div className="about-counter glass">
      <strong>{displayValue}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

function JigsawPiece({ piece, columns, rows, progress, active, reducedMotion, mobile }) {
  const pose = (scrollProgress) => {
    if (reducedMotion) return { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
    const scatterScale = mobile ? 0.68 : 1;
    if (!active) {
      return {
        x: piece.scatter.x * scatterScale,
        y: piece.scatter.y * scatterScale,
        rotation: piece.rotation,
        scale: piece.scale,
        opacity: 0.72,
      };
    }
    const p = Math.min(1, Math.max(0, scrollProgress));
    const base = 1 - Math.min(1, Math.abs(p - 0.5) * 2);
    const delayed = Math.min(1, Math.max(0, (base - piece.delay) / (1 - piece.delay)));
    const amount = delayed * delayed * (3 - 2 * delayed);
    const wobble = Math.sin(p * 10 + piece.phase) * (1 - amount);

    return {
      x: piece.scatter.x * scatterScale * (1 - amount),
      y: piece.scatter.y * scatterScale * (1 - amount),
      rotation: piece.rotation * (1 - amount) + wobble * 1.8,
      scale: piece.scale + (1 - piece.scale) * amount,
      opacity: 0.72 + amount * 0.28,
    };
  };
  const x = useTransform(progress, (value) => `${pose(value).x * 100}%`);
  const y = useTransform(progress, (value) => `${pose(value).y * 100}%`);
  const rotate = useTransform(progress, (value) => pose(value).rotation);
  const scale = useTransform(progress, (value) => pose(value).scale);
  const opacity = useTransform(progress, (value) => active ? pose(value).opacity : 1);
  const left = `${(piece.column / columns) * 100}%`;
  const top = `${(piece.row / rows) * 100}%`;

  return (
    <motion.svg
      className="about-jigsaw-piece"
      viewBox={`0 0 100 ${piece.tileHeight}`}
      preserveAspectRatio="none"
      overflow="visible"
      aria-hidden="true"
      style={{
        left,
        top,
        width: `${100 / columns}%`,
        height: `${100 / rows}%`,
        x: reducedMotion ? 0 : x,
        y: reducedMotion ? 0 : y,
        rotate: reducedMotion ? 0 : rotate,
        scale: reducedMotion ? 1 : scale,
        opacity: reducedMotion ? 1 : opacity,
        willChange: reducedMotion ? "auto" : "transform",
      }}
    >
      <defs>
        <clipPath id={piece.id} clipPathUnits="userSpaceOnUse">
          <path d={piece.path} />
        </clipPath>
      </defs>
      <path className="about-jigsaw-shadow" d={piece.path} transform="translate(0 2)" />
      <image
        href="/profile.png"
        x={-piece.column * 100}
        y={-piece.row * piece.tileHeight}
        width={columns * 100}
        height={rows * piece.tileHeight}
        preserveAspectRatio="none"
        clipPath={`url(#${piece.id})`}
      />
      <path className="about-jigsaw-edge" d={piece.path} />
    </motion.svg>
  );
}

function PortraitCard({ reducedMotion }) {
  const imageRef = useRef(null);
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 32,
    mass: 0.5,
  });
  const active = useInView(imageRef, { margin: "160px 0px" });
  const pieces = useMemo(
    () => createPuzzlePieces(mobile ? 3 : 4, mobile ? 4 : 5),
    [mobile],
  );
  const sweepOpacity = useTransform(smoothProgress, (p) =>
    Math.max(0, 1 - Math.abs(p - 0.5) / 0.12) * 0.22,
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="about-portrait-column">
      <div className="about-portrait-glow" aria-hidden="true" />
      <div
        ref={imageRef}
        className="about-portrait-frame"
      >
        <div className="about-portrait-border" aria-hidden="true" />
        <div
          className="about-jigsaw-stage"
          role="img"
          aria-label="Portrait of Ahmad assembled from interlocking jigsaw pieces"
        >
          {pieces.map((piece) => (
            <JigsawPiece
              key={piece.id}
              piece={piece}
              columns={mobile ? 3 : 4}
              rows={mobile ? 4 : 5}
              progress={smoothProgress}
              active={active}
              reducedMotion={reducedMotion}
              mobile={mobile}
            />
          ))}
          {!reducedMotion && (
            <motion.div
              className="about-jigsaw-sweep"
              aria-hidden="true"
              style={{ opacity: active ? sweepOpacity : 0 }}
            />
          )}
        </div>
        <div className="about-portrait-overlay" aria-hidden="true" />
        <div className="about-portrait-caption">
          <span className="about-portrait-status" />
          Building with purpose
        </div>
      </div>
      <div className="about-orbit about-orbit-one" aria-hidden="true" />
      <div className="about-orbit about-orbit-two" aria-hidden="true" />
      <span className="about-float-badge about-badge-full glass"><Code2 size={14} /> Full-Stack Developer</span>
      <span className="about-float-badge about-badge-security glass"><ShieldCheck size={14} /> Cybersecurity</span>
      <span className="about-float-badge about-badge-next glass"><TerminalSquare size={14} /> Next.js</span>
      <span className="about-float-badge about-badge-open glass"><span className="about-portrait-status" /> Open to work</span>
    </div>
  );
}

export default function About() {
  const reducedMotion = useReducedMotion();
  const mode = useThemeMode();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`about-section about-${mode}`}
    >
      <div className="about-grid">
        <PortraitCard reducedMotion={reducedMotion} />
        <div className="about-copy">
          <motion.p
            className="about-kicker font-mono"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
          >
            #about · Lahore, Pakistan
          </motion.p>
          <motion.h2
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.05, ease }}
          >
            About Me
          </motion.h2>
          <motion.p
            className="about-tagline"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.1 }}
          >
            Secure engineering. Thoughtful interfaces. Real products.
          </motion.p>
          <motion.div
            className="about-paragraphs"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.16 }}
          >
            <p>
              I’m Ahmad, a Full-Stack Software Engineer and Cybersecurity specialist from Lahore, Pakistan. I build secure, scalable web platforms with Next.js, TypeScript, React, Node.js, and MongoDB, MySQL, and PostgreSQL—combining security-by-design, OWASP Top 10 awareness, hardened authentication, and RBAC with polished, motion-rich 3D interfaces using GSAP.
            </p>
            <p>
              I also build cross-platform desktop applications for Windows, macOS, and Linux with Electron.js.
            </p>
            <p>
              I’ve shipped live products including a freelancing marketplace, social network, earning platform, e-learning platform, and transit management system.
            </p>
          </motion.div>

          <div className="about-info-grid">
            {quickInfo.map(({ icon: Icon, label, value }, index) => (
              <motion.article
                key={label}
                className="about-info-card glass"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: reducedMotion ? 0 : 0.4, delay: 0.2 + index * 0.06 }}
              >
                <Icon size={17} aria-hidden="true" />
                <div><span>{label}</span><strong>{value}</strong></div>
              </motion.article>
            ))}
          </div>

          <div className="about-counters" aria-label="Portfolio highlights">
            <Counter value={16} suffix="+" label="Live projects" active={inView} reducedMotion={reducedMotion} />
            <Counter value={6} label="Months experience" active={inView} reducedMotion={reducedMotion} />
            <Counter value={skillCount} label="Technologies" active={inView} reducedMotion={reducedMotion} />
          </div>

          <div className="about-services">
            <h3>What I do</h3>
            <div className="about-service-grid">
              {services.map(({ icon: Icon, title, tone }) => (
                <div className={`about-service-card about-service-${tone} glass`} key={title}>
                  <Icon size={19} aria-hidden="true" />
                  <span>{title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-actions">
            <DownloadCvButton />
            <button
              type="button"
              className="about-talk-button"
              onClick={() => {
                const target = document.getElementById("contact");
                if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1 });
                else target?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Globe2 size={16} aria-hidden="true" /> Let’s Talk
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
