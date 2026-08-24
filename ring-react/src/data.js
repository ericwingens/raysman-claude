// Demo data for the Ring prototype. Replace with API calls in production.
// Profile photos: AI-generated fictional people (100k-faces / generated.photos) — no real persons.

export const CREATORS = [
  { id: "mia", name: "Mia", age: 24, city: "Berlin", dist: 2, tags: ["Fitness", "Lifestyle"], rate: 1.99, online: true, live: true, verified: true, followers: "48.2k", subs: 12800, bio: "Personal trainerin & content creatorin. Ich zeige dir meine Home-Workouts, koche live und quatsche gern per Call. 💪🔥" },
  { id: "lea", name: "Lea", age: 27, city: "Hamburg", dist: 5, tags: ["Musik", "Producerin"], rate: 1.49, online: true, live: false, verified: true, followers: "31.9k", subs: 8400, bio: "Producerin aus Hamburg. Exklusive Beats, Studio-Sessions und 1:1 Feedback zu deinen Tracks." },
  { id: "nadia", name: "Nadia", age: 23, city: "Köln", dist: 8, tags: ["Art", "Cosplay"], rate: 2.49, online: false, live: false, verified: true, followers: "64.1k", subs: 19200, bio: "Illustratorin & Cosplayerin. Behind-the-scenes, Speedpaints und persönliche Voice-Calls. ✨" },
  { id: "jana", name: "Jana", age: 29, city: "München", dist: 12, tags: ["Reisen", "Foto"], rate: 0.99, online: true, live: false, verified: false, followers: "12.7k", subs: 3900, bio: "Reisefotografin. Ich nehme dich mit auf Trips und teile meine besten Foto-Presets." },
  { id: "sofia", name: "Sofia", age: 26, city: "Wien", dist: 22, tags: ["Yoga", "Wellness"], rate: 1.79, online: true, live: true, verified: true, followers: "55.4k", subs: 16700, bio: "Yoga-Lehrerin. Morgen-Flows, geführte Meditationen und entspannte Late-Night-Calls. 🧘‍♀️" },
  { id: "amira", name: "Amira", age: 25, city: "Frankfurt", dist: 3, tags: ["Gaming", "Tech"], rate: 1.29, online: false, live: false, verified: true, followers: "22.3k", subs: 7100, bio: "Full-time Streamerin. Coaching in Valorant & CS, plus exklusive Gaming-Nights nur für Subs." },
];

export const byId = (id) => CREATORS.find((c) => c.id === id);

/* Free trial minutes. Granted once per creator, not once per call — otherwise
   a fan could hang up and redial forever. */
export const FREE_SECS = 180;

/* ---------------------------------------------------------------------------
 * Marketplace layer: what a creator sells, how well they deliver, and how they
 * rank. Attached by id so the CREATORS rows above stay readable.
 * ------------------------------------------------------------------------- */

// Bookable packages. `mins` drives the price shown; calls stay per-minute.
export const SERVICES = {
  mia:   [{ id: "s1", name: "Workout-Session 1:1", mins: 30, price: 39, desc: "Live-Training per Video, auf dich zugeschnitten." },
          { id: "s2", name: "Ernährungsplan-Call", mins: 20, price: 25, desc: "Wir gehen deine Woche durch und planen Mahlzeiten." }],
  lea:   [{ id: "s1", name: "Track-Feedback", mins: 30, price: 45, desc: "Schick mir deinen Track, wir hören ihn zusammen durch." },
          { id: "s2", name: "Studio-Session", mins: 60, price: 89, desc: "Wir bauen gemeinsam einen Beat von null auf." }],
  nadia: [{ id: "s1", name: "Speedpaint & Chat", mins: 45, price: 55, desc: "Ich zeichne live, du fragst was du willst." },
          { id: "s2", name: "Cosplay-Beratung", mins: 30, price: 35, desc: "Materialwahl, Schnitt und Umsetzung für dein Kostüm." }],
  jana:  [{ id: "s1", name: "Foto-Feedback", mins: 20, price: 19, desc: "Deine Bilder, ehrliches Feedback, konkrete Tipps." },
          { id: "s2", name: "Reiseplanung", mins: 45, price: 49, desc: "Wir planen deinen Trip inklusive Fotospots." }],
  sofia: [{ id: "s1", name: "Yoga 1:1", mins: 45, price: 52, desc: "Geführte Session in deinem Tempo." },
          { id: "s2", name: "Meditation am Abend", mins: 20, price: 22, desc: "Runterkommen vor dem Schlafen." }],
  amira: [{ id: "s1", name: "Valorant-Coaching", mins: 60, price: 59, desc: "VOD-Review und Live-Runden mit Ansage." },
          { id: "s2", name: "Setup-Beratung", mins: 30, price: 29, desc: "Hardware, Settings und Crosshair für dein Budget." }],
};

