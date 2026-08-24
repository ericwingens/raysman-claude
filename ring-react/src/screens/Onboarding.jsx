import React, { useEffect, useRef, useState } from "react";
import { photoStyle, Ico, RingLockup } from "../lib.jsx";
import { PHONE_CONTACTS, onRing, notOnRing } from "../data.js";

/*
 * Welcome + Register flow, 1:1 after the Figma board:
 * Welcome → Register form → Gender → Looking for → Age → Profile picture →
 * Voice message → Contacts
 */
export default function Onboarding({ done, onContacts }) {
  const [step, setStep] = useState(-1); // -1 welcome, 0..6 register steps
  const [hide, setHide] = useState(false);
  // `ringIds` arrives only from the last step; the welcome links pass an event.
  const finish = (ringIds) => {
    if (Array.isArray(ringIds) && ringIds.length && onContacts) onContacts(ringIds);
    setHide(true);
    setTimeout(done, 420);
  };

  if (step === -1)
    return (
      <div className={`onb ${hide ? "hide" : ""}`}>
        <div className="statusbar" style={{ visibility: "hidden" }}><span>9:41</span></div>
        <Cluster />
        <div className="content">
          <div className="brandrow" style={{ justifyContent: "center" }}><RingLockup height={80} /></div>
          <p>Finde Menschen und Creator, die zu dir passen — like dich durch, ruf direkt an und unterstütze deine Favoriten mit Abos, Tips & exklusiven Inhalten.</p>
          <button className="btn btn-primary" style={{ width: "auto", minWidth: 200, padding: "15px 34px" }} onClick={() => setStep(0)}>Los geht's</button>
          <div className="fine">Schon dabei? <span className="link" onClick={finish}>Anmelden</span></div>
        </div>
        <div className="footer">
          <a onClick={finish}>Impressum</a> &nbsp;|&nbsp; <a onClick={finish}>Datenschutz</a>
          <div className="homebar" />
        </div>
      </div>
    );

  return <Register step={step} setStep={setStep} finish={finish} />;
}

