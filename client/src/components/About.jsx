import { useEffect, useRef, useState } from "react";
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
];

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

function PortraitCard({ reducedMotion }) {
  const imageRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), {
    stiffness: 120,
    damping: 18,
  });

  const handleMove = (event) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <div className="about-portrait-column">
      <div className="about-portrait-glow" aria-hidden="true" />
      <motion.div
        ref={imageRef}
        className="about-portrait-frame"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.88, clipPath: "inset(12% 12% 12% 12% round 32px)" }}
        whileInView={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 32px)" }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: reducedMotion ? 0 : 0.85, ease }}
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformPerspective: 900,
        }}
        onPointerMove={handleMove}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <div className="about-portrait-border" aria-hidden="true" />
        <img
          src="/profile.jpg"
          alt="Professional placeholder portrait for Ahmad"
          loading="lazy"
          decoding="async"
          width="720"
          height="900"
        />
        <div className="about-portrait-overlay" aria-hidden="true" />
        <div className="about-portrait-caption">
          <span className="about-portrait-status" />
          Building with purpose
        </div>
      </motion.div>
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