// Delivery quality. Percentages; `repeat` is the share of returning customers.
export const STATS = {
  mia:   { response: 98, completion: 99, repeat: 47, calls: 1284, level: 9,  badges: ["top", "fast"] },
  lea:   { response: 94, completion: 97, repeat: 38, calls: 612,  level: 7,  badges: ["fast"] },
  nadia: { response: 91, completion: 96, repeat: 52, calls: 940,  level: 8,  badges: ["top", "loyal"] },
  jana:  { response: 88, completion: 93, repeat: 24, calls: 187,  level: 4,  badges: ["new"] },
  sofia: { response: 97, completion: 98, repeat: 44, calls: 1102, level: 9,  badges: ["top", "loyal"] },
  amira: { response: 85, completion: 95, repeat: 31, calls: 421,  level: 6,  badges: [] },
};

export const BADGES = {
  top:   { label: "Top-Creator", em: "🏆" },
  fast:  { label: "Antwortet schnell", em: "⚡" },
  loyal: { label: "Viele Stammgäste", em: "💛" },
  new:   { label: "Neu dabei", em: "🌱" },
};

// Level thresholds are cosmetic in the prototype; the label is what users read.
export const levelLabel = (lvl) =>
  lvl >= 9 ? "Elite" : lvl >= 7 ? "Profi" : lvl >= 5 ? "Erfahren" : "Aufsteiger";

export const REVIEWS = {
  mia:   [{ id: "r1", by: "Tom", stars: 5, when: "vor 2 Tagen", text: "Super Session, hat sich richtig Zeit genommen. Direkt wieder gebucht." },
          { id: "r2", by: "Sarah", stars: 5, when: "vor 1 Woche", text: "Sehr motivierend und geduldig. Der Plan passt genau zu meinem Alltag." },
          { id: "r3", by: "Kevin", stars: 4, when: "vor 2 Wochen", text: "Guter Call, kam nur ein paar Minuten später los." }],
  lea:   [{ id: "r1", by: "Nils", stars: 5, when: "vor 3 Tagen", text: "Ehrliches Feedback ohne Blabla. Mein Mix klingt jetzt deutlich besser." },
          { id: "r2", by: "Mo", stars: 4, when: "vor 2 Wochen", text: "Viel gelernt, hätte nur gern noch länger gemacht." }],
  nadia: [{ id: "r1", by: "Lisa", stars: 5, when: "gestern", text: "Wahnsinnig sympathisch und die Tipps zum Wig-Styling waren Gold wert." },
          { id: "r2", by: "Jan", stars: 5, when: "vor 5 Tagen", text: "Zuschauen und dabei was lernen — top." }],
  jana:  [{ id: "r1", by: "Ben", stars: 4, when: "vor 4 Tagen", text: "Ehrliches Feedback zu meinen Bildern, sehr hilfreich." }],
  sofia: [{ id: "r1", by: "Anna", stars: 5, when: "vor 1 Tag", text: "So entspannt eingeschlafen wie lange nicht." },
          { id: "r2", by: "Chris", stars: 5, when: "vor 6 Tagen", text: "Nimmt Rücksicht auf Einschränkungen, sehr angenehm." },
          { id: "r3", by: "Petra", stars: 4, when: "vor 2 Wochen", text: "Schöne Session, Ton war kurz mal weg." }],
  amira: [{ id: "r1", by: "Deniz", stars: 5, when: "vor 3 Tagen", text: "Endlich mal jemand der sagt was ich falsch mache. Rang gestiegen." },
          { id: "r2", by: "Flo", stars: 4, when: "vor 1 Woche", text: "Gutes Coaching, Termin war etwas kurzfristig verschoben." }],
};

