import React, { useEffect, useRef, useState } from "react";
import { byId } from "../data.js";
import { photoStyle, EUR, Ico } from "../lib.jsx";

/* Slide-in helper: adds .show a frame after mount so transitions run. */
function useShow() {
  const [show, setShow] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);
  return show;
}

/* ---------------- Creator profile (full screen) ---------------- */
export function ProfileFull({ id, ctx }) {
  const show = useShow();
  const c = byId(id);
  const subbed = ctx.subs.has(id);

  const subscribe = () => {
    if (subbed) { ctx.toast(`Du bist bereits VIP bei ${c.name}`); return; }
    if (ctx.spend(9.99, `VIP-Abo bei ${c.name} aktiv! 🎉`)) ctx.setSubs((s) => new Set(s).add(id));
    else ctx.push("wallet");
  };

  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="fscreen">
        <div className="phero">
          <div style={{ position: "absolute", inset: 0, ...photoStyle(id) }} />
          <div className="grad" />
          <button className="iconbtn back" style={{ position: "absolute" }} onClick={ctx.pop}><Ico name="arrow" /></button>
          {c.live && <span className="chip live" style={{ position: "absolute", top: "calc(var(--safe-top) + 34px)", right: 16 }}>● LIVE</span>}
          <div className="info">
            <div className="nm">{c.name} <span style={{ fontWeight: 500 }}>{c.age}</span> {c.verified && <span className="badge-verif"><Ico name="verif" /></span>}</div>
            <div style={{ opacity: 0.9, fontSize: 13.5, marginTop: 4 }}>{c.city} · {c.dist} km · {c.followers} Follower</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </div>
        </div>

        <div style={{ padding: "16px 18px 40px" }}>
          {/* Figma call-profile card: gender + bio above the call action */}
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <button className="btn btn-primary" onClick={() => ctx.startCall(id)}><Ico name="phone" /> Ring me · {EUR(c.rate)}/Min</button>
            <button className="round md" style={{ flex: "none", border: "1px solid var(--line)" }} onClick={() => ctx.push("chat", id)}><Ico name="chat" /></button>
            <button className="round md" style={{ flex: "none", border: "1px solid var(--line)" }} onClick={() => ctx.push("tip", id)}><Ico name="gift" /></button>
          </div>
          <div className="set-row" style={{ borderBottom: "none", padding: "6px 2px 0" }}>
            <div><div className="lbl">Geschlecht</div><div className="val">{["mia", "nadia", "sofia"].includes(id) ? "Weiblich" : "Männlich"}</div></div>
          </div>
          <div className="set-row" style={{ borderBottom: "1px solid var(--line)", paddingTop: 6 }}>
            <div><div className="lbl">Bio</div><p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-2)", margin: "4px 0 8px" }}>{c.bio}</p></div>
          </div>

          <div className="section-title">Abo-Optionen</div>
          <div className="tier">
            <div className="tn">Free</div>
            <div className="tp">0,00 €<span> /Monat</span></div>
            <ul><li><Ico name="check" />Öffentliche Posts</li><li><Ico name="check" />Story-Updates</li></ul>
            <button className="btn btn-ghost btn-sm" onClick={() => ctx.toast(`Du folgst ${c.name}`)}>Folgen</button>
          </div>
          <div className="tier best">
            <div className="badge">Beliebt</div>
            <div className="tn">VIP</div>
            <div className="tp">9,99 €<span> /Monat</span></div>
            <ul>
              <li><Ico name="check" />Alle exklusiven Inhalte</li>
              <li><Ico name="check" />Direktnachrichten inklusive</li>
              <li><Ico name="check" />10% Rabatt auf Calls</li>
              <li><Ico name="check" />Zugang zu Livestreams</li>
            </ul>
            <button className="btn btn-primary btn-sm" onClick={subscribe}>{subbed ? "✓ Abonniert" : "VIP abonnieren"}</button>
          </div>

          <div className="section-title">Inhalte <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>{subbed ? "freigeschaltet" : "gesperrt"}</span></div>
          <div className="gallery">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="gitem" onClick={() => (subbed ? ctx.toast("Inhalt öffnen") : subscribe())}>
                <div style={{ position: "absolute", inset: 0, ...photoStyle(id + "g" + i), filter: subbed ? "none" : "blur(6px)" }} />
                {subbed ? (i % 3 === 0 && <span className="pv">▶ Video</span>) : <div className="lock"><Ico name="lock" /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Chat detail with paid DM ---------------- */
export function ChatFull({ id, ctx }) {
  const show = useShow();
  const c = byId(id);
  const [msgs, setMsgs] = useState([
    { dir: "in", txt: "Hey! Schön dass du da bist 😊 Wie war dein Tag?" },
    { dir: "out", txt: "Ziemlich gut! Hab dein neues Workout gemacht 💪" },
    { dir: "in", txt: "Oh stark! Dann hab ich was für dich 👀" },
  ]);
  const [dmLocked, setDmLocked] = useState(true);
  const [draft, setDraft] = useState("");
  const boxRef = useRef(null);
  useEffect(() => { boxRef.current?.scrollTo(0, 1e6); }, [msgs, dmLocked]);

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setMsgs((m) => [...m, { dir: "out", txt: v }]);
    setDraft("");
    setTimeout(() => setMsgs((m) => [...m, { dir: "in", txt: "😊👍" }]), 900);
  };
  const unlockDM = () => {
    if (ctx.spend(1.99, "Foto freigeschaltet · 1,99 €")) setDmLocked(false);
    else ctx.push("wallet");
  };

  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="appbar" style={{ paddingTop: "calc(var(--safe-top) + 30px)", borderBottom: "1px solid var(--line)" }}>
          <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, marginLeft: 4 }}>
            <div className="avatar" style={{ width: 38, height: 38, ...photoStyle(id) }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: c.online ? "var(--live)" : "var(--muted)", fontWeight: 600 }}>{c.online ? "● Online" : "zuletzt vor 1 Std"}</div>
            </div>
          </div>
          <button className="iconbtn" style={{ color: "var(--live)" }} onClick={() => ctx.startCall(id)}><Ico name="phone" /></button>
          <button className="iconbtn" style={{ color: "var(--orange)" }} onClick={() => ctx.startCall(id)}><Ico name="video" /></button>
        </div>

        <div ref={boxRef} className="fscreen" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((m, i) => <Bubble key={i} dir={m.dir}>{m.txt}</Bubble>)}
          <div className="post-media" style={{ maxWidth: 220, borderRadius: 16, overflow: "hidden", aspectRatio: "3/4", alignSelf: "flex-start" }}>
            <div style={{ position: "absolute", inset: 0, ...photoStyle(id + "dm"), filter: dmLocked ? "blur(3px)" : "none" }} />
            {dmLocked && (
              <div className="locked">
                <div className="lk" style={{ width: 44, height: 44 }}><Ico name="lock" /></div>
                <h4 style={{ fontSize: 14 }}>Foto</h4>
                <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={unlockDM}>1,99 € freischalten</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "10px 12px calc(env(safe-area-inset-bottom,10px) + 12px)", borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center" }}>
          <button className="iconbtn" style={{ flex: "none" }} onClick={() => ctx.push("tip", id)}><Ico name="gift" /></button>
          <input className="field" style={{ margin: 0, flex: 1 }} placeholder="Nachricht schreiben…"
            value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="iconbtn" style={{ flex: "none", background: "var(--brand-grad)", color: "#fff", border: "none" }} onClick={send}><Ico name="send" /></button>
        </div>
      </div>
    </div>
  );
}
const Bubble = ({ dir, children }) => (
  <div style={{
    alignSelf: dir === "out" ? "flex-end" : "flex-start", maxWidth: "75%", padding: "11px 15px",
    borderRadius: 18, fontSize: 14, lineHeight: 1.4,
    ...(dir === "out"
      ? { background: "var(--brand-grad)", color: "#fff", borderBottomRightRadius: 6 }
      : { background: "var(--card-2)", border: "1px solid var(--line)", borderBottomLeftRadius: 6 }),
  }}>{children}</div>
);