/* Photo cluster on peach circles — coordinates from the Figma welcome screen (428px grid). */
function Cluster() {
  const bubbles = [
    [207, 50, 119, "mia"], [30, 104, 101, "lea"], [150, 193, 101, "nadia"],
    [326, 178, 71, "amira"], [31, 302, 119, "jana"], [192, 302, 179, "sofia"],
  ];
  const hearts = [[364, 302, 14], [139, 79, 13], [24, 243, 12], [368, 490, 13], [336, 378, 11]];
  const dots = [[156, 161], [143, 458], [378, 121], [59, 446], [382, 80]];
  return (
    <div className="cluster">
      <div className="cin">
        <div className="peach" style={{ left: 59, top: 121, width: 310, height: 310, background: "#FBE3D3", opacity: 0.55 }} />
        <div className="peach" style={{ left: 108, top: 170, width: 212, height: 212, background: "#F9D5BC", opacity: 0.55 }} />
        {bubbles.map((b, i) => (
          <div key={i} className="pp" style={{
            left: b[0], top: b[1], width: b[2], height: b[2], ...photoStyle(b[3]),
            animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate`,
          }} />
        ))}
        {hearts.map((h, i) => (
          <span key={"h" + i} className="heart-i" style={{ left: h[0], top: h[1], width: h[2], height: h[2] }}><Ico name="heart" /></span>
        ))}
        {dots.map((d, i) => <span key={"d" + i} className="odot" style={{ left: d[0], top: d[1] }} />)}
      </div>
    </div>
  );
}

const STEPS = 7;

function Register({ step, setStep, finish }) {
  const [gender, setGender] = useState(null);
  const [looking, setLooking] = useState(null);
  const [age, setAge] = useState(24);
  const [added, setAdded] = useState(() => new Set());   // contact ids added to Ring
  const [invited, setInvited] = useState(() => new Set());

  const next = () => (step >= STEPS - 1
    ? finish(PHONE_CONTACTS.filter((c) => added.has(c.id)).map((c) => c.ring))
    : setStep(step + 1));
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
        {step === 6 && <ContactsStep added={added} setAdded={setAdded} invited={invited} setInvited={setInvited} />}
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

/* ---------------------------------------------------------------------------
 * Contact import. The phone book is matched against ring meApp members; the
 * hits are highlighted and can be added straight to the user's contacts, the
 * rest can be invited. Simulated end to end — see the privacy note, which is
 * what the real implementation has to deliver.
 * ------------------------------------------------------------------------- */
function ContactsStep({ added, setAdded, invited, setInvited }) {
  const [scan, setScan] = useState(null); // null | "scan" | "done"
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (scan !== "scan") return;
    const iv = setInterval(() => setProg((x) => Math.min(100, x + 8)), 90);
    const t = setTimeout(() => setScan("done"), 1500);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [scan]);

  const add = (id) => setAdded((a) => new Set(a).add(id));
  const addAll = () => setAdded(new Set(onRing.map((c) => c.id)));
  const invite = (id) => setInvited((a) => new Set(a).add(id));
  const allAdded = onRing.every((c) => added.has(c.id));

  if (scan === null) return (
    <>
      <h2>Finde deine Freunde</h2>
      <p className="muted" style={{ fontSize: 13.5 }}>
        Wir gleichen dein Telefonbuch mit ring meApp ab und zeigen dir, wer schon dabei ist.
      </p>
      <div className="kscan">
        <div className="ki"><Ico name="users" /></div>
      </div>
      <button className="btn btn-primary" onClick={() => { setProg(0); setScan("scan"); }}>
        <Ico name="users" />Kontakte importieren
      </button>
      <div className="warnbox">
        <b>Was dabei passiert:</b> Deine Nummern verlassen dein Gerät nur als unlesbarer Prüfwert,
        nie im Klartext. Nummern ohne Treffer werden sofort verworfen und nicht gespeichert.
      </div>
      <p className="center muted" style={{ fontSize: 12 }}>Du kannst diesen Schritt überspringen.</p>
    </>
  );

  if (scan === "scan") return (
    <>
      <h2>Gleiche ab …</h2>
      <p className="muted" style={{ fontSize: 13.5 }}>{PHONE_CONTACTS.length} Kontakte werden geprüft.</p>
      <div className="kscan">
        <div className="ki"><Ico name="users" /></div>
      </div>
      <div className="cbar"><i style={{ width: `${prog}%`, transition: "width .09s linear" }} /></div>
    </>
  );

  return (
    <>
      <h2>{onRing.length} von {PHONE_CONTACTS.length} sind schon dabei</h2>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>
        Füg sie direkt zu deinen Kontakten hinzu — den Rest kannst du einladen.
      </p>

      <div className="section-title">
        Schon bei ring meApp
        {!allAdded && <a onClick={addAll}>Alle hinzufügen</a>}
      </div>
      {onRing.map((c) => (
        <div key={c.id} className="krow on">
          <span className="kav" style={photoStyle(c.ring)} />
          <div style={{ minWidth: 0 }}>
            <div className="kn">{c.name}<span className="kchip">auf ring meApp</span></div>
            <div className="kp">{c.phone}</div>
          </div>
          {added.has(c.id)
            ? <span className="kdone"><Ico name="check" />Hinzugefügt</span>
            : <button className="btn btn-primary btn-sm kb" style={{ width: "auto" }} onClick={() => add(c.id)}>Hinzufügen</button>}
        </div>
      ))}

      <div className="section-title">Noch nicht dabei</div>
      {notOnRing.map((c) => (
        <div key={c.id} className="krow">
          <span className="kav ini">{c.name.slice(0, 1)}</span>
          <div style={{ minWidth: 0 }}>
            <div className="kn">{c.name}</div>
            <div className="kp">{c.phone}</div>
          </div>
          {invited.has(c.id)
            ? <span className="kdone" style={{ color: "var(--muted)" }}><Ico name="check" />Eingeladen</span>
            : <button className="btn btn-ghost btn-sm kb" style={{ width: "auto" }} onClick={() => invite(c.id)}>Einladen</button>}
        </div>
      ))}
    </>
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