export const rating = (id, all = REVIEWS) => {
  const rs = all[id] || [];
  if (!rs.length) return { avg: 0, count: 0 };
  return { avg: rs.reduce((s, r) => s + r.stars, 0) / rs.length, count: rs.length };
};


/* Report reasons. Ordered by how often they occur in practice, with the two
   that trigger an immediate human review (minors, scam) kept visible. */
export const REPORT_REASONS = [
  { id: "harass", label: "Belästigung oder Beleidigung" },
  { id: "nudity", label: "Nacktheit oder sexuelle Inhalte" },
  { id: "scam",   label: "Betrug oder Geldforderung" },
  { id: "fake",   label: "Fake-Profil oder gestohlene Identität" },
  { id: "minor",  label: "Person wirkt minderjährig" },
  { id: "spam",   label: "Spam oder Werbung" },
  { id: "other",  label: "Etwas anderes" },
];

// Share destinations for a post. `ink` is the glyph colour on the brand tile.
export const SHARE_TARGETS = [
  { id: "tiktok",    name: "TikTok",    bg: "#010101", ink: "#fff" },
  { id: "instagram", name: "Instagram", bg: "linear-gradient(135deg,#833AB4,#FD1D1D 55%,#FCB045)", ink: "#fff" },
  { id: "snapchat",  name: "Snapchat",  bg: "#FFFC00", ink: "#111" },
  { id: "facebook",  name: "Facebook",  bg: "#1877F2", ink: "#fff" },
  { id: "discord",   name: "Discord",   bg: "#5865F2", ink: "#fff" },
  { id: "twitch",    name: "Twitch",    bg: "#9146FF", ink: "#fff" },
  { id: "xcom",      name: "X",         bg: "#0F1419", ink: "#fff" },
];

// Virtual gifts, sent during a call or a live view. Prices in EUR, ordered
// cheapest first so the grid reads as a ladder.
export const GIFTS = [
  { id: "spark",     em: "✨", name: "Funken",        price: 0.49 },
  { id: "hands",     em: "🫶", name: "Herz-Hände",    price: 0.99 },
  { id: "boba",      em: "🧋", name: "Bubble Tea",    price: 1.49 },
  { id: "chill",     em: "🧊", name: "Chill",         price: 1.99 },
  { id: "fire",      em: "🔥", name: "Feuer",         price: 2.99 },
  { id: "wave",      em: "🌊", name: "Welle",         price: 3.99 },
  { id: "heart",     em: "🩷", name: "Herz",          price: 4.99 },
  { id: "phones",    em: "🎧", name: "Kopfhörer",     price: 6.99 },
  { id: "star",      em: "🌟", name: "Star",          price: 9.99 },
  { id: "disco",     em: "🪩", name: "Discokugel",    price: 12.99 },
  { id: "butterfly", em: "🦋", name: "Butterfly",     price: 14.99 },
  { id: "gem",       em: "💎", name: "Diamant",       price: 19.99 },
  { id: "crown",     em: "👑", name: "Krone",         price: 24.99 },
  { id: "trophy",    em: "🏆", name: "Trophäe",       price: 34.99 },
  { id: "ufo",       em: "🛸", name: "UFO",           price: 39.99 },
  { id: "rocket",    em: "🚀", name: "Rakete",        price: 49.99 },
  { id: "dragon",    em: "🐉", name: "Drache",        price: 79.99 },
  { id: "galaxy",    em: "🌌", name: "Galaxie",       price: 149.99 },
];