/* ---------------- Tip sheet ---------------- */
export function TipSheet({ id, ctx }) {
  const show = useShow();
  const c = byId(id);
  const [amt, setAmt] = useState(5);
  const send = () => {
    if (ctx.spend(amt, `${EUR(amt)} Tip an ${c.name} gesendet 💛`)) ctx.pop();
  };
  return (
    <div className={`sheet ${show ? "show" : ""}`}>
      <div className="grip" />
      <div className="sheet-body">
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div className="avatar ring" style={{ width: 72, height: 72, margin: "0 auto" }}><div style={photoStyle(id)} /></div>
          <h2 style={{ margin: "12px 0 2px", fontSize: 22, fontWeight: 800 }}>Tip an {c.name}</h2>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>Zeig deine Unterstützung ✨</p>
        </div>
        <div className="amt-row">
          {[2, 5, 10, 20, 50].map((a) => (
            <button key={a} className={`amt ${amt === a ? "on" : ""}`} onClick={() => setAmt(a)}>{a} €</button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 13 }} className="muted">
          <span>Dein Guthaben</span><span className="money tnum">{EUR(ctx.balance)}</span>
        </div>
        <button className="btn btn-primary" onClick={send}><Ico name="gift" /> {EUR(amt)} senden</button>
        <p className="center muted" style={{ fontSize: 11, marginTop: 12 }}>Tips sind endgültig und gehen direkt an den Creator.</p>
      </div>
    </div>
  );
}

/* ---------------- Wallet sheet ---------------- */
export function WalletSheet({ ctx }) {
  const show = useShow();
  const [pack, setPack] = useState(25);
  return (
    <div className={`sheet ${show ? "show" : ""}`}>
      <div className="grip" />
      <div className="sheet-body">
        <h2 style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800 }}>Wallet</h2>
        <div style={{ background: "var(--brand-grad)", borderRadius: 20, padding: 20, color: "#fff", margin: "10px 0 18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 12.5, opacity: 0.9, textTransform: "uppercase", letterSpacing: ".06em" }}>Aktuelles Guthaben</div>
          <div className="money" style={{ fontSize: 34, marginTop: 4 }}>{EUR(ctx.balance)}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>Für Calls, PPV, Tips & Abos</div>
        </div>
        <div className="section-title" style={{ marginTop: 0 }}>Guthaben aufladen</div>
        <div className="amt-row">
          {[10, 25, 50, 100].map((p) => (
            <button key={p} className={`amt ${pack === p ? "on" : ""}`} onClick={() => setPack(p)}>{p} €</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { ctx.setBalance((b) => b + pack); ctx.toast(`${EUR(pack)} aufgeladen ✓`); }}>
          <Ico name="bolt" /> {EUR(pack)} aufladen
        </button>
        <div className="section-title">Letzte Transaktionen</div>
        <Tx label="VIP-Abo · Mia" amt="-9,99 €" />
        <Tx label="Guthaben aufgeladen" amt="+25,00 €" pos />
        <Tx label="Ring-Call · Sofia (6 Min)" amt="-10,74 €" />
        <Tx label="PPV freigeschaltet · Nadia" amt="-4,99 €" />
        <p className="center muted" style={{ fontSize: 11, marginTop: 16 }}>Zahlung via Stripe / PayPal · SSL-verschlüsselt</p>
      </div>
    </div>
  );
}
const Tx = ({ label, amt, pos }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
    <span>{label}</span><span className="money tnum" style={{ color: pos ? "var(--live)" : "var(--ink)" }}>{amt}</span>
  </div>
);

/* ---------------- Active paid call (per-minute cost ticker) ---------------- */
export function CallScreen({ call, ctx }) {
  const show = useShow();
  const c = byId(call.id);
  const m = String(Math.floor(call.secs / 60)).padStart(2, "0");
  const s = String(call.secs % 60).padStart(2, "0");
  return (
    <div className={`call ${show ? "show" : ""}`}>
      <div className="bg" style={photoStyle(call.id)} />
      <div className="veil" />
      <div className="top">
        <div className="who">{c.name}</div>
        <div className="status">{call.status === "connecting" ? "verbindet…" : "verbunden"}</div>
        <div className="ticker">
          <div className="cost tnum">{EUR(call.cost)}</div>
          <div className="rate">{EUR(c.rate)} / Minute · <span className="tnum">{m}:{s}</span></div>
        </div>
      </div>
      <div className="self" style={photoStyle("you")} />
      <div className="controls">
        <div className="ctrow">
          <button className="cbtn" onClick={() => ctx.toast("Mikro stumm")}><Ico name="mic" /></button>
          <button className="cbtn tip" onClick={() => ctx.push("tip", call.id)}><Ico name="gift" /></button>
          <button className="cbtn" onClick={() => ctx.toast("Kamera gewechselt")}><Ico name="camflip" /></button>
        </div>
        <button className="cbtn end" style={{ width: 72, height: 72 }} onClick={() => ctx.endCall(false)}><Ico name="phone" /></button>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Abrechnung läuft pro Minute — Abbruch bei Guthaben 0</div>
      </div>
    </div>
  );
}

/* ---------------- Legal pages: Data Privacy & Imprint (Figma 1:1) ---------------- */
export function LegalFull({ id, ctx }) {
  const show = useShow();
  const isPrivacy = id === "privacy";
  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="appbar" style={{ paddingTop: "calc(var(--safe-top) + 30px)", borderBottom: "1px solid var(--line)" }}>
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h1 style={{ fontSize: 19, flex: 1, textAlign: "center", marginRight: 42 }}>{isPrivacy ? "Datenschutz" : "Impressum"}</h1>
      </div>
      <div className="fscreen legal" style={{ padding: "16px 22px 40px" }}>
        {isPrivacy ? (
          <>
            <h3>Datenschutzerklärung</h3>
            <p>Wir nehmen den Schutz deiner persönlichen Daten ernst. Diese Erklärung informiert dich darüber, welche Daten wir erheben, wie wir sie verwenden und welche Rechte du hast (Platzhaltertext für den Prototyp).</p>
            <h3>Erhobene Daten</h3>
            <p>Profilangaben (Name, Alter, Fotos, Sprachnachricht), Nutzungsdaten (Likes, Matches, Calls) sowie Zahlungsdaten für Wallet, Abos und Pay-per-View werden ausschließlich zur Bereitstellung der App verarbeitet.</p>
            <h3>Deine Rechte</h3>
            <p>Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit gemäß DSGVO. Kontaktiere uns dazu über die im Impressum angegebene Adresse.</p>
          </>
        ) : (
          <>
            <h3>Angaben gemäß § 5 TMG</h3>
            <p>Ring App GmbH<br />Musterstraße 1<br />10115 Berlin</p>
            <h3>Kontakt</h3>
            <p>E-Mail: contact@ring.example<br />Telefon: +49 30 000000</p>
            <h3>Vertretungsberechtigt</h3>
            <p>Geschäftsführung: Max Mustermann<br />Registergericht: AG Berlin-Charlottenburg<br />USt-ID: DE000000000</p>
          </>
        )}
      </div>
    </div>
  );
}
