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
  /* Brand marks for the share sheet, drawn as single-colour glyphs. */
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82a4.83 4.83 0 0 1-1.03-.9 4.96 4.96 0 0 1-1.1-2.42h-3.3v13.2a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 1 1 .8-5.68v-3.32a6.2 6.2 0 0 0-.8-.05A6.2 6.2 0 1 0 14.5 15V8.42a8.2 8.2 0 0 0 4.8 1.53V6.62a4.8 4.8 0 0 1-2.7-.8Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.6"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  snapchat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c2.9 0 4.87 2.15 4.87 5.06 0 1.05-.08 1.93-.18 2.53.5.28 1.15.2 1.63.02.4-.14.8.06.92.45.12.39-.09.8-.48.98-.58.28-1.35.58-1.74.96.29 1.27 1.56 2.53 3 2.92.39.1.6.5.48.88-.2.6-1.26.9-2.32 1.07-.1.3-.19.68-.29.97-.1.3-.4.48-.7.4-.48-.1-1.06-.2-1.73-.1-.68.1-1.16.48-1.74.86-.58.39-1.16.77-1.93.77s-1.35-.38-1.93-.77c-.58-.38-1.06-.76-1.74-.86-.67-.1-1.25 0-1.73.1-.3.08-.6-.1-.7-.4-.1-.29-.19-.67-.29-.97-1.06-.17-2.12-.47-2.32-1.07-.12-.38.09-.78.48-.88 1.44-.39 2.71-1.65 3-2.92-.39-.38-1.16-.68-1.74-.96-.39-.18-.6-.59-.48-.98.12-.39.52-.59.92-.45.48.18 1.13.26 1.63-.02-.1-.6-.18-1.48-.18-2.53C7.13 4.35 9.1 2.2 12 2.2Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8.2h2.74l.41-3.18H13.5V8.58c0-.92.26-1.55 1.58-1.55h1.68V4.18A22.6 22.6 0 0 0 14.3 4.06c-2.42 0-4.08 1.48-4.08 4.2v2.36H7.47v3.18h2.75V22Z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 5.33a15.4 15.4 0 0 0-3.84-1.2l-.24.48a14.3 14.3 0 0 0-7.04 0l-.24-.48a15.4 15.4 0 0 0-3.84 1.2C1.94 8.93 1.3 12.46 1.67 15.9a15.5 15.5 0 0 0 4.66 2.4l.56-.85a10 10 0 0 1-1.57-.76l.38-.29a11 11 0 0 0 9.4 0l.38.29a10 10 0 0 1-1.57.76l.56.85a15.5 15.5 0 0 0 4.66-2.4c.45-3.98-.57-7.48-2.53-10.57ZM8.3 13.9c-.92 0-1.68-.85-1.68-1.9 0-1.04.74-1.9 1.68-1.9.95 0 1.7.86 1.68 1.9 0 1.05-.74 1.9-1.68 1.9Zm7.4 0c-.92 0-1.68-.85-1.68-1.9 0-1.04.74-1.9 1.68-1.9.95 0 1.7.86 1.68 1.9 0 1.05-.73 1.9-1.68 1.9Z"/></svg>',
  twitch: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.3 2 2.5 6.2v13.1h4.5V22h2.6l2.7-2.7h3.6L21.5 14V2Zm15.4 11.3-2.6 2.6h-4.5l-2.6 2.6v-2.6H6.6V3.7h13.1Z"/><path d="M14.6 7h1.7v4.8h-1.7Zm-4.4 0h1.7v4.8h-1.7Z"/></svg>',
  xcom: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.7 2.25h3.3l-7.2 8.24L22.3 21.75h-6.63l-5.2-6.79-5.94 6.79H1.22l7.7-8.8L1.7 2.25h6.8l4.7 6.2Zm-1.16 17.5h1.83L7.55 4.14H5.58Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 5h11l-1.6 3.5L16 12H5"/></svg>',
  block: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2"/></svg>',
};

/* Voice-message waveform: bar heights in px. Random on purpose — a recording
   that always looked the same would read as a placeholder. */
export const voiceBars = (n = 26) => Array.from({ length: n }, () => 5 + Math.round(Math.random() * 17));

// Playback/record position as m:ss.
export const vtime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Renders an inline SVG icon. display:contents so the <svg> is the layout child.
export function Ico({ name }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: SVG[name] || "" }} />;
}

/* Ring brand logo — the client's official artwork (sphere emblem + "ring
   meApp" wordmark) as vector, so it stays sharp at any size. */

// Full lockup: emblem + wordmark. `height` drives size; width follows artwork.
export function RingLockup({ height = 46 }) {
  return <img className="ringmark" src={`${IMG_BASE}ring-logo.svg`} alt="ring meApp"
    style={{ height, width: "auto", display: "block" }} />;
}

// Emblem only (square) — tight spots and the app icon.
export function RingLogo({ size = 34 }) {
  return <img className="ringmark" src={`${IMG_BASE}ring-mark.svg`} alt="ring meApp"
    style={{ height: size, width: size, display: "block" }} />;
}