// Leaderboard score: delivered calls weighted by rating, so quality beats volume.
export const leaderboard = (all = REVIEWS) =>
  CREATORS.map((c) => {
    const st = STATS[c.id], r = rating(c.id, all);
    return { ...c, score: Math.round(st.calls * (r.avg || 4) * (st.completion / 100)) };
  }).sort((a, b) => b.score - a.score);

/* Availability: seven days from today, a few slots each. Deterministic per
   creator so the calendar looks stable across re-renders. */
export const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const SLOT_POOL = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];

export function availability(id, dayOffset) {
  let h = 0;
  for (const ch of id + dayOffset) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SLOT_POOL.filter((_, i) => (h >> i) & 1);
}

export function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return { key: offset, dow: DAYS[d.getDay()], num: d.getDate(), today: offset === 0 };
}

/* ---------------------------------------------------------------------------
 * Creator studio: the other side of the app. Everything below describes the
 * signed-in user's own creator account, not a creator they browse.
 * ------------------------------------------------------------------------- */

// Ring keeps 20 %, the creator keeps the rest. Shown wherever a price is set.
export const FEE = 0.2;

export const RATE_STEPS = [0.99, 1.29, 1.79, 2.49, 2.99];
export const STUDIO_SLOTS = SLOT_POOL;

// Editable in the studio; the defaults below are what a new account starts with.
export const CREATOR_ME = {
  rate: 1.79,
  services: [
    { id: "m1", name: "Kennenlern-Call", mins: 15, price: 19, desc: "Locker quatschen, ohne festes Programm." },
    { id: "m2", name: "Foto-Feedback", mins: 30, price: 35, desc: "Deine Bilder, ehrliche Meinung, konkrete Tipps." },
  ],
  days: [false, true, true, true, true, true, false], // So … Sa
  slots: ["17:00", "19:00", "21:00"],
  iban: "DE89 •••• •••• 4021",
  nextPayout: "1. des Monats",
};

export const EARNINGS = { today: 84.2, week: 612.4, month: 2380.9, total: 18420.35, calls: 342, mins: 1184, gifts: 486.2, subs: 27 };

export const SUPPORTERS = [
  { name: "Tom",   amt: 249.9, since: "seit 4 Monaten", calls: 21 },
  { name: "Sarah", amt: 188.4, since: "seit 7 Monaten", calls: 16 },
  { name: "Kevin", amt: 132.1, since: "seit 2 Monaten", calls: 9 },
  { name: "Nils",  amt: 96.5,  since: "seit 1 Monat",   calls: 7 },
  { name: "Lisa",  amt: 74.0,  since: "seit 3 Wochen",  calls: 5 },
];

export const CREATOR_BOOKINGS = [
  { who: "Tom",   svc: "Foto-Feedback",   when: "Heute",   time: "19:00", mins: 30, price: 35 },
  { who: "Lisa",  svc: "Kennenlern-Call", when: "Morgen",  time: "17:00", mins: 15, price: 19 },
  { who: "Sarah", svc: "Foto-Feedback",   when: "Do. 27.", time: "21:00", mins: 30, price: 35 },
];

export const PAYOUTS = [
  { when: "01.08.2026", amt: 1840.2,  state: "ausgezahlt" },
  { when: "01.07.2026", amt: 1512.75, state: "ausgezahlt" },
  { when: "01.06.2026", amt: 1290.0,  state: "ausgezahlt" },
];

/* ---------------------------------------------------------------------------
 * The phone book the user imports during registration. `ring` holds the id of
 * the ring meApp member this contact turned out to be — null means the number
 * matched nobody. Numbers are shown partly masked, the way a real client would
 * render them after the server answered with hashes only.
 * ------------------------------------------------------------------------- */
