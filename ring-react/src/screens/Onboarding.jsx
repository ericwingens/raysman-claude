import React, { useEffect, useRef, useState } from "react";
import { photoStyle, Ico, RingLogo } from "../lib.jsx";

/*
 * Welcome + Register flow, 1:1 after the Figma board:
 * Welcome → Register form → Gender → Looking for → Age → Profile picture → Voice message
 */
export default function Onboarding({ done }) {
  const [step, setStep] = useState(-1); // -1 welcome, 0..5 register steps
  const [hide, setHide] = useState(false);
  const finish = () => { setHide(true); setTimeout(done, 420); };

  if (step === -1)
    return (
      <div className={`onb ${hide ? "hide" : ""}`}>
        <div className="statusbar" style={{ visibility: "hidden" }}><span>9:41</span></div>
        <Cluster />
        <div className="content">
          <div className="brandrow" style={{ justifyContent: "center", marginBottom: 2 }}>
            <RingLogo size={44} />
            <span className="wordmark" style={{ fontSize: 30 }}>ring</span>
          </div>
          <h2>Match. Ring.<br />Connect.</h2>
          <p>Finde Menschen und Creator, die zu dir passen — like dich durch, ruf direkt an und unterstütze deine Favoriten mit Abos, Tips & exklusiven Inhalten.</p>
          <button className="btn btn-primary" onClick={() => setStep(0)}>Los geht's</button>
          <div className="fine">Schon dabei? <span className="link" onClick={finish}>Anmelden</span></div>
          <div className="fine">Mit „Los geht's" akzeptierst du unsere <b>AGB</b> & <b>Datenschutz</b>.</div>
        </div>
      </div>
    );

  return <Register step={step} setStep={setStep} finish={finish} />;
}

function Cluster() {
  const av = ["mia", "nadia", "sofia", "leo", "jonas", "amir"];
  const pos = [[50, 42, 120], [168, 70, 84], [250, 150, 96], [70, 150, 80], [150, 235, 110], [262, 258, 72]];
  return (
    <div className="cluster">
      {pos.map((p, i) => (
        <div key={i} className="pp" style={{
          left: p[0], top: p[1], width: p[2], height: p[2],
          ...photoStyle(av[i]),
          animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate`,
        }} />
      ))}
      {[[30, 40, 18], [330, 90, 14], [40, 330, 16], [310, 300, 20], [190, 20, 12]].map((h, i) => (
        <div key={"h" + i} className="heart-i" style={{ left: h[0], top: h[1], width: h[2] }}><Ico name="heart" /></div>
      ))}
    </div>
  );
}

const STEPS = 6;

function Register({ step, setStep, finish }) {
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
