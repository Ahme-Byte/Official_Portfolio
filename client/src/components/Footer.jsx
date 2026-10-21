import { useEffect, useState } from "react";
import { theme, fonts } from "../theme";
import {
  profile,
  links,
  navLinks,
  securityBadges,
  footer as footerCopy,
} from "../config/data";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { duration: 1.15 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [ping, setPing] = useState(12);

  useEffect(() => {
    const id = setInterval(() => {
      setPing(8 + Math.floor(Math.random() * 18));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const socials = [
    { label: "GitHub", href: links.github },
    { label: "LinkedIn", href: links.linkedin },
    { label: "Email", href: `mailto:${links.email}` },
  ];

  return (
    <footer
      className="site-footer"
      style={{
        position: "relative",
        zIndex: 10,
        borderTop: `1px solid ${theme.border}`,
        background: "rgba(9, 12, 20, 0.95)",
        overflow: "hidden",
        maxWidth: "100vw",
      }}
    >
      <div
        style={{
          padding: "3rem clamp(1.25rem, 5vw, 4rem) 2rem",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "2rem",
        }}
      >
        {/* Col 1 — bio */}
        <div>
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            {profile.name}
          </div>
          <p
            style={{
              margin: "0 0 1rem",
              color: theme.textMuted,
              fontSize: "0.85rem",
              lineHeight: 1.6,
              maxWidth: 280,
            }}
          >
            {footerCopy.bio}
          </p>
          <div
            className="font-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.65rem",
              color: theme.secure,
              background: theme.secureSoft,
              border: `1px solid rgba(52,211,153,0.28)`,
              padding: "0.45rem 0.75rem",
              borderRadius: 999,
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: theme.secure,
                boxShadow: `0 0 8px ${theme.secure}`,
              }}
            />
            {profile.availability}
          </div>
        </div>

        {/* Col 2 — nav */}
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: "0.65rem",
              color: theme.textDim,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}
          >
            Navigate
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 8,
            }}
          >
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => scrollToId(link.id)}
                  className="font-mono"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.textMuted,
                    fontSize: "0.8rem",
                    padding: 0,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.textMuted;
                  }}
                >
                  {link.hash}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — security */}
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: "0.65rem",
              color: theme.textDim,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}
          >
            Security & standards
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {securityBadges.map((b) => (
              <span
                key={b.id}
                className="font-mono"
                style={{
                  fontSize: "0.72rem",
                  color: theme.secure,
                  background: theme.secureSoft,
                  border: `1px solid rgba(52,211,153,0.25)`,
                  padding: "0.4rem 0.65rem",
                  borderRadius: 8,
                  width: "fit-content",
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Col 4 — socials */}
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: "0.65rem",
              color: theme.textDim,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}
          >
            Connect
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  color: theme.accent,
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 550,
                }}
              >
                {s.label}
              </a>
            ))}
            <div
              className="font-mono"
              style={{ fontSize: "0.7rem", color: theme.textDim, marginTop: 8 }}
            >
              {profile.location}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: `1px solid ${theme.border}`,
          padding: "1rem clamp(1.25rem, 5vw, 4rem)",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem 1.5rem",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.72rem",
          color: theme.textDim,
          fontFamily: fonts.mono,
        }}
      >
        <span>
          © {year} · {profile.name}
        </span>
        <span style={{ color: theme.textMuted }}>
          server · ping {ping}ms · systems nominal
        </span>
        <span>{footerCopy.builtWith}</span>
      </div>
    </footer>
  );
}