export const PHONE_CONTACTS = [
  { id: "k1",  name: "Mia Bergmann",     phone: "+49 151 •••• 4021", ring: "mia" },
  { id: "k2",  name: "Tobias Reinhardt", phone: "+49 170 •••• 8834", ring: null },
  { id: "k3",  name: "Lea Hoffmann",     phone: "+49 176 •••• 2290", ring: "lea" },
  { id: "k4",  name: "Katrin Selke",     phone: "+49 152 •••• 6617", ring: null },
  { id: "k5",  name: "Sofia Kraus",      phone: "+43 664 •••• 3105", ring: "sofia" },
  { id: "k6",  name: "Daniel Ortmann",   phone: "+49 171 •••• 5522", ring: null },
  { id: "k7",  name: "Nadia El Amrani",  phone: "+49 157 •••• 7748", ring: "nadia" },
  { id: "k8",  name: "Bea Lindqvist",    phone: "+49 160 •••• 9031", ring: null },
  { id: "k9",  name: "Jana Weiß",        phone: "+49 175 •••• 1284", ring: "jana" },
  { id: "k10", name: "Marc Steinhoff",   phone: "+49 162 •••• 4470", ring: null },
  { id: "k11", name: "Amira Yildiz",     phone: "+49 159 •••• 6693", ring: "amira" },
  { id: "k12", name: "Philipp Kern",     phone: "+49 173 •••• 2058", ring: null },
  { id: "k13", name: "Nora Bachmann",    phone: "+49 155 •••• 8812", ring: null },
  { id: "k14", name: "Sven Röder",       phone: "+49 178 •••• 3367", ring: null },
  { id: "k15", name: "Elif Demir",       phone: "+49 163 •••• 7124", ring: null },
  { id: "k16", name: "Jonas Prantl",     phone: "+43 699 •••• 5540", ring: null },
];

export const onRing = PHONE_CONTACTS.filter((c) => c.ring);
export const notOnRing = PHONE_CONTACTS.filter((c) => !c.ring);

/* ---------------------------------------------------------------------------
 * Creator statistics. The numbers are generated, but *deterministically* — the
 * same seed gives the same series in both versions of the app, so the React
 * screen and the single-file prototype always show identical charts.
 * ------------------------------------------------------------------------- */

export const RANGES = [
  { id: "7", label: "7 Tage" },
  { id: "30", label: "30 Tage" },
  { id: "12m", label: "12 Monate" },
];

export const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Weekend evenings are the busy time on a calling app; So … Sa.
const WD_FACTOR = [0.78, 0.86, 0.92, 0.97, 1.12, 1.38, 1.24];
// Twelve two-hour buckets, 00 … 22. Night is dead, 20–22 Uhr is the peak.
const HOUR_FACTOR = [0.18, 0.08, 0.05, 0.07, 0.22, 0.44, 0.61, 0.55, 0.72, 0.94, 1.0, 0.66];

export const SOURCES = [
  { key: "call",  label: "Calls",      share: 0.62, color: "#F5761A" },
  { key: "gift",  label: "Geschenke",  share: 0.17, color: "#FDB43C" },
  { key: "tip",   label: "Tips",       share: 0.09, color: "#F5471F" },
  { key: "sub",   label: "Abos",       share: 0.09, color: "#25C26E" },
  { key: "ppv",   label: "PPV",        share: 0.03, color: "#8B8680" },
];

// Star distribution over all rated calls, 5★ first.
export const RATING_DIST = [201, 52, 11, 3, 2];

// FNV-1a over the seed → a repeatable number in [0,1).
function srand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15;
  return ((h >>> 0) % 100000) / 100000;
}

const AVG_CALL_VALUE = 7.4; // € per delivered call — ties revenue and call count together

/* One window of `n` buckets, `shift` windows back from today. shift=1 gives the
   previous period, which is what the change indicators compare against. */
