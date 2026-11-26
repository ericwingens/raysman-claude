import React, { useEffect, useState } from "react";
import { EARNINGS, SUPPORTERS, CREATOR_BOOKINGS, PAYOUTS, RATE_STEPS, STUDIO_SLOTS, DAYS, FEE } from "../data.js";
import { photoStyle, EUR, Ico } from "../lib.jsx";

/*
 * Creator studio — the other side of the app. Reached from Me → Konto and
 * opened as a full-screen overlay, so the five fan tabs stay untouched.
 * Earnings, supporters, upcoming bookings and payout on top; the three things
 * a creator actually sets — minute price, packages, availability — below.
 */
export default function StudioFull({ ctx }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);

  const c = ctx.creator;
  const set = (patch) => ctx.setCreator({ ...c, ...patch });
  const net = (n) => n * (1 - FEE);

  const setRate = (r) => { set({ rate: r }); ctx.toast(`Minutenpreis auf ${EUR(r)} gesetzt`); };
  const bump = (id, delta) => set({
    services: c.services.map((s) => (s.id === id ? { ...s, price: Math.max(5, s.price + delta) } : s)),
  });
  const drop = (id) => { set({ services: c.services.filter((s) => s.id !== id) }); ctx.toast("Leistung entfernt"); };
  const add = () => {
    const n = c.services.length + 1;
    set({ services: [...c.services, { id: "m" + Date.now(), name: `Neue Leistung ${n}`, mins: 30, price: 29, desc: "Beschreibung ergänzen." }] });
    ctx.toast("Leistung angelegt — Beschreibung noch ergänzen");
  };
  const toggleDay = (i) => set({ days: c.days.map((d, x) => (x === i ? !d : d)) });
  const toggleSlot = (t) => set({ slots: c.slots.includes(t) ? c.slots.filter((s) => s !== t) : [...c.slots, t].sort() });

  const openDays = c.days.filter(Boolean).length;

  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="ftop">
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h3>Creator-Studio</h3>
        <span style={{ width: 42 }} />
      </div>
      <div className="fscreen" style={{ padding: "4px 18px 34px" }}>
        <div className="earn">
          <div className="el">Einnahmen diese Woche</div>
          <div className="ev">{EUR(EARNINGS.week)}</div>
          <div className="er">
            <div><b>{EUR(EARNINGS.today)}</b><span>heute</span></div>
            <div><b>{EUR(EARNINGS.month)}</b><span>Monat</span></div>
            <div><b>{EUR(EARNINGS.total)}</b><span>gesamt</span></div>
          </div>
        </div>

        <div className="kpi">
          <div><b>{EARNINGS.calls}</b><span>Calls</span></div>
          <div><b>{EARNINGS.mins}</b><span>Minuten</span></div>
          <div><b>{EUR(EARNINGS.gifts)}</b><span>Geschenke</span></div>
          <div><b>{EARNINGS.subs}</b><span>Abos</span></div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => ctx.push("stats")}>
          <Ico name="chart" />Meine Statistiken ansehen
        </button>

        <div className="section-title">Nächste Termine <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>{CREATOR_BOOKINGS.length}</span></div>
        {CREATOR_BOOKINGS.map((b, i) => (
          <div key={i} className="bk-row" onClick={() => ctx.toast(`${b.who} · ${b.svc} · ${b.when} ${b.time} Uhr`)}>
            <span className="avatar" style={{ width: 38, height: 38, ...photoStyle("fan" + i) }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{b.who}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{b.svc} · {b.mins} Min · {EUR(b.price)}</div>
            </div>
            <div className="bk-when"><b>{b.when}</b>{b.time} Uhr</div>
          </div>
        ))}

        <div className="section-title">Top-Unterstützer</div>
        {SUPPORTERS.map((s, i) => (
          <div key={s.name} className="sup">
            <div className={`sr ${i < 3 ? "top" : ""}`}>{i + 1}</div>
            <div className="sa">{s.name.slice(0, 1)}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sn">{s.name}</div>
              <div className="ss">{s.calls} Calls · {s.since}</div>
            </div>
            <div className="sv">{EUR(s.amt)}</div>
          </div>
        ))}

        <div className="section-title">Auszahlung</div>
        <div className="pay">
          <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Auszahlbar</div>
          <div className="pv">{EUR(EARNINGS.week)}</div>
          <div className="pm">Nächste Auszahlung: {c.nextPayout} · <span className="nb">{c.iban}</span></div>
          <button className="btn btn-primary btn-sm" onClick={() => ctx.toast("Auszahlung beauftragt — in 1–2 Bankarbeitstagen da")}>
            <Ico name="bolt" />Jetzt auszahlen
          </button>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => ctx.toast("Bankverbindung ändern (Demo)")}>Bankverbindung ändern</button>
        </div>
        {PAYOUTS.map((p) => (
          <div key={p.when} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
            <span>{p.when} · <span className="muted">{p.state}</span></span>
            <span className="money tnum" style={{ color: "var(--live)" }}>{EUR(p.amt)}</span>
          </div>
        ))}

        <div className="section-title">Dein Minutenpreis</div>
        <div className="amt-row">
          {RATE_STEPS.map((r) => (
            <button key={r} className={`amt ${c.rate === r ? "on" : ""}`} onClick={() => setRate(r)}>{EUR(r)}</button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: -4 }}>
          Bei {EUR(c.rate)}/Min bleiben dir {EUR(net(c.rate))} — Ring behält {Math.round(FEE * 100)} %.
        </p>

        <div className="section-title">Deine Leistungen <a onClick={add}>Hinzufügen</a></div>
        {c.services.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Noch keine Leistungen — leg eine an, damit Fans buchen können.</p>}
        {c.services.map((s) => (
          <div key={s.id} className="svc" style={{ cursor: "default" }}>
            <div style={{ minWidth: 0 }}>
              <div className="sv-n">{s.name}</div>
              <div className="sv-d">{s.desc} · <span className="nb">{s.mins} Min</span> · <span className="nb">du bekommst {EUR(net(s.price))}</span></div>
            </div>
            <div className="step">
              <button aria-label="Günstiger" onClick={() => bump(s.id, -5)}>−</button>
              <span className="sp">{EUR(s.price)}</span>
              <button aria-label="Teurer" onClick={() => bump(s.id, 5)}>+</button>
              <button aria-label="Entfernen" className="rm" onClick={() => drop(s.id)}><Ico name="x" /></button>
            </div>
          </div>
        ))}

        <div className="section-title">Deine Verfügbarkeit <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>{openDays} Tage · {c.slots.length} Zeiten</span></div>
        <div className="dowrow">
          {DAYS.map((d, i) => (
            <div key={d} className={`dow ${c.days[i] ? "on" : ""}`} onClick={() => toggleDay(i)}>{d}</div>
          ))}
        </div>
        <div className="slots">
          {STUDIO_SLOTS.map((t) => (
            <span key={t} className={`slot ${c.slots.includes(t) ? "on" : ""}`} onClick={() => toggleSlot(t)}>{t}</span>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12.5 }}>
          {openDays === 0 || c.slots.length === 0
            ? "Ohne Tage oder Zeiten kann dich niemand buchen."
            : `Fans können dich an ${openDays} Tagen zu ${c.slots.length} Zeiten buchen.`}
        </p>

        <button className="btn btn-primary" style={{ marginTop: 14 }}
          onClick={() => { ctx.pop(); ctx.toast("Creator-Profil gespeichert ✓"); }}>Speichern</button>
      </div>
    </div>
  );
}
