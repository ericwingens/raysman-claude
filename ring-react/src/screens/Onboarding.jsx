import React, { useEffect, useRef, useState } from "react";
import { photoStyle, imgSrc, Ico, RingLockup } from "../lib.jsx";
import { ContactsPanel } from "../overlays/Contacts.jsx";

/*
 * Welcome + Register flow, 1:1 after the Figma board:
 * Welcome → Register form → Gender → Looking for → Age → Profile picture →
 * Voice message → Contacts
 */
export default function Onboarding({ ctx, done }) {
  const [step, setStep] = useState(-1); // -1 welcome, 0..6 register steps
  const [hide, setHide] = useState(false);
  const finish = () => { setHide(true); setTimeout(done, 420); };

  if (step === -1)
    return (
      <div className={`onb ${hide ? "hide" : ""}`}>
        <div className="statusbar" style={{ visibility: "hidden" }}><span>9:41</span></div>
        <Wall />
        <div className="content">
          <h2>Menschen und Creator,<br />die zu dir passen.</h2>
          <p>Like dich durch, ruf direkt an und unterstütze deine Favoriten mit Abos, Tips & exklusiven Inhalten.</p>
          <button className="btn btn-primary" style={{ width: "auto", minWidth: 220, padding: "16px 36px" }} onClick={() => setStep(0)}>Los geht's</button>
          <div className="fine">Schon dabei? <span className="link" onClick={finish}>Anmelden</span></div>
        </div>
        <div className="footer">
          <a onClick={finish}>Impressum</a> &nbsp;|&nbsp; <a onClick={finish}>Datenschutz</a>
          <div className="homebar" />
        </div>
      </div>
    );

  return <Register ctx={ctx} step={step} setStep={setStep} finish={finish} />;
}

/*
 * Welcome wall — three columns of tiles drifting at different speeds behind the
 * claim: people (photos) mixed with the categories the app is about.
 * Each column renders its list TWICE and the keyframe moves it by exactly -50%,
 * so the loop is seamless. That only works because the tiles are spaced with
 * margin-bottom and not with flex `gap`: a gap would add half a gap to the
 * travel distance and the seam would jump.
 */
export const MEN = ["m1", "m2", "m3", "m4"];           // portraits in public/img
const PEOPLE = ["mia", "m1", "lea", "m2", "nadia", "m3", "jana", "m4", "sofia", "amira"];
const CAT_SLOTS = [[0, 1], [1, 4], [2, 1], [1, 1]];   // [column, position] per category
/* Each category is a real photo; the gradient stays underneath as the ground the
   tile falls back to while the picture loads. */
export const CATS = {
  sport: { label: "Sport", icon: "dumbbell", img: "cat-sport", grad: "linear-gradient(150deg,#FFA048,#F5471F)" },
  media: { label: "Media", icon: "video", img: "cat-media", grad: "linear-gradient(150deg,#8A6CFF,#3B2E8F)" },
  fun: { label: "Unterhaltung", icon: "music", img: "cat-fun", grad: "linear-gradient(150deg,#FF5C94,#8E2A6B)" },
  food: { label: "Ernährung", icon: "leaf", img: "cat-food", grad: "linear-gradient(150deg,#45D389,#0E7A4A)" },
};

/* Round-robin into three columns, one category dropped into each. Built instead
   of hard-coded so a portrait that is not shipped just leaves the wall shorter. */
export function wallColumns() {
  const cols = [[], [], []];
  PEOPLE.filter((p) => !/^m\d$/.test(p) || MEN.includes(p))
    .forEach((p, i) => cols[i % 3].push(["p", p]));
  CAT_SLOTS.forEach(([col, at], i) => cols[col].splice(at, 0, ["c", Object.keys(CATS)[i]]));
  return cols;
}

function Wall() {
  const cols = wallColumns();
  const hearts = [[40, 26, 14], [374, 58, 12]];
  const dots = [[88, 70], [350, 22]];
  return (
    <div className="wall">
      <div className="glow" />
      <div className="wcols">
        {cols.map((col, c) => (
          <div key={c} className={`wcol ${c === 1 ? "down" : "up"} ${c === 2 ? "slow" : ""}`}>
            {[0, 1].map((half) => col.map(([kind, id], i) => (
              kind === "p"
                ? <div key={half + "-" + i} className="wtile p" style={photoStyle(id)} />
                : <div key={half + "-" + i} className="wtile c"
                       style={{ backgroundImage: `url(${imgSrc(CATS[id].img)}), ${CATS[id].grad}` }}>
                    <span className="clab"><Ico name={CATS[id].icon} />{CATS[id].label}</span>
                  </div>
            )))}
          </div>
        ))}
      </div>
      <div className="veil" />
      {hearts.map((h, i) => (
        <span key={"h" + i} className="heart-i" style={{
          left: h[0], top: h[1], width: h[2], height: h[2],
          animation: `float ${3.4 + i * 0.6}s ease-in-out ${i * 0.3}s infinite alternate`,
        }}><Ico name="heart" /></span>
      ))}
      {dots.map((d, i) => (
        <span key={"d" + i} className="odot" style={{
          left: d[0], top: d[1],
          animation: `float ${4 + i * 0.5}s ease-in-out ${i * 0.4}s infinite alternate`,
        }} />
      ))}
      <div className="wbrand"><RingLockup height={56} /></div>
    </div>
  );
}

