import React, { useState } from "react";
import { photoStyle, Ico } from "../lib.jsx";

/*
 * Profil bearbeiten — full-screen editor after the Figma "Profile settings" screens.
 * Sub-pages: overview, single-field editors, photo manager (Change Profile Photo),
 * voice intro re-record, and the delete-account flow.
 */
const INITIAL = {
  first: "Jane",
  last: "Doe",
  birth: "1998-06-28",
  gender: "Weiblich",
  looking: "Alle",
  city: "Berlin",
  bio: "Kaffee, Berge & gute Gespräche. Frag mich nach meiner Playlist.",
  interests: ["Reisen", "Yoga", "Musik", "Kochen"],
  job: "UX Designerin",
  height: 168,
  voice: 8,
  photos: ["you", "you2", "you3"],
};

const ALL_INTERESTS = ["Reisen", "Yoga", "Musik", "Kochen", "Fitness", "Kunst", "Gaming", "Filme", "Lesen", "Wandern", "Fotografie", "Tanzen"];

export default function EditProfile({ ctx }) {
  const [p, setP] = useState(INITIAL);
  const [page, setPage] = useState("main"); // main | bio | name | gender | looking | interests | photos | voice | delete
  const [dirty, setDirty] = useState(false);

  const set = (patch) => { setP((v) => ({ ...v, ...patch })); setDirty(true); };
  const save = () => { setDirty(false); ctx.toast("Profil gespeichert ✓"); ctx.pop(); };
  const age = Math.floor((Date.now() - new Date(p.birth)) / 31557600000);

  const sub = (title, body, footer) => (
    <div className="full show">
      <div className="ftop">
        <button className="iconbtn" onClick={() => setPage("main")}><Ico name="arrow" /></button>
        <h3>{title}</h3>
        <span style={{ width: 42 }} />
      </div>
      <div className="fscreen" style={{ padding: "8px 18px 30px" }}>{body}</div>
      {footer !== null && (
        <div className="rfoot">
          <button className="btn btn-primary" onClick={() => setPage("main")}>Übernehmen</button>
        </div>
      )}
    </div>
  );

  if (page === "bio")
    return sub("Über mich", (
      <>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>Erzähl kurz, wer du bist. Das sehen andere zuerst.</p>
        <textarea className="field" rows={6} maxLength={300} value={p.bio}
          onChange={(e) => set({ bio: e.target.value })} style={{ resize: "none", lineHeight: 1.5 }} />
        <div className="muted tnum" style={{ fontSize: 12, textAlign: "right" }}>{p.bio.length}/300</div>
      </>
    ));

  if (page === "name")
    return sub("Name & Details", (
      <>
        <label className="flbl">Vorname</label>
        <input className="field" value={p.first} onChange={(e) => set({ first: e.target.value })} />
        <label className="flbl">Nachname</label>
        <input className="field" value={p.last} onChange={(e) => set({ last: e.target.value })} />
        <label className="flbl">Geburtsdatum</label>
        <input className="field" type="date" value={p.birth} onChange={(e) => set({ birth: e.target.value })} />
        <label className="flbl">Wohnort</label>
        <input className="field" value={p.city} onChange={(e) => set({ city: e.target.value })} />
        <label className="flbl">Beruf</label>
        <input className="field" value={p.job} onChange={(e) => set({ job: e.target.value })} />
        <label className="flbl">Größe — <b className="tnum">{p.height} cm</b></label>
        <input type="range" min="140" max="210" value={p.height} onChange={(e) => set({ height: +e.target.value })}
          style={{ width: "100%", accentColor: "var(--orange)" }} />
      </>
    ));

  if (page === "gender" || page === "looking") {
    const isG = page === "gender";
    const opts = isG ? ["Weiblich", "Männlich", "Divers"] : ["Frauen", "Männer", "Alle"];
    const cur = isG ? p.gender : p.looking;
    return sub(isG ? "Geschlecht" : "Ich suche", (
      <>
        {opts.map((g) => (
          <div key={g} className={`opt ${cur === g ? "on" : ""}`} onClick={() => set(isG ? { gender: g } : { looking: g })}>
            <span style={{ flex: 1 }}>{g}</span>
            {cur === g && <span style={{ color: "var(--orange)", width: 20 }}><Ico name="check" /></span>}
          </div>
        ))}
      </>
    ));
  }

  if (page === "interests")
    return sub("Interessen", (
      <>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>Wähle bis zu 6 — sie erscheinen auf deiner Karte.</p>
        <div className="chipwrap">
          {ALL_INTERESTS.map((t) => {
            const on = p.interests.includes(t);
            return (
              <button key={t} className={`ichip ${on ? "on" : ""}`} onClick={() =>
                set({ interests: on ? p.interests.filter((x) => x !== t) : p.interests.length >= 6 ? p.interests : [...p.interests, t] })}>
                {t}{on && " ✓"}
              </button>
            );
          })}
        </div>
        <p className="muted tnum" style={{ fontSize: 12 }}>{p.interests.length}/6 ausgewählt</p>
      </>
    ));

  if (page === "photos")
    return sub("Fotos verwalten", (
      <>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>Dein erstes Foto ist dein Hauptbild. Halte gedrückt zum Sortieren.</p>
        <div className="photo-grid">
          {p.photos.map((s, i) => (
            <div key={s} className="ph" style={photoStyle(s)}>
              {i === 0 && <span className="mainbadge">Hauptbild</span>}
              <span className="rm" onClick={() => set({ photos: p.photos.filter((x) => x !== s) })}>✕</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - p.photos.length) }).map((_, i) => (
            <div key={"e" + i} className="ph add" onClick={() => { set({ photos: [...p.photos, "you" + (p.photos.length + 2)] }); ctx.toast("Foto hinzugefügt (Demo)"); }}>+</div>
          ))}
        </div>
        <div className="section-title">Hauptbild ändern</div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => ctx.toast("Galerie geöffnet (Demo)")}>📁 Aus Galerie wählen</button>
        <button className="btn btn-ghost btn-sm" onClick={() => ctx.toast("Kamera geöffnet (Demo)")}>📷 Foto aufnehmen</button>
      </>
    ));

  if (page === "voice")
    return sub("Sprachnachricht", <VoiceEdit p={p} set={set} ctx={ctx} />);

  if (page === "delete")
    return sub("Konto löschen", (
      <>
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px", display: "grid", placeItems: "center", background: "rgba(255,61,113,.12)", color: "var(--heart)" }}><Ico name="x" /></div>
          <h2 style={{ fontSize: 21, margin: "0 0 8px" }}>Wirklich löschen?</h2>
        </div>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>
          Dein Profil, deine Matches, Chats und dein Guthaben werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.
        </p>
        <div className="warnbox">
          <b>Restguthaben</b><br />Lass dir dein Guthaben vor dem Löschen auszahlen — es verfällt sonst.
        </div>
        <button className="btn btn-ghost" style={{ marginBottom: 10 }} onClick={() => setPage("main")}>Abbrechen</button>
        <button className="btn btn-primary" style={{ background: "var(--heart)", boxShadow: "none" }}
          onClick={() => { ctx.toast("Demo: Konto nicht wirklich gelöscht 😉"); setPage("main"); }}>Konto endgültig löschen</button>
      </>
    ), null);

  // ---------- main overview ----------
  return (
    <div className="full show">
      <div className="ftop">
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h3>Profil bearbeiten</h3>
        <button className="savebtn" onClick={save} disabled={!dirty} style={{ opacity: dirty ? 1 : 0.4 }}>Sichern</button>
      </div>

      <div className="fscreen" style={{ padding: "0 18px 30px" }}>
        {/* hero photo + completeness */}
        <div style={{ textAlign: "center", padding: "14px 0 6px" }}>
          <div style={{ position: "relative", width: 112, height: 112, margin: "0 auto" }}>
            <div className="avatar ring" style={{ width: 112, height: 112 }}><div style={photoStyle(p.photos[0] || "you")} /></div>
            <button className="camfab" onClick={() => setPage("photos")} aria-label="Fotos verwalten"><Ico name="camflip" /></button>
          </div>
          <h2 style={{ fontSize: 21, margin: "14px 0 2px" }}>{p.first} {p.last}, <span className="tnum" style={{ fontWeight: 600, color: "var(--muted)" }}>{age}</span></h2>
          <div className="muted" style={{ fontSize: 13 }}>{p.city} · {p.job}</div>
        </div>

        <div className="complete">
          <div className="crow"><span>Profil-Vollständigkeit</span><b className="tnum">80%</b></div>
          <div className="cbar"><i style={{ width: "80%" }} /></div>
          <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>Füge 2 weitere Fotos hinzu für mehr Matches.</p>
        </div>

        <div className="section-title">Fotos</div>
        <div className="hscroll" style={{ paddingBottom: 4 }}>
          {p.photos.map((s, i) => (
            <div key={s} className="minph" style={photoStyle(s)} onClick={() => setPage("photos")}>
              {i === 0 && <span className="mainbadge sm">Haupt</span>}
            </div>
          ))}
          <div className="minph add" onClick={() => setPage("photos")}>+</div>
        </div>

        <div className="section-title">Über mich</div>
        <EditRow label="Bio" val={p.bio} onClick={() => setPage("bio")} multiline />
        <EditRow label="Interessen" val={p.interests.join(" · ")} onClick={() => setPage("interests")} />

        <div className="section-title">Sprachnachricht</div>
        <EditRow label="Voice-Intro" val={`${String(p.voice).padStart(2, "0")} Sekunden aufgenommen`} onClick={() => setPage("voice")} icon="mic" />

        <div className="section-title">Persönliche Angaben</div>
        <EditRow label="Name" val={`${p.first} ${p.last}`} onClick={() => setPage("name")} />
        <EditRow label="Geburtsdatum" val={new Date(p.birth).toLocaleDateString("de-DE")} onClick={() => setPage("name")} />
        <EditRow label="Wohnort" val={p.city} onClick={() => setPage("name")} />
        <EditRow label="Geschlecht" val={p.gender} onClick={() => setPage("gender")} />
        <EditRow label="Ich suche" val={p.looking} onClick={() => setPage("looking")} />

        <div className="section-title">Sichtbarkeit</div>
        <ToggleRow label="Profil sichtbar" desc="Andere können dich in Discover finden" def />
        <ToggleRow label="Online-Status zeigen" desc="Zeigt, wenn du gerade aktiv bist" def />
        <ToggleRow label="Entfernung anzeigen" desc="Zeigt deine Distanz in Kilometern" def />

        <div className="section-title">Konto</div>
        <div className="chat-row" onClick={() => setPage("delete")}>
          <span className="iconbtn" style={{ width: 38, height: 38, pointerEvents: "none", color: "var(--heart)" }}><Ico name="x" /></span>
          <div className="n" style={{ fontSize: 14.5, color: "var(--heart)" }}>Konto löschen</div>
        </div>
      </div>

      <div className="rfoot">
        <button className="btn btn-primary" onClick={save}>Änderungen speichern</button>
      </div>
    </div>
  );
}

