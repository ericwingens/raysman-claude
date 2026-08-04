import React from "react";
// Shared helpers: deterministic gradient "photos", currency, icons.

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function grad(seed) {
  const h = hashStr(seed),
    a = h % 360,
    b = (a + 40 + (h % 60)) % 360,
    c = (a + 180 + (h % 40)) % 360;
  return (
    `radial-gradient(120% 100% at 20% 12%, hsl(${a} 78% 66%), transparent 55%),` +
    `radial-gradient(120% 120% at 88% 20%, hsl(${b} 72% 58%), transparent 55%),` +
    `linear-gradient(155deg, hsl(${c} 55% 42%), hsl(${(c + 30) % 360} 60% 30%))`
  );
}

// Real demo photos (AI-generated fictional people, shipped in public/img/).
const PHOTO_IDS = ["amira", "nadia", "sofia", "jana", "mia", "lea", "you"]; // longest-prefix-safe order
const POST_PHOTO = { p1: "mia", p2: "nadia", p3: "sofia", p4: "lea" };
const IMG_BASE = `${import.meta.env.BASE_URL}img/`;
// Slight per-seed crop variation so galleries don't look like one repeated image.
// Faces are centered in the source crops — vary only the vertical offset slightly.
const POSITIONS = ["center 22%", "center 15%", "center 28%", "center 18%", "center 25%"];

export function photoStyle(seed) {
  const hit = PHOTO_IDS.find((p) => seed === p || seed.startsWith(p)) || POST_PHOTO[seed];
  if (hit) {
    return {
      backgroundImage: `url(${IMG_BASE}${hit}.jpg)`,
      backgroundColor: "#333",
      backgroundSize: "cover",
      backgroundPosition: POSITIONS[hashStr(seed) % POSITIONS.length],
    };
  }
  return { backgroundImage: grad(seed), backgroundColor: "#333", backgroundSize: "cover" };
}

export const EUR = (n) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export const num = (n) => n.toLocaleString("de-DE");

const SVG = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.58 3.6a1 1 0 0 1-.25 1Z"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5 21.5 7v10l-6-3.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17 19 7"/></svg>',
  verif: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6.9 2.6-2 1.8-.5 2.6-2.6.4L13.8 22 12 20.6 10.2 22 8.1 20.3l-2.6-.4-.5-2.6-2-1.8.9-2.6-.6-2.6L5.4 6l1-2.5 2.7.2Z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.7L3 21l1.8-5.4A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" fill="currentColor" stroke="none"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5M3 16.5l9 5 9-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4.5 12 8 12 8Zm0 0s1.5-5 4-3.5S12 8 12 8Z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.7L3 21l1.8-5.4A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  camflip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3.5A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4H9"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4l2-2M12 6 10 4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
};

// Renders an inline SVG icon. display:contents so the <svg> is the layout child.
export function Ico({ name }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: SVG[name] || "" }} />;
}

/* Ring brand logo — glossy sphere emblem + vector-drawn "ring" wordmark.
   Drawn rather than typeset so it renders identically on every device. */
let _lgId = 0;

function Emblem({ u }) {
  return (
    <>
      <defs>
        <radialGradient id={`sph${u}`} cx="35%" cy="27%" r="80%">
          <stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#fcfcfc" />
          <stop offset=".84" stopColor="#eaeaec" /><stop offset="1" stopColor="#d4d4d7" />
        </radialGradient>
        <linearGradient id={`or${u}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#E23A12" /><stop offset=".45" stopColor="#F26B1D" /><stop offset="1" stopColor="#FBA43A" />
        </linearGradient>
        <linearGradient id={`gl${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`cc${u}`}><circle cx="50" cy="50" r="47" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill={`url(#sph${u})`} />
      <g clipPath={`url(#cc${u})`}>
        <path d="M 67 23 A 32 32 0 1 0 78 52" stroke={`url(#or${u})`} strokeWidth="12.5" fill="none" strokeLinecap="round" />
        <path d="M 62 38 A 19 19 0 1 0 67 54" stroke={`url(#or${u})`} strokeWidth="10.5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="52" r="6" fill={`url(#or${u})`} />
      </g>
      <ellipse cx="41" cy="23" rx="29" ry="15" fill={`url(#gl${u})`} opacity=".5" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#0000000d" strokeWidth="1" />
    </>
  );
}

const Wordmark = () => (
  <>
    <g fill="none" stroke="currentColor" strokeWidth="14.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 84 V 43" /><path d="M11 52 Q 11 36 31 36" /><path d="M57 84 V 36" />
      <path d="M85 84 V 43" /><path d="M85 52 Q 85 36 103 36 Q 121 36 121 54 V 84" />
      <circle cx="172" cy="58" r="22" /><path d="M194 40 V 90 Q 194 104 178 104 Q 167 104 161 97" />
    </g>
    <circle cx="57" cy="17" r="7.6" fill="currentColor" />
  </>
);

// Emblem only (square).
export function RingLogo({ size = 34 }) {
  const u = React.useMemo(() => ++_lgId, []);
  return <svg className="ringmark" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><Emblem u={u} /></svg>;
}

// Full lockup: emblem + wordmark.
export function RingLockup({ height = 34 }) {
  const u = React.useMemo(() => ++_lgId, []);
  return (
    <svg className="ringmark" height={height} viewBox="0 0 340 115" role="img" aria-label="ring" style={{ color: "var(--ink)" }}>
      <g transform="translate(0,7)"><Emblem u={u} /></g>
      <g transform="translate(120,0)"><Wordmark /></g>
    </svg>
  );
}
