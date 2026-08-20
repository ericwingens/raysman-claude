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