const STEPS = 7;

function Register({ ctx, step, setStep, finish }) {
  const [gender, setGender] = useState(null);
  const [looking, setLooking] = useState(null);
  const [age, setAge] = useState(24);

  const next = () => (step >= STEPS - 1 ? finish() : setStep(step + 1));
  const back = () => (step === 0 ? setStep(-1) : setStep(step - 1));

  return (
    <div className="reg">
      <div className="rtop">
        <button className="iconbtn" onClick={back}><Ico name="arrow" /></button>
        <div className="prog"><i style={{ width: `${((step + 1) / STEPS) * 100}%` }} /></div>
      </div>

      <div className="rbody">
        {step === 0 && (
          <>
            <h2>Registrieren und finde deine Liebe!</h2>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>Erstelle dein kostenloses Konto.</p>
            <input className="field" placeholder="Vorname" />
            <input className="field" placeholder="Nachname" />
            <input className="field" type="email" placeholder="E-Mail-Adresse" />
            <input className="field" type="tel" placeholder="Telefonnummer" />
            <input className="field" type="password" placeholder="Passwort" />
            <input className="field" type="password" placeholder="Passwort wiederholen" />
          </>
        )}
        {step === 1 && (
          <>
            <h2>Was ist dein Geschlecht?</h2>
            {["Frau", "Mann", "Divers"].map((g) => (
              <div key={g} className={`opt ${gender === g ? "on" : ""}`} onClick={() => setGender(g)}>
                <span style={{ flex: 1 }}>{g}</span>
                {gender === g && <span style={{ color: "var(--orange)", width: 20 }}><Ico name="check" /></span>}
              </div>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <h2>Wonach suchst du?</h2>
            {["Frauen", "Männer", "Alle"].map((g) => (
              <div key={g} className={`opt ${looking === g ? "on" : ""}`} onClick={() => setLooking(g)}>
                <span style={{ flex: 1 }}>{g}</span>
                {looking === g && <span style={{ color: "var(--orange)", width: 20 }}><Ico name="check" /></span>}
              </div>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <h2>Wie alt bist du?</h2>
            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <div style={{ fontSize: 54, fontWeight: 800 }} className="tnum">{age}</div>
              <input type="range" min="18" max="80" value={age} onChange={(e) => setAge(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--orange)", marginTop: 16 }} />
              <p className="muted" style={{ fontSize: 12.5 }}>Du musst mindestens 18 Jahre alt sein.</p>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h2>Lade dein Profilbild hoch!</h2>
            <div style={{ width: 210, height: 210, borderRadius: 24, margin: "22px auto", ...photoStyle("you"), boxShadow: "var(--shadow)" }} />
            <button className="btn btn-ghost" style={{ marginBottom: 10 }}>📁 Aus Galerie wählen</button>
            <button className="btn btn-ghost">📷 Foto aufnehmen</button>
          </>
        )}
        {step === 5 && <VoiceStep />}
        {step === 6 && <ContactsPanel ctx={ctx} />}
      </div>

      <div className="rfoot">
        <button className="btn btn-primary" onClick={next}
          disabled={(step === 1 && !gender) || (step === 2 && !looking)}
          style={{ opacity: (step === 1 && !gender) || (step === 2 && !looking) ? 0.5 : 1 }}>
          {step === 0 ? "Jetzt registrieren" : step === STEPS - 1 ? "Speichern & loslegen" : "Weiter"}
        </button>
      </div>
    </div>
  );
}

/* Voice message recorder — Ring's signature step (waveform + timer). Simulated. */
function VoiceStep() {
  const [rec, setRec] = useState(false);
  const [t, setT] = useState(0);
  const bars = useRef(Array.from({ length: 46 }, () => 6 + Math.random() * 40));
  useEffect(() => {
    if (!rec) return;
    const iv = setInterval(() => setT((x) => +(x + 0.1).toFixed(1)), 100);
    return () => clearInterval(iv);
  }, [rec]);
  const active = Math.min(46, Math.floor(t * 5));
  return (
    <>
      <h2>Nimm deine Sprachnachricht auf</h2>
      <p className="muted" style={{ fontSize: 13.5 }}>Dein Voice-Intro hören andere in Explore, bevor sie dich anrufen.</p>
      <div className="wave" aria-hidden="true">
        {bars.current.map((h, i) => (
          <i key={i} className={i < active ? "" : "off"} style={{ height: h }} />
        ))}
      </div>
      <div className="rec-time">{String(Math.floor(t / 60)).padStart(2, "0")}:{String(Math.floor(t % 60)).padStart(2, "0")}.{Math.floor((t % 1) * 10)}</div>
      <button className={`rec-btn ${rec ? "on" : ""}`} onClick={() => setRec(!rec)} aria-label={rec ? "Pause" : "Aufnehmen"}>
        <Ico name="mic" />
      </button>
      {t > 0 && !rec && (
        <button className="btn btn-outline btn-sm" style={{ width: "auto", margin: "0 auto", display: "flex" }} onClick={() => setT(0)}>Löschen & neu aufnehmen</button>
      )}
    </>
  );
}
