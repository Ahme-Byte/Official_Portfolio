/** Shared design tokens — 70% full-stack / 30% security */

export { links } from "./config/data.js";

export const theme = {
  bg: "#0B0F17",
  bgElevated: "#121826",
  surface: "rgba(18, 24, 38, 0.72)",
  surfaceSolid: "#151B2B",
  text: "#F3F5F9",
  textMuted: "#9AA3B2",
  textDim: "#64708A",
  accent: "#38BDF8",
  accentDim: "#0EA5E9",
  accentSoft: "rgba(56, 189, 248, 0.12)",
  indigo: "#6366F1",
  indigoSoft: "rgba(99, 102, 241, 0.14)",
  secure: "#34D399",
  secureSoft: "rgba(52, 211, 153, 0.12)",
  warn: "#F87171",
  amber: "#FBBF24",
  border: "rgba(148, 163, 184, 0.14)",
  borderStrong: "rgba(148, 163, 184, 0.28)",
  white: "#FFFFFF",
  accentV: 0x38bdf8,
  indigoV: 0x6366f1,
  secureV: 0x34d399,
  bgV: 0x0b0f17,
  slateV: 0x1e293b,
  metal: 0x94a3b8,
};

export const fonts = {
  sans: '"Outfit", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const ease = [0.16, 1, 0.3, 1];
