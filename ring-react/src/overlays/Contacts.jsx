import React, { useEffect, useState } from "react";
import { PHONE_CONTACTS, onRing, notOnRing } from "../data.js";
import { photoStyle, Ico } from "../lib.jsx";

/*
 * Contact import. The phone book is matched against ring meApp members; the
 * hits are highlighted and can be added straight to the user's contacts, the
 * rest can be invited. Simulated end to end — see the privacy note, which is
 * what the real implementation has to deliver (build plan §7.2).
 *
 * The same panel serves two places: the last step of registration and its own
 * screen under Me. State lives in App, so both show the same thing.
 */
export function ContactsPanel({ ctx }) {
  const [prog, setProg] = useState(0);
  const scan = ctx.contactsScan; // null | "scan" | "done"

  useEffect(() => {
    if (scan !== "scan") return;
    const iv = setInterval(() => setProg((x) => Math.min(100, x + 8)), 90);
    const t = setTimeout(() => ctx.setContactsScan("done"), 1500);
    return () => { clearInterval(iv); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan]);

  const added = ctx.contactsAdded, invited = ctx.contactsInvited;
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
      <button className="btn btn-primary" onClick={() => { setProg(0); ctx.setContactsScan("scan"); }}>
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
        {!allAdded && <a onClick={ctx.addAllContacts}>Alle hinzufügen</a>}
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
            : <button className="btn btn-primary btn-sm kb" style={{ width: "auto" }}
                onClick={() => ctx.addContact(c.id)}>Hinzufügen</button>}
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
            : <button className="btn btn-ghost btn-sm kb" style={{ width: "auto" }}
                onClick={() => ctx.inviteContact(c.id)}>Einladen</button>}
        </div>
      ))}
    </>
  );
}

/* The same panel as its own screen, reached from Me — for everyone who skipped
   the step during registration, or whose friends joined later. */
export default function ContactsFull({ ctx }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);
  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="ftop">
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h3>Freunde finden</h3>
        <span style={{ width: 42 }} />
      </div>
      <div className="fscreen" style={{ padding: "6px 18px 20px" }}>
        <ContactsPanel ctx={ctx} />
      </div>
      <div className="rfoot">
        <button className="btn btn-primary" onClick={ctx.pop}>Fertig</button>
      </div>
    </div>
  );
}
