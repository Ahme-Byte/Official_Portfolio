import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { theme, fonts, ease } from "../theme";
import { education } from "../config/data";

function EducationCard({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease }}
      className="glass"
      style={{
        borderRadius: 18,
        padding: "1.5rem 1.5rem 1.65rem",
        borderColor: "rgba(99,102,241,0.25)",
        maxWidth: 760,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.55rem",
          alignItems: "center",
          marginBottom: "0.9rem",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: theme.secure,
            background: theme.secureSoft,
            border: `1px solid rgba(52,211,153,0.3)`,
            padding: "0.3rem 0.65rem",
            borderRadius: 999,
          }}
        >
          {item.status}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: theme.accent,
            background: theme.accentSoft,
            border: `1px solid rgba(56,189,248,0.3)`,
            padding: "0.3rem 0.65rem",
            borderRadius: 999,
          }}
        >
          CGPA {item.cgpa}
        </span>
      </div>

      <h3
        style={{
          margin: "0 0 0.4rem",
          fontFamily: fonts.sans,
          fontSize: "clamp(1.15rem, 2.5vw, 1.45rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: theme.text,
          lineHeight: 1.25,
        }}
      >
        {item.degree}
      </h3>
      <p
        style={{
          margin: "0 0 1.15rem",
          color: theme.indigo,
          fontWeight: 560,
          fontSize: "0.95rem",
        }}
      >
        {item.institution}
      </p>

      <ul
        style={{
          margin: "0 0 1.25rem",
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

      <div
        className="font-mono"
        style={{
          fontSize: "0.65rem",
          color: theme.textDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "0.65rem",
        }}
      >
        Core coursework
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {item.courses.map((c) => (
          <span
            key={c}
            className="font-mono"
            style={{
              fontSize: "0.7rem",
              color: theme.textMuted,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${theme.border}`,
              padding: "0.35rem 0.65rem",
              borderRadius: 8,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

export default function Education() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        minHeight: "70vh",
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
          #education
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
          Academic foundation
        </h2>
        <p style={{ margin: 0, color: theme.textMuted, lineHeight: 1.65 }}>
          Formal CS training that underpins secure architecture, algorithms, and
          production-grade web engineering.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {education.map((item, i) => (
          <EducationCard key={item.institution} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
