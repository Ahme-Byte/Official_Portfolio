import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { theme, fonts, ease } from "../theme";
import { experience, deploymentStack } from "../config/data";

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -28 : 28 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.1, ease }}
      className="glass"
      style={{
        borderRadius: 18,
        padding: "1.5rem 1.5rem 1.6rem",
        position: "relative",
        borderColor: "rgba(56,189,248,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.65rem",
          alignItems: "center",
          marginBottom: "0.85rem",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: theme.accent,
            background: theme.accentSoft,
            border: `1px solid rgba(56,189,248,0.3)`,
            padding: "0.3rem 0.6rem",
            borderRadius: 999,
          }}
        >
          {item.period}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: theme.secure,
            background: theme.secureSoft,
            border: `1px solid rgba(52,211,153,0.3)`,
            padding: "0.3rem 0.6rem",
            borderRadius: 999,
          }}
        >
          {item.duration}
        </span>
        {item.ongoing && (
          <span
            className="font-mono"
            style={{
              fontSize: "0.65rem",
              color: theme.secure,
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              padding: "0.3rem 0.6rem",
              borderRadius: 999,
            }}
          >
            Ongoing
          </span>
        )}
        <span
          className="font-mono"
          style={{ fontSize: "0.65rem", color: theme.textDim }}
        >
          {item.type}
        </span>
      </div>

      <h3
        style={{
          margin: "0 0 0.35rem",
          fontFamily: fonts.sans,
          fontSize: "clamp(1.15rem, 2.5vw, 1.45rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: theme.text,
        }}
      >
        {item.role}
      </h3>
      <p
        style={{
          margin: "0 0 1rem",
          color: theme.accent,
          fontWeight: 560,
          fontSize: "0.95rem",
        }}
      >
        {item.company}
        <span style={{ color: theme.textDim, fontWeight: 400 }}>
          {" "}
          · {item.location}
        </span>
      </p>

      <ul
        style={{
          margin: 0,
          padding: "0 0 0 1.1rem",
          display: "grid",
          gap: "0.55rem",
        }}
      >
        {item.highlights.map((h) => (
          <li
            key={h}
            style={{
              color: theme.textMuted,
              fontSize: "0.9rem",
              lineHeight: 1.55,
            }}
          >
            {h}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export default function Experience() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 40%"],
  });
  const glowHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "clamp(4rem, 8vh, 6rem) clamp(1.25rem, 5vw, 4rem)",
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
          #experience
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
          Work experience & deployment
        </h2>
        <p style={{ margin: 0, color: theme.textMuted, lineHeight: 1.65 }}>
          Shipping production systems from Lahore — secure auth, cloud/VPS
          deploys, and performance-minded full-stack delivery.
        </p>
      </div>

      <div
        ref={trackRef}
        style={{
          position: "relative",
          display: "grid",
          gap: "1.5rem",
          paddingLeft: "clamp(1.25rem, 4vw, 2rem)",
          maxWidth: 760,
        }}
      >
        {/* Timeline thread */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            bottom: 8,
            width: 2,
            background: "rgba(148,163,184,0.15)",
            borderRadius: 2,
          }}
        />
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            width: 2,
            height: glowHeight,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${theme.accent}, ${theme.secure})`,
            boxShadow: `0 0 12px ${theme.accent}88`,
          }}
        />

        {experience.map((item, i) => (
          <div key={item.id} style={{ position: "relative" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: "calc(-1 * clamp(1.25rem, 4vw, 2rem) - 4px)",
                top: 28,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: theme.bg,
                border: `2px solid ${theme.accent}`,
                boxShadow: `0 0 10px ${theme.accent}`,
              }}
            />
            <TimelineItem item={item} index={i} />
          </div>
        ))}
      </div>

      {/* Deployment stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease }}
        className="glass"
        style={{
          marginTop: "2.5rem",
          borderRadius: 18,
          padding: "1.35rem 1.5rem",
          maxWidth: 760,
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: "0.7rem",
            color: theme.indigo,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "0.85rem",
          }}
        >
          Deployment & infrastructure
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {deploymentStack.map((b) => (
            <span
              key={b.id}
              className="font-mono"
              style={{
                fontSize: "0.72rem",
                color: theme.textMuted,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${theme.border}`,
                padding: "0.4rem 0.7rem",
                borderRadius: 8,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
