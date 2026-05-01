/* ─── DESIGN TOKENS ─── */
export const C = {
  bg0: "#080B10",
  bg1: "#0E1218",
  bg2: "#141820",
  bg3: "#1C2230",
  bg4: "#232B3A",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text0: "#F0F4FF",
  text1: "#A8B4CC",
  text2: "#5A6478",
  accent: "#E8354A",
  accentDim: "rgba(232,53,74,0.12)",
  accentGlow: "rgba(232,53,74,0.35)",
  safe: "#19C97D",
  safeDim: "rgba(25,201,125,0.1)",
  warn: "#F5A623",
  warnDim: "rgba(245,166,35,0.1)",
  blue: "#4A8FE8",
  blueDim: "rgba(74,143,232,0.1)",
};

export const FONT = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/* ─── RISK THRESHOLDS ─── */
export const RISK_THRESHOLDS = {
  LOW: 35,
  MODERATE: 65,
};

/* ─── DEFAULT CONTACTS ─── */
export const DEFAULT_CONTACTS = [
  { name: "Meera Sharma", rel: "Mother", phone: "+91 98765 43210", active: true, color: "#E8354A" },
  { name: "Rohan Sharma", rel: "Brother", phone: "+91 87654 32109", active: true, color: "#4A8FE8" },
  { name: "Ankita Mehra", rel: "Friend", phone: "+91 76543 21098", active: false, color: "#19C97D" },
  { name: "Divya Nair", rel: "Colleague", phone: "+91 65432 10987", active: true, color: "#F5A623" },
];

/* ─── SOS CONFIG ─── */
export const SOS_CONFIG = {
  HOLD_DURATION_MS: 2000, // 2 seconds to trigger
  PROGRESS_INTERVAL_MS: 100,
  PROGRESS_STEP: 5,
  COUNTDOWN_START: 5,
};
