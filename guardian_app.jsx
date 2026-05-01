import { useState, useEffect, useRef } from "react";

/* ─── DESIGN TOKENS ─── */
const C = {
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

const FONT = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/* ─── GLOBAL STYLES ─── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg0}; font-family: ${FONT.body}; color: ${C.text0}; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { display: none; }
    button { font-family: ${FONT.body}; cursor: pointer; border: none; background: none; color: inherit; }
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scan {
      0% { transform: translateY(0); opacity: 0.6; }
      50% { opacity: 1; }
      100% { transform: translateY(160px); opacity: 0.2; }
    }
    @keyframes sos-pulse {
      0%, 100% { box-shadow: 0 0 0 0 ${C.accentGlow}, 0 0 40px ${C.accentDim}; }
      50% { box-shadow: 0 0 0 20px rgba(232,53,74,0), 0 0 60px rgba(232,53,74,0.3); }
    }
    @keyframes dot-blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.2; }
    }
    @keyframes card-in {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes map-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes route-draw {
      from { stroke-dashoffset: 300; }
      to { stroke-dashoffset: 0; }
    }
  `}</style>
);

/* ─── PHONE FRAME ─── */
const PhoneFrame = ({ children }) => (
  <div style={{
    minHeight: "100vh",
    background: `radial-gradient(ellipse at 30% 20%, rgba(232,53,74,0.06) 0%, transparent 60%),
                 radial-gradient(ellipse at 70% 80%, rgba(74,143,232,0.05) 0%, transparent 60%),
                 ${C.bg0}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  }}>
    <div style={{
      width: 390,
      height: 844,
      background: C.bg1,
      borderRadius: 52,
      overflow: "hidden",
      position: "relative",
      boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px rgba(0,0,0,0.7), 0 0 120px rgba(232,53,74,0.04)`,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 120, height: 34, background: C.bg0,
        borderRadius: "0 0 20px 20px", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
        <div style={{ width: 50, height: 6, borderRadius: 3, background: "#0d0d1a" }} />
      </div>
      {children}
    </div>
  </div>
);

/* ─── STATUS BAR ─── */
const StatusBar = ({ time = "22:14" }) => (
  <div style={{
    height: 44, paddingTop: 14, paddingLeft: 28, paddingRight: 24,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontFamily: FONT.mono, fontSize: 12, fontWeight: 500, color: C.text1, flexShrink: 0,
  }}>
    <span>{time}</span>
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[4, 6, 8, 10].map((h, i) => (
        <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: i < 3 ? C.text0 : C.text2 }} />
      ))}
      <div style={{ width: 16, height: 8, borderRadius: 2, border: `1px solid ${C.text1}`, position: "relative", marginLeft: 3 }}>
        <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: "70%", borderRadius: 1, background: C.safe }} />
        <div style={{ position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)", width: 2, height: 4, background: C.text1, borderRadius: 1 }} />
      </div>
    </div>
  </div>
);

/* ─── TAB BAR ─── */
const TabBar = ({ active, setActive }) => {
  const tabs = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "map", label: "Map", icon: MapIcon },
    { id: "sos", label: "SOS", icon: SOSIcon },
    { id: "contacts", label: "Contacts", icon: ContactsIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div style={{
      height: 82, paddingBottom: 16, paddingLeft: 8, paddingRight: 8,
      background: C.bg1, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0,
    }}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActive(id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          padding: "8px 12px", borderRadius: 16,
          background: active === id ? C.bg3 : "none",
          transition: "all 0.2s",
          opacity: active === id ? 1 : 0.45,
        }}>
          <Icon size={22} color={active === id ? (id === "sos" ? C.accent : C.text0) : C.text1} />
          <span style={{ fontSize: 10, fontWeight: 500, color: active === id ? (id === "sos" ? C.accent : C.text0) : C.text1, letterSpacing: "0.03em" }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

/* ─── ICON COMPONENTS ─── */
const HomeIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);
const MapIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const SOSIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ContactsIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const SettingsIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

