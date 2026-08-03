import React, { useEffect, useState } from "react";
import { CREATORS } from "../data.js";
import { photoStyle, EUR, Ico } from "../lib.jsx";

/*
 * Explore — 1:1 after the Figma pattern: top tabs "Explore | Matches",
 * list rows with avatar · name, age · location · round orange action buttons.
 * Explore rows: ▶ voice intro + ❤ like.  Matches rows: 📞 call + ✕ unmatch.
 * Plus Fanso layer: live stories + creator grid below.
 */
export default function Explore({ ctx }) {
  const [tab, setTab] = useState("explore");
  const [playing, setPlaying] = useState(null);
  const [gone, setGone] = useState(() => new Set());

  // simulate voice intro playback (8s max like the mockup)
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(null), 4000);
    return () => clearTimeout(t);
  }, [playing]);

  const matches = CREATORS.filter((c) => ctx.likedPeople.has(c.id) || ["mia", "sofia"].includes(c.id));

  return (
    <>
      <div className="appbar" style={{ padding: "6px 0 10px" }}>
        <div><h1>Explore</h1><div className="sub">Voice-Intros anhören, liken, anrufen</div></div>
        <button className="wallet-chip" onClick={() => ctx.push("wallet")}>
          <span className="coin"><Ico name="bolt" /></span><span>{EUR(ctx.balance)}</span>
        </button>
      </div>

      <div className="seg" style={{ margin: "2px 0 6px" }}>
        <button className={tab === "explore" ? "on" : ""} onClick={() => setTab("explore")}>Explore</button>
        <button className={tab === "matches" ? "on" : ""} onClick={() => setTab("matches")}>Matches</button>
      </div>

      {tab === "explore" && (
        <>
          <div className="section-title">Jetzt Live <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>{CREATORS.filter((c) => c.live).length} aktiv</span></div>
          <div className="hscroll">
            {CREATORS.map((c, i) => (
              <div key={c.id} className="story" onClick={() => (c.live ? ctx.startCall(c.id) : ctx.push("profile", c.id))}>
                <div className={`av ${i > 2 ? "seen" : ""}`}>
                  <div style={photoStyle(c.id)}>{c.live && <span className="lv">LIVE</span>}</div>
                </div>
                <div className="nm">{c.name}</div>
              </div>
            ))}
          </div>

          <div className="section-title">In deiner Nähe</div>
          {CREATORS.map((c) => (
            <div key={c.id} className="lrow">
              <div className="avatar" style={photoStyle(c.id)} onClick={() => ctx.push("profile", c.id)}>
                {c.online && <span className="presence" />}
              </div>
              <div style={{ minWidth: 0 }} onClick={() => ctx.push("profile", c.id)}>
                <div className="nm">{c.name}, {c.age} {c.verified && <span className="badge-verif" style={{ width: 15, height: 15, display: "inline-grid", verticalAlign: -2 }}><Ico name="verif" /></span>}</div>
                <div className="loc">{c.city} · {c.dist} km · {EUR(c.rate)}/Min</div>
              </div>
              <div className="acts">
                <button className={`rowbtn ghost ${playing === c.id ? "playing" : ""}`} aria-label="Voice-Intro abspielen"
                  onClick={() => { setPlaying(playing === c.id ? null : c.id); if (playing !== c.id) ctx.toast(`▶ Voice-Intro von ${c.name}`); }}>
                  {playing === c.id ? <Ico name="mic" /> : <Play />}
                </button>
                <button className="rowbtn" aria-label="Liken"
                  onClick={() => { ctx.setLikedPeople((s) => new Set(s).add(c.id)); ctx.toast(`Du hast ${c.name} geliked 💛`); }}>
                  <Ico name="heart" />
                </button>
              </div>
            </div>
          ))}

          <div className="section-title">Empfohlene Creator <a onClick={() => ctx.toast("Alle Creator")}>Alle</a></div>
          <div className="creator-grid">
            {CREATORS.map((c) => (
              <div key={c.id} className="ccard" onClick={() => ctx.push("profile", c.id)}>
                <div style={{ position: "absolute", inset: 0, ...photoStyle(c.id + "x") }} />
                <div className="grad" />
                <div className="top">
                  {c.live ? <span className="chip live" style={{ fontSize: 10, padding: "4px 8px" }}>● LIVE</span> : <span />}
                  <span className="chip price" style={{ fontSize: 10, padding: "4px 8px" }}>{EUR(c.rate)}/Min</span>
                </div>
                <div className="bot">
                  <div className="n">{c.name} {c.verified && <span className="badge-verif" style={{ width: 15, height: 15 }}><Ico name="verif" /></span>}</div>
                  <div className="s">{c.tags[0]} · {c.followers} Follower</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "matches" && (
        <>
          <div className="section-title">Deine Matches <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>{matches.filter((c) => !gone.has(c.id)).length}</span></div>
          {matches.filter((c) => !gone.has(c.id)).map((c) => (
            <div key={c.id} className="lrow">
              <div className="avatar" style={photoStyle(c.id)} onClick={() => ctx.push("profile", c.id)}>
                {c.online && <span className="presence" />}
              </div>
              <div style={{ minWidth: 0 }} onClick={() => ctx.push("profile", c.id)}>
                <div className="nm">{c.name}, {c.age}</div>
                <div className="loc">{c.city} · {EUR(c.rate)}/Min</div>
              </div>
              <div className="acts">
                <button className="rowbtn" aria-label="Anrufen" onClick={() => ctx.startCall(c.id)}><Ico name="phone" /></button>
                <button className="rowbtn ghost" aria-label="Match entfernen"
                  onClick={() => { setGone((s) => new Set(s).add(c.id)); ctx.toast(`Match mit ${c.name} entfernt`); }}>
                  <Ico name="x" />
                </button>
              </div>
            </div>
          ))}
          {matches.filter((c) => !gone.has(c.id)).length === 0 && (
            <p className="muted center" style={{ fontSize: 13, marginTop: 30 }}>Noch keine Matches — like Leute in Explore oder Discover.</p>
          )}
        </>
      )}
    </>
  );
}

const Play = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M8 5.5v13l11-6.5z" /></svg>
);
