// Demo data for the Ring prototype. Replace with API calls in production.

export const CREATORS = [
  { id: "mia", name: "Mia", age: 24, city: "Berlin", dist: 2, tags: ["Fitness", "Lifestyle"], rate: 1.99, online: true, live: true, verified: true, followers: "48.2k", subs: 12800, bio: "Personal trainer & content creator. Ich zeige dir meine Home-Workouts, koche live und quatsche gern per Call. 💪🔥" },
  { id: "leo", name: "Leo", age: 27, city: "Hamburg", dist: 5, tags: ["Musik", "Producer"], rate: 1.49, online: true, live: false, verified: true, followers: "31.9k", subs: 8400, bio: "Producer aus Hamburg. Exklusive Beats, Studio-Sessions und 1:1 Feedback zu deinen Tracks." },
  { id: "nadia", name: "Nadia", age: 23, city: "Köln", dist: 8, tags: ["Art", "Cosplay"], rate: 2.49, online: false, live: false, verified: true, followers: "64.1k", subs: 19200, bio: "Illustratorin & Cosplayerin. Behind-the-scenes, Speedpaints und persönliche Voice-Calls. ✨" },
  { id: "jonas", name: "Jonas", age: 29, city: "München", dist: 12, tags: ["Reisen", "Foto"], rate: 0.99, online: true, live: false, verified: false, followers: "12.7k", subs: 3900, bio: "Reisefotograf. Ich nehme dich mit auf Trips und teile meine besten Foto-Presets." },
  { id: "sofia", name: "Sofia", age: 26, city: "Wien", dist: 22, tags: ["Yoga", "Wellness"], rate: 1.79, online: true, live: true, verified: true, followers: "55.4k", subs: 16700, bio: "Yoga-Lehrerin. Morgen-Flows, geführte Meditationen und entspannte Late-Night-Calls. 🧘‍♀️" },
  { id: "amir", name: "Amir", age: 25, city: "Frankfurt", dist: 3, tags: ["Gaming", "Tech"], rate: 1.29, online: false, live: false, verified: true, followers: "22.3k", subs: 7100, bio: "Full-time Streamer. Coaching in Valorant & CS, plus exklusive Gaming-Nights nur für Subs." },
];

export const byId = (id) => CREATORS.find((c) => c.id === id);

export const POSTS = [
  { id: "p1", cid: "mia", time: "vor 2 Std", cap: "Neues 20-Min Full-Body Workout ist online 🔥 Wer macht mit?", likes: 1240, ppv: false },
  { id: "p2", cid: "nadia", time: "vor 4 Std", cap: "Mein neuestes Cosplay-Set — exklusiv für dich 📸", likes: 3980, ppv: true, price: 4.99 },
  { id: "p3", cid: "sofia", time: "vor 6 Std", cap: "Sunrise Flow von heute Morgen. Speichert es für später ✨", likes: 2210, ppv: false },
  { id: "p4", cid: "leo", time: "gestern", cap: "Unreleased Beat 🎧 Nur für Supporter. Sag mir was du fühlst.", likes: 870, ppv: true, price: 2.99 },
];

export const CHATS = [
  { cid: "mia", last: "Danke fürs Abo! 💛 Sollen wir später callen?", time: "9:32", unread: 2, online: true },
  { cid: "sofia", last: "Du: Klingt gut, bis 20 Uhr 🧘", time: "gestern", unread: 0, online: true },
  { cid: "amir", last: "🔒 Neue Nachricht freischalten — 1,99 €", time: "gestern", unread: 1, online: false, paid: true },
  { cid: "nadia", last: "Hab dir was geschickt 😊", time: "Mo", unread: 0, online: false },
];