/* ══════════════════════════════════════
   SCREEN: HOME
══════════════════════════════════════ */
const RiskArc = ({ score }) => {
  const r = 72, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const filled = arc * (score / 100);
  const color = score < 35 ? C.safe : score < 65 ? C.warn : C.accent;
  const label = score < 35 ? "SAFE" : score < 65 ? "MODERATE" : "HIGH RISK";
  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.bg3} strokeWidth="8"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={-circ * 0.125}
          strokeLinecap="round" transform="rotate(0, 90, 90)" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`} strokeDashoffset={-circ * 0.125}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 12 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 40, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color, marginTop: 4 }}>{label}</span>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const [risk, setRisk] = useState(28);
  const [time, setTime] = useState(new Date());
  const [tracking, setTracking] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const signals = [
    { label: "Location", value: "Indiranagar, Bengaluru", color: C.safe, dot: true },
    { label: "Time risk", value: "22:14 — Night factor ×1.4", color: C.warn, dot: true },
    { label: "Movement", value: "Walking — normal pace", color: C.safe, dot: true },
    { label: "Area safety", value: "Score 7.2 / 10", color: C.safe, dot: true },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, animation: "slide-up 0.5s ease both" }}>
        <div>
          <div style={{ fontSize: 13, color: C.text2, letterSpacing: "0.08em", fontWeight: 500, marginBottom: 4 }}>GOOD EVENING</div>
          <div style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 1.2 }}>Priya</div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: C.bg3, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text1} strokeWidth="1.7" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>
      </div>

      {/* Risk Orb */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28, animation: "fade-in 0.7s ease both 0.15s", animationFillMode: "both", opacity: 0 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle, ${risk < 35 ? C.safeDim : risk < 65 ? C.warnDim : C.accentDim} 0%, transparent 70%)`, animation: "breathe 4s ease-in-out infinite" }} />
          <RiskArc score={risk} />
        </div>
      </div>

      {/* Quick risk adjust (simulates live score) */}
      <div style={{ marginBottom: 20, animation: "slide-up 0.5s ease both 0.25s", animationFillMode: "both", opacity: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.text2, letterSpacing: "0.06em" }}>SIMULATE RISK LEVEL</span>
          <span style={{ fontSize: 12, fontFamily: FONT.mono, color: C.text1 }}>{risk}</span>
        </div>
        <input type="range" min={0} max={100} value={risk} onChange={e => setRisk(Number(e.target.value))}
          style={{ width: "100%", accentColor: risk < 35 ? C.safe : risk < 65 ? C.warn : C.accent, cursor: "pointer" }} />
      </div>

      {/* Signals */}
      <div style={{ marginBottom: 20, animation: "slide-up 0.5s ease both 0.3s", animationFillMode: "both", opacity: 0 }}>
        <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>LIVE SIGNALS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {signals.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < signals.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, marginRight: 12, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.05em" }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.text0, marginTop: 2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: tracking ? C.safeDim : C.bg2, borderRadius: 16, border: `1px solid ${tracking ? "rgba(25,201,125,0.2)" : C.border}`, transition: "all 0.3s", animation: "slide-up 0.5s ease both 0.4s", animationFillMode: "both", opacity: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text0 }}>Guardian mode</div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{tracking ? "Active · monitoring you" : "Paused"}</div>
        </div>
        <button onClick={() => setTracking(!tracking)} style={{
          width: 48, height: 28, borderRadius: 14,
          background: tracking ? C.safe : C.bg4,
          border: `1px solid ${tracking ? C.safe : C.border}`,
          position: "relative", transition: "all 0.25s",
        }}>
          <div style={{
            position: "absolute", top: 3, left: tracking ? 22 : 2, width: 20, height: 20,
            borderRadius: "50%", background: "#fff", transition: "left 0.25s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   SCREEN: MAP
══════════════════════════════════════ */
const MapScreen = () => {
  const [route, setRoute] = useState("safe");
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Map visual */}
      <div style={{ flex: 1, position: "relative", background: "#0a0e15", overflow: "hidden" }}>
        {/* Grid */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <line x1={0} y1={i * 30} x2="100%" y2={i * 30} stroke={C.blue} strokeWidth="0.5" />
              <line x1={i * 30} y1={0} x2={i * 30} y2="100%" stroke={C.blue} strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        {/* Scan line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`, animation: "scan 3s ease-in-out infinite", opacity: 0.5 }} />

        {/* Route SVG */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {/* Unsafe route */}
          <path d="M 70 420 Q 100 380 130 340 Q 160 280 200 240 Q 230 200 260 170" fill="none" stroke={C.accent} strokeWidth={route === "unsafe" ? 3 : 1.5} strokeDasharray="6 4" opacity={route === "unsafe" ? 0.8 : 0.3} strokeLinecap="round" />
          {/* Safe route */}
          <path d="M 70 420 Q 120 400 160 360 Q 200 320 240 290 Q 270 260 280 220 Q 285 200 270 170" fill="none" stroke={C.safe} strokeWidth={route === "safe" ? 3 : 1.5}
            strokeDasharray="300" strokeDashoffset={route === "safe" ? 0 : 0}
            style={{ animation: route === "safe" ? "route-draw 1.5s ease forwards" : "none" }}
            opacity={route === "safe" ? 0.9 : 0.3} strokeLinecap="round" />

          {/* User dot */}
          <circle cx="70" cy="420" r="8" fill={C.blue} opacity="0.9" />
          <circle cx="70" cy="420" r="18" fill={C.blue} opacity="0.15" style={{ animation: "breathe 2s ease-in-out infinite" }} />
          <circle cx="70" cy="420" r="4" fill="#fff" />

          {/* Destination */}
          <circle cx="270" cy="170" r="6" fill={C.safe} />
          <circle cx="270" cy="170" r="14" fill={C.safe} opacity="0.2" />

          {/* Warning zone */}
          <circle cx="180" cy="310" r="30" fill={C.accent} opacity="0.08" stroke={C.accent} strokeWidth="1" strokeDasharray="4 3" />
          <text x="185" y="308" fill={C.accent} fontSize="10" fontFamily={FONT.body} opacity="0.8">⚠</text>
        </svg>

        {/* Risk zones legend */}
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(8,11,16,0.85)", backdropFilter: "blur(8px)", borderRadius: 12, border: `1px solid ${C.border}`, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: C.text2, letterSpacing: "0.08em", marginBottom: 8 }}>AREA RISK</div>
          {[{ c: C.safe, l: "Low" }, { c: C.warn, l: "Moderate" }, { c: C.accent, l: "High" }].map(({ c, l }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c, opacity: 0.8 }} />
              <span style={{ fontSize: 11, color: C.text1 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Location chip */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(8,11,16,0.9)", backdropFilter: "blur(8px)", borderRadius: 20, border: `1px solid ${C.border}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}` }} />
          <span style={{ fontSize: 12, color: C.text0 }}>Indiranagar → MG Road</span>
          <span style={{ fontSize: 11, color: C.safe, fontWeight: 600 }}>1.2 km</span>
        </div>
      </div>

      {/* Route chooser */}
      <div style={{ padding: "16px 20px", background: C.bg1, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.1em", marginBottom: 12 }}>CHOOSE ROUTE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "safe", label: "Safe route", sub: "12 min · well-lit", color: C.safe, icon: "🛡" },
            { id: "unsafe", label: "Fast route", sub: "8 min · risk zone", color: C.accent, icon: "⚡" },
          ].map(({ id, label, sub, color, icon }) => (
            <button key={id} onClick={() => setRoute(id)} style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              background: route === id ? (id === "safe" ? C.safeDim : C.accentDim) : C.bg2,
              border: `1px solid ${route === id ? color : C.border}`,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text0 }}>{label}</div>
              <div style={{ fontSize: 11, color: route === id ? color : C.text2, marginTop: 2 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   SCREEN: SOS
══════════════════════════════════════ */
const SOSScreen = ({ onNavigate }) => {
  const [held, setHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const startHold = () => {
    setHeld(true);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current);
          setTriggered(true);
          let c = 5;
          countdownRef.current = setInterval(() => {
            c--;
            setCountdown(c);
            if (c <= 0) clearInterval(countdownRef.current);
          }, 1000);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  const endHold = () => {
    if (!triggered) {
      setHeld(false);
      clearInterval(intervalRef.current);
      setProgress(0);
    }
  };

  const cancel = () => {
    setTriggered(false);
    setProgress(0);
    setHeld(false);
    setCountdown(5);
    clearInterval(countdownRef.current);
  };

  if (triggered) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: `radial-gradient(circle at 50% 40%, rgba(232,53,74,0.15) 0%, transparent 70%)` }}>
      <div style={{ width: 120, height: 120, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, animation: "sos-pulse 1.5s ease-in-out infinite", boxShadow: `0 0 40px ${C.accentGlow}` }}>
        <span style={{ fontFamily: FONT.display, fontSize: 28, color: "#fff", letterSpacing: 2 }}>SOS</span>
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 32, marginBottom: 8, color: C.accent }}>Alert Sent</div>
      <div style={{ fontSize: 14, color: C.text1, marginBottom: 6 }}>Notifying emergency contacts…</div>
      <div style={{ fontSize: 13, color: C.text2, marginBottom: 32 }}>Live location sharing active</div>

      <div style={{ width: "100%", background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 16 }}>
        {["Meera (Mom)", "Rohan (Brother)", "Ankita (Friend)"].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.bg4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                {c[0]}
              </div>
              <span style={{ fontSize: 13, color: C.text0 }}>{c}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.safe, animation: "dot-blink 1.2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />
              <span style={{ fontSize: 11, color: C.safe }}>Notified</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={cancel} style={{ padding: "14px 40px", borderRadius: 14, background: C.bg3, border: `1px solid ${C.border}`, fontSize: 14, color: C.text1, fontWeight: 500 }}>
        Cancel SOS
      </button>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 0", background: `radial-gradient(ellipse at 50% 30%, rgba(232,53,74,0.05) 0%, transparent 60%)` }}>
      <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.12em", marginBottom: 8 }}>EMERGENCY</div>
      <div style={{ fontFamily: FONT.display, fontSize: 28, marginBottom: 4 }}>Hold to activate</div>
      <div style={{ fontSize: 13, color: C.text2, marginBottom: 48 }}>Hold for 2 seconds to send SOS</div>

      {/* Big SOS button */}
      <div style={{ position: "relative", marginBottom: 48 }}>
        {held && [1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", inset: -(i * 20), borderRadius: "50%",
            border: `1px solid ${C.accent}`, opacity: 0,
            animation: `pulse-ring 1.5s ease-out infinite`, animationDelay: `${i * 0.4}s`,
          }} />
        ))}
        <button
          onMouseDown={startHold} onMouseUp={endHold} onTouchStart={startHold} onTouchEnd={endHold}
          style={{
            width: 180, height: 180, borderRadius: "50%",
            background: held ? C.accent : `radial-gradient(circle, ${C.bg3} 0%, ${C.bg2} 100%)`,
            border: `2px solid ${held ? C.accent : C.border}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", cursor: "pointer",
            boxShadow: held ? `0 0 40px ${C.accentGlow}, inset 0 0 30px rgba(232,53,74,0.2)` : `0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.4)`,
            transform: held ? "scale(0.97)" : "scale(1)",
          }}>
          <span style={{ fontFamily: FONT.display, fontSize: 42, color: held ? "#fff" : C.accent, letterSpacing: 4, lineHeight: 1 }}>SOS</span>
          <span style={{ fontSize: 11, color: held ? "rgba(255,255,255,0.7)" : C.text2, marginTop: 6, letterSpacing: "0.1em" }}>{held ? `${Math.round(progress)}%` : "HOLD"}</span>
        </button>
        {/* Progress ring */}
        <svg style={{ position: "absolute", inset: -4, pointerEvents: "none" }} width="188" height="188" viewBox="0 0 188 188">
          <circle cx="94" cy="94" r="90" fill="none" stroke={C.accent} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 90 * progress / 100} ${2 * Math.PI * 90}`}
            strokeDashoffset={2 * Math.PI * 90 * 0.25}
            strokeLinecap="round" style={{ transition: "stroke-dasharray 0.1s linear", filter: `drop-shadow(0 0 6px ${C.accent})` }} />
        </svg>
      </div>

      {/* Quick actions */}
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "📞", label: "Fake call", sub: "Simulate incoming call" },
          { icon: "🔇", label: "Silent alert", sub: "No sound, notify only" },
          { icon: "📍", label: "Share location", sub: "Send to all contacts" },
          { icon: "🎙", label: "Record audio", sub: "Capture surroundings" },
        ].map(({ icon, label, sub }, i) => (
          <div key={i} style={{ padding: "14px 14px", background: C.bg2, borderRadius: 14, border: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text0 }}>{label}</div>
            <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   SCREEN: CONTACTS
══════════════════════════════════════ */
const ContactsScreen = () => {
  const contacts = [
    { name: "Meera Sharma", rel: "Mother", phone: "+91 98765 43210", active: true, color: "#E8354A" },
    { name: "Rohan Sharma", rel: "Brother", phone: "+91 87654 32109", active: true, color: "#4A8FE8" },
    { name: "Ankita Mehra", rel: "Friend", phone: "+91 76543 21098", active: false, color: "#19C97D" },
    { name: "Divya Nair", rel: "Colleague", phone: "+91 65432 10987", active: true, color: "#F5A623" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, animation: "slide-up 0.4s ease both" }}>
        <div>
          <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.1em", marginBottom: 4 }}>EMERGENCY</div>
          <div style={{ fontFamily: FONT.display, fontSize: 26 }}>Contacts</div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 10, background: C.accentDim, border: `1px solid ${C.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontSize: 20 }}>+</button>
      </div>

      <div style={{ background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20, animation: "slide-up 0.4s ease both 0.1s", animationFillMode: "both", opacity: 0 }}>
        {contacts.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < contacts.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${c.color}22`, border: `1px solid ${c.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: FONT.display, fontSize: 18, color: c.color }}>{c.name[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text0 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{c.rel} · {c.phone}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.active ? C.safe : C.text2, boxShadow: c.active ? `0 0 6px ${C.safe}` : "none" }} />
              <span style={{ fontSize: 11, color: c.active ? C.safe : C.text2 }}>{c.active ? "Active" : "Off"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SOS test */}
      <div style={{ padding: "16px 20px", background: C.accentDim, borderRadius: 16, border: `1px solid rgba(232,53,74,0.2)`, animation: "slide-up 0.4s ease both 0.2s", animationFillMode: "both", opacity: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text0, marginBottom: 4 }}>Test SOS alert</div>
        <div style={{ fontSize: 12, color: C.text2, marginBottom: 14 }}>Send a test to verify all contacts receive alerts correctly</div>
        <button style={{ padding: "10px 20px", borderRadius: 10, background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.03em" }}>
          Send test alert
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   SCREEN: SETTINGS
══════════════════════════════════════ */
const SettingsScreenView = () => {
  const [vals, setVals] = useState({ guardian: true, noise: false, gesture: true, checkin: true, share: false });
  const toggle = k => setVals(v => ({ ...v, [k]: !v[k] }));

  const sections = [
    {
      title: "Safety",
      items: [
        { key: "guardian", label: "Guardian AI", sub: "Continuous background monitoring" },
        { key: "noise", label: "Distress detection", sub: "Detect screams and panic voice" },
        { key: "gesture", label: "Gesture SOS", sub: "Triple press volume to trigger" },
        { key: "checkin", label: "Check-in timer", sub: "Prompt if not checked in" },
      ],
    },
    {
      title: "Privacy",
      items: [
        { key: "share", label: "Always share location", sub: "With contacts continuously" },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 24, animation: "slide-up 0.4s ease both" }}>
        <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.1em", marginBottom: 4 }}>PREFERENCES</div>
        <div style={{ fontFamily: FONT.display, fontSize: 26 }}>Settings</div>
      </div>

      {/* Profile card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 20, animation: "slide-up 0.4s ease both 0.1s", animationFillMode: "both", opacity: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}44, ${C.blue}44)`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: FONT.display, fontSize: 22, color: C.text0 }}>P</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text0 }}>Priya Sharma</div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>+91 98123 45678</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: C.accent, fontWeight: 600 }}>Edit</div>
      </div>

      {sections.map(({ title, items }, si) => (
        <div key={title} style={{ marginBottom: 16, animation: `slide-up 0.4s ease both ${0.2 + si * 0.1}s`, animationFillMode: "both", opacity: 0 }}>
          <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.1em", marginBottom: 10 }}>{title.toUpperCase()}</div>
          <div style={{ background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {items.map(({ key, label, sub }, i) => (
              <div key={key} onClick={() => toggle(key)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text0 }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>{sub}</div>
                </div>
                <div style={{ width: 44, height: 26, borderRadius: 13, background: vals[key] ? C.safe : C.bg4, border: `1px solid ${vals[key] ? C.safe : C.border}`, position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: vals[key] ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* App info */}
      <div style={{ padding: "14px 18px", background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slide-up 0.4s ease both 0.4s", animationFillMode: "both", opacity: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text0 }}>Guardian App</div>
          <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>Version 1.0.0 MVP</div>
        </div>
        <div style={{ fontSize: 11, fontFamily: FONT.mono, color: C.text2 }}>Privacy-first</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   ROOT APP
══════════════════════════════════════ */
export default function GuardianApp() {
  const [screen, setScreen] = useState("home");

  const screens = {
    home: <HomeScreen />,
    map: <MapScreen />,
    sos: <SOSScreen />,
    contacts: <ContactsScreen />,
    settings: <SettingsScreenView />,
  };

  return (
    <>
      <GlobalStyle />
      <PhoneFrame>
        <StatusBar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screens[screen]}
        </div>
        <TabBar active={screen} setActive={setScreen} />
      </PhoneFrame>
    </>
  );
}
