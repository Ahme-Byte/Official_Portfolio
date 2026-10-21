import { useRef, useState, memo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { theme, fonts, ease } from "../theme";
import { projects } from "../config/data";

const Tag = memo(function Tag({ children, tone = "default" }) {
  const colors = {
    default: {
      color: theme.textMuted,
      border: theme.border,
      bg: "rgba(255,255,255,0.03)",
    },
    accent: {
      color: theme.accent,
      border: "rgba(56,189,248,0.3)",
      bg: theme.accentSoft,
    },
    secure: {
      color: theme.secure,
      border: "rgba(52,211,153,0.3)",
      bg: theme.secureSoft,
    },
    indigo: {
      color: theme.indigo,
      border: "rgba(99,102,241,0.3)",
      bg: theme.indigoSoft,
    },
  };
  const c = colors[tone] || colors.default;
  return (
    <span
      className="font-mono"
      style={{
        fontSize: "0.65rem",
        letterSpacing: "0.02em",
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        padding: "0.2rem 0.5rem",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
});

function PreviewFrame({ preview, title, stack }) {
  const [failed, setFailed] = useState(!preview.image);
  const initials = title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="project-preview"
      style={{
        position: "relative",
        overflow: "hidden",
        aspectRatio: "16 / 10",
        background: `linear-gradient(145deg, ${preview.from}33, ${preview.to}22, ${theme.bgElevated})`,
      }}
    >
      {!failed ? (
        <img
          src={preview.image}
          alt={`${title} homepage screenshot`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      ) : (
        <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          display: "flex",
          gap: 5,
        }}
      >
        {["#F87171", "#FBBF24", "#34D399"].map((c) => (
          <span
            key={c}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
          padding: 16,
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 10,
            padding: "0.85rem 1.25rem",
            maxWidth: "85%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: 42,
              height: 42,
              margin: "0 auto 0.7rem",
              borderRadius: 13,
              color: theme.text,
              fontFamily: fonts.sans,
              fontWeight: 750,
              background: `linear-gradient(135deg, ${preview.from}, ${preview.to})`,
              boxShadow: `0 8px 28px ${preview.from}55`,
            }}
          >
            {initials}
          </div>
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: "1rem",
              color: theme.text,
            }}
          >
            {title}
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "0.62rem", color: theme.textDim, marginTop: 4 }}
          >
            {preview.label}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 5,
              marginTop: 10,
            }}
          >
            {stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="font-mono"
                style={{
                  color: theme.textMuted,
                  fontSize: "0.55rem",
                  background: "rgba(255,255,255,0.06)",
                  padding: "0.2rem 0.4rem",
                  borderRadius: 5,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: `linear-gradient(transparent, ${theme.bg}cc)`,
        }}
      />
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, index }) {
  const [tab, setTab] = useState("stack");
  const tiltX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  const handlePointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltX.set(
      ((bounds.top + bounds.height / 2 - event.clientY) / bounds.height) * 3,
    );
    tiltY.set(
      ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 3,
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay:       (index % 3) * 0.1, ease }}
      whileHover={{ y: -5 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      className="glass"
      style={{
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.25s",
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 900,
      }}
    >
      <PreviewFrame
        preview={project.preview}
        title={project.title}
        stack={project.stack}
      />

      <div
        style={{
          padding: "1.25rem 1.35rem 1.4rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            gap: 8,
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: "0.65rem", color: theme.textDim }}
          >
            {project.year}
          </span>
          <Tag tone="secure">{project.status}</Tag>
        </div>

        <h3
          style={{
            margin: "0 0 0.25rem",
            fontFamily: fonts.sans,
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: theme.text,
          }}
        >
          {project.title}
        </h3>
        <p
          style={{
            margin: "0 0 0.85rem",
            color: theme.accent,
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          {project.subtitle}
        </p>
        <p
          style={{
            margin: "0 0 1rem",
            color: theme.textMuted,
            fontSize: "0.88rem",
            lineHeight: 1.6,
            flex: 1,
          }}
        >
          {project.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 10,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {[
            { key: "stack", label: "Stack" },
            { key: "arch", label: "Architecture" },
            { key: "sec", label: "Security" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                background: "none",
                border: "none",
                borderBottom:
                  tab === key
                    ? `2px solid ${theme.accent}`
                    : "2px solid transparent",
                color: tab === key ? theme.accent : theme.textDim,
                fontFamily: fonts.sans,
                fontSize: "0.75rem",
                fontWeight: 560,
                padding: "0.4rem 0.65rem",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ minHeight: 56, marginBottom: 14 }}
          >
            {tab === "stack" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {project.stack.map((t) => (
                  <Tag key={t} tone="accent">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
            {tab === "arch" && (
              <p
                className="font-mono"
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  color: theme.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {project.architecture}
              </p>
            )}
            {tab === "sec" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {project.security.map((t) => (
                  <Tag key={t} tone="secure">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          {project.links.live && project.links.live !== "#" ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              style={{
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                background: theme.accentSoft,
                border: `1px solid rgba(56,189,248,0.35)`,
                color: theme.accent,
                fontFamily: fonts.sans,
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.55rem 0.75rem",
                borderRadius: 8,
              }}
            >
              Live project ↗
            </a>
          ) : (
            <span
              className="font-mono"
              style={{ flex: 1, color: theme.textDim, fontSize: "0.65rem" }}
            >
              Live preview unavailable
            </span>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              style={{
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                background: "transparent",
                border: `1px solid ${theme.borderStrong}`,
                color: theme.textMuted,
                fontFamily: fonts.sans,
                fontSize: "0.8rem",
                fontWeight: 560,
                padding: "0.55rem 0.75rem",
                borderRadius: 8,
              }}
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function ClassifiedProjects() {
  const sectionRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const canShowMore = visibleCount < projects.length;
  const canShowLess = visibleCount > 3;

  const showLess = () => {
    setVisibleCount(3);
    requestAnimationFrame(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(sectionRef.current, { duration: 0.8 });
      } else {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        padding: "clamp(4rem, 8vh, 6rem) clamp(1.25rem, 5vw, 4rem)",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: "2.5rem", maxWidth: 560 }}>
        <p
          className="font-mono"
          style={{
            fontSize: "0.7rem",
            color: theme.accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          #projects
        </p>
        <h2
          style={{
            fontFamily: fonts.sans,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 0.75rem",
            color: theme.text,
          }}
        >
          Production apps, not prototypes
        </h2>
        <p
          style={{
            margin: 0,
            color: theme.textMuted,
            fontSize: "1rem",
            lineHeight: 1.65,
          }}
        >
          Live systems with clear stack choices, architecture notes, and the
          security protocols wired into each build.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "clamp(1.25rem, 3vw, 2rem)",
          alignItems: "stretch",
        }}
      >
        <AnimatePresence initial={false}>
          {projects.slice(0, visibleCount).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </div>
      {(canShowMore || canShowLess) && (
        <div className="project-explore-controls">
          {canShowMore && (
            <motion.button
              type="button"
              className="project-explore-button"
              onClick={() =>
                setVisibleCount((count) => Math.min(count + 3, projects.length))
              }
              whileHover={{ y: -3, scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Explore the next ${Math.min(3, projects.length - visibleCount)} projects`}
            >
              Explore More <span aria-hidden="true">↓</span>
            </motion.button>
          )}
          {canShowLess && (
            <motion.button
              type="button"
              className="project-explore-button project-explore-secondary"
              onClick={showLess}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Show Less <span aria-hidden="true">↑</span>
            </motion.button>
          )}
        </div>
      )}
    </section>
  );
}