function EditRow({ label, val, onClick, multiline, icon }) {
  return (
    <div className="set-row" onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{ minWidth: 0, paddingRight: 12, flex: 1 }}>
        <div className="lbl">{icon ? <span style={{ display: "inline-flex", width: 13, marginRight: 5, verticalAlign: -2 }}><Ico name={icon} /></span> : null}{label}</div>
        <div className="val" style={multiline ? { whiteSpace: "normal", lineHeight: 1.45 } : undefined}>{val}</div>
      </div>
      <span className="pen">✎</span>
    </div>
  );
}

function ToggleRow({ label, desc, def }) {
  const [on, setOn] = useState(!!def);
  return (
    <div className="set-row" onClick={() => setOn(!on)} style={{ cursor: "pointer" }}>
      <div style={{ minWidth: 0, paddingRight: 12, flex: 1 }}>
        <div className="val" style={{ fontWeight: 600 }}>{label}</div>
        <div className="lbl" style={{ textTransform: "none", letterSpacing: 0 }}>{desc}</div>
      </div>
      <span className={`sw ${on ? "on" : ""}`}><i /></span>
    </div>
  );
}

function VoiceEdit({ p, set, ctx }) {
  const [rec, setRec] = useState(false);
  const [t, setT] = useState(p.voice);
  React.useEffect(() => {
    if (!rec) return;
    const iv = setInterval(() => setT((x) => +(x + 0.1).toFixed(1)), 100);
    return () => clearInterval(iv);
  }, [rec]);
  const bars = React.useRef(Array.from({ length: 46 }, () => 6 + Math.random() * 40));
  const active = Math.min(46, Math.floor(t * 3));
  return (
    <>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>Dein Voice-Intro hören andere in Explore, bevor sie dich anrufen.</p>
      <div className="wave" aria-hidden="true">
        {bars.current.map((h, i) => <i key={i} className={i < active ? "" : "off"} style={{ height: h }} />)}
      </div>
      <div className="rec-time">{String(Math.floor(t / 60)).padStart(2, "0")}:{String(Math.floor(t % 60)).padStart(2, "0")}</div>
      <button className={`rec-btn ${rec ? "on" : ""}`} onClick={() => { setRec(!rec); if (rec) set({ voice: Math.round(t) }); }}>
        <Ico name="mic" />
      </button>
      {t > 0 && !rec && (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => ctx.toast("Wiedergabe (Demo)")}>▶ Anhören</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setT(0); set({ voice: 0 }); }}>Löschen</button>
        </div>
      )}
    </>
  );
}