function window_(range, shift) {
  const monthly = range === "12m";
  const n = monthly ? 12 : range === "30" ? 30 : 7;
  const o = { labels: [], revenue: [], calls: [], mins: [], newFans: [], returning: [] };

  for (let i = n - 1; i >= 0; i--) {
    const back = i + shift * n;
    let rev, label, wd;
    if (monthly) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - back);
      label = MONTHS[d.getMonth()];
      wd = 3;
      const trend = 0.60 + (n - 1 - back) * 0.034;      // the account grows over the year
      rev = 2380.9 * Math.max(0.35, trend) * (0.84 + srand("m" + d.getMonth() + d.getFullYear()) * 0.36);
    } else {
      const d = new Date(); d.setDate(d.getDate() - back);
      label = range === "30" ? String(d.getDate()) : DAYS[d.getDay()];
      wd = d.getDay();
      rev = 84.2 * WD_FACTOR[wd] * (0.66 + srand("d" + back + range) * 0.72);
    }
    const calls = Math.max(1, Math.round(rev / AVG_CALL_VALUE));
    const mins = Math.round(calls * (3.1 + srand("t" + back + range) * 0.9));
    const nf = Math.round(calls * (0.13 + srand("n" + back + range) * 0.17));
    o.labels.push(label);
    o.revenue.push(+rev.toFixed(2));
    o.calls.push(calls);
    o.mins.push(mins);
    o.newFans.push(nf);
    o.returning.push(Math.max(0, calls - nf));
  }
  return o;
}

const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : 0);

export function statsFor(range) {
  const cur = window_(range, 0);
  const prev = window_(range, 1);

  const revenue = sum(cur.revenue);
  const totals = { revenue, calls: sum(cur.calls), mins: sum(cur.mins), fans: sum(cur.newFans) };
  const change = {
    revenue: pct(revenue, sum(prev.revenue)),
    calls: pct(totals.calls, sum(prev.calls)),
    mins: pct(totals.mins, sum(prev.mins)),
    fans: pct(totals.fans, sum(prev.newFans)),
  };

  // Revenue split by source, and the two distributions that don't depend on the
  // selected range but do scale with it.
  const bySource = SOURCES.map((s) => ({ ...s, amt: +(revenue * s.share).toFixed(2) }));

  const byWeekday = DAYS.map((_, i) =>
    +(84.2 * WD_FACTOR[i] * (0.86 + srand("wd" + i) * 0.3) * 4).toFixed(2));

  const byHour = HOUR_FACTOR.map((f, i) =>
    Math.round(totals.calls * f * (0.86 + srand("h" + i) * 0.28) / 5));

  return { ...cur, prev, totals, change, bySource, byWeekday, byHour, ratings: RATING_DIST };
}

// Two-hour buckets as labels for the hour chart.
export const HOUR_LABELS = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"];

export const POSTS = [
  { id: "p1", cid: "mia", time: "vor 2 Std", cap: "Neues 20-Min Full-Body Workout ist online 🔥 Wer macht mit?", likes: 1240, ppv: false },
  { id: "p2", cid: "nadia", time: "vor 4 Std", cap: "Mein neuestes Cosplay-Set — exklusiv für dich 📸", likes: 3980, ppv: true, price: 4.99 },
  { id: "p3", cid: "sofia", time: "vor 6 Std", cap: "Sunrise Flow von heute Morgen. Speichert es für später ✨", likes: 2210, ppv: false },
  { id: "p4", cid: "lea", time: "gestern", cap: "Unreleased Beat 🎧 Nur für Supporter. Sag mir was du fühlst.", likes: 870, ppv: true, price: 2.99 },
];

export const CHATS = [
  { cid: "mia", last: "Danke fürs Abo! 💛 Sollen wir später callen?", time: "9:32", unread: 2, online: true },
  { cid: "sofia", last: "Du: Klingt gut, bis 20 Uhr 🧘", time: "gestern", unread: 0, online: true },
  { cid: "amira", last: "🔒 Neue Nachricht freischalten — 1,99 €", time: "gestern", unread: 1, online: false, paid: true },
  { cid: "nadia", last: "Hab dir was geschickt 😊", time: "Mo", unread: 0, online: false },
];
