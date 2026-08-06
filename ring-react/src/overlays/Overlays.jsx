import React, { useEffect, useRef, useState } from "react";
import { CREATORS, POSTS, byId, STATS, BADGES, levelLabel, rating, SERVICES, availability, dayLabel, REVIEWS, GIFTS, SHARE_TARGETS } from "../data.js";
import { photoStyle, EUR, Ico, num } from "../lib.jsx";

/* Delivery quality at a glance, plus the creator's level and earned badges.
   Reads as "can I trust this person with my money" before the call button. */
export function TrustRow({ id, all }) {
  const st = STATS[id];
  if (!st) return null;
  const r = rating(id, all);
  return (
    <>
      <div className="trust">
        <div className="t"><b>{r.avg ? r.avg.toFixed(1) : "—"}</b><span>{r.count} Bewertungen</span></div>
        <div className="t"><b>{st.response}%</b><span>Antwortquote</span></div>
        <div className="t"><b>{st.repeat}%</b><span>Stammgäste</span></div>
      </div>
      <div className="lvl">
        <span className="pip">Level {st.level} · {levelLabel(st.level)}</span>
        {st.badges.map((b) => (
          <span key={b} className="badge-pill">{BADGES[b].em} {BADGES[b].label}</span>
        ))}
        <span className="badge-pill">{num(st.calls)} Calls</span>
      </div>
    </>
  );
}


/* Filled/empty star run. `n` of 5. */
export function Stars({ n, big }) {
  return (
    <span className={`stars ${big ? "big" : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "" : "off"}><Ico name="star" /></span>
      ))}
    </span>
  );
}

/* Slide-in helper: adds .show a frame after mount so transitions run. */
function useShow() {
  const [show, setShow] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);
  return show;
}




/* ---------------- Add up to five more people to a running call ---------------- */
export const MAX_GUESTS = 5;

export function AddPeopleSheet({ ctx, close }) {
  const inCall = ctx.call ? ctx.call.id : null;
  const picked = ctx.guests;
  const full = picked.length >= MAX_GUESTS;

  const toggle = (id) => {
    if (picked.includes(id)) ctx.setGuests(picked.filter((g) => g !== id));
    else if (!full) ctx.setGuests([...picked, id]);
  };

  const pool = CREATORS.filter((c) => c.id !== inCall);
  return (
    <div className="modal show" onClick={close}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,1,.5)" }} />
      <div className="mbox" style={{ position: "relative", maxWidth: 340, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: "center" }}>Teilnehmer hinzufügen</h3>
        <p style={{ textAlign: "center" }}>
          {picked.length} von {MAX_GUESTS} ausgewählt{full ? " — Maximum erreicht" : ""}
        </p>
        <div style={{ maxHeight: "42vh", overflowY: "auto" }}>
          {pool.map((c) => {
            const on = picked.includes(c.id);
            return (
              <div key={c.id} className={`pickrow ${on ? "on" : ""} ${!on && full ? "full" : ""}`} onClick={() => toggle(c.id)}>
                <span className="avatar" style={{ width: 38, height: 38, ...photoStyle(c.id) }} />
                <div style={{ minWidth: 0 }}>
                  <div className="pk-n">{c.name}, {c.age}</div>
                  <div className="pk-s">{c.online ? "online" : "offline"} · {EUR(c.rate)}/Min</div>
                </div>
                <span className="pk-c">{on && <Ico name="check" />}</span>
              </div>
            );
          })}
        </div>
        <div className="mrow" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={close}>Fertig</button>
          <button className="btn btn-primary btn-sm" disabled={!picked.length}
            style={{ opacity: picked.length ? 1 : 0.5 }}
            onClick={() => { close(); ctx.toast(`${picked.length} Teilnehmer im Call`); }}>
            Übernehmen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Share a post to an external platform ---------------- */
export function ShareSheet({ id, ctx, close }) {
  const p = POSTS.find((x) => x.id === id);
  const c = p ? byId(p.cid) : null;
  return (
    <div className="modal show" onClick={close}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,1,.5)" }} />
      <div className="mbox" style={{ position: "relative", maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
        <h3>Beitrag teilen</h3>
        <p>{c ? `${c.name} · ${p.cap.slice(0, 48)}${p.cap.length > 48 ? "…" : ""}` : "Diesen Inhalt weitergeben."}</p>
        <div className="sharegrid">
          {SHARE_TARGETS.map((t) => (
            <button key={t.id} className="sharetile" onClick={() => { close(); ctx.toast(`Geteilt auf ${t.name}`); }}>
              <span className="tile" style={{ background: t.bg, color: t.ink }}><Ico name={t.id} /></span>
              <span className="lbl2">{t.name}</span>
            </button>
          ))}
        </div>
        <div className="mrow" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={close}>Abbrechen</button>
          <button className="btn btn-primary btn-sm"
            onClick={() => { close(); ctx.toast("Link kopiert"); }}>Link kopieren</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Gift picker, opened from a call or a live view ----------------
   Spends from the wallet and floats the emoji up the screen. */
export function GiftSheet({ id, ctx, close }) {
  const c = byId(id);
  const [sel, setSel] = useState(null);
  const g = GIFTS.find((x) => x.id === sel);

  const send = () => {
    if (!ctx.spend(g.price, `${g.em} ${g.name} an ${c.name} gesendet`)) { close(); ctx.push("wallet"); return; }
    ctx.flyGift(g.em);
    close();
  };

  return (
    <div className="modal show" onClick={close}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,1,.5)" }} />
      <div className="mbox" style={{ position: "relative", maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
        <h3>Geschenk an {c.name}</h3>
        <p>Wird sofort von deinem Guthaben abgebucht.</p>
        <div className="giftgrid">
          {GIFTS.map((x) => (
            <div key={x.id} className={`giftcard ${sel === x.id ? "on" : ""}`} onClick={() => setSel(x.id)}>
              <div className="g-em">{x.em}</div>
              <div className="g-n">{x.name}</div>
              <div className="g-p">{EUR(x.price)}</div>
            </div>
          ))}
        </div>
        <div className="mrow" style={{ marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={close}>Abbrechen</button>
          <button className="btn btn-primary btn-sm" disabled={!g} style={{ opacity: g ? 1 : 0.5 }} onClick={send}>
            Senden{g && <span className="btn-amt">· {EUR(g.price)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Rating prompt, shown once a call has ended ---------------- */
export function RateSheet({ id, ctx, close }) {
  const c = byId(id);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");

  const submit = () => {
    const entry = { id: "u" + Date.now(), by: "Du", stars, when: "gerade eben", text: text.trim() || "Keine weitere Rückmeldung." };
    ctx.setReviews((r) => ({ ...r, [id]: [entry, ...(r[id] || [])] }));
    ctx.toast(`Danke für deine Bewertung von ${c.name}`);
    close();
  };

  return (
    <div className="modal show" onClick={close}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,1,.5)" }} />
      <div className="mbox" style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <h3>Wie war dein Call mit {c.name}?</h3>
        <p>Deine Bewertung hilft anderen bei der Auswahl.</p>
        <div className="rate-pick">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} className={i <= stars ? "on" : ""} aria-label={`${i} Sterne`}
              onClick={() => setStars(i)}><Ico name="star" /></button>
          ))}
        </div>
        <input className="field" placeholder="Kurz sagen, wie es war (optional)"
          value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mrow" style={{ marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={close}>Später</button>
          <button className="btn btn-primary btn-sm" disabled={!stars}
            style={{ opacity: stars ? 1 : 0.5 }} onClick={submit}>Absenden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Booking: pick a package, a day, a time ----------------
   No escrow and no order states — the slot is reserved and the paid call runs
   as usual when it starts. Deliberate: those were declined for this round. */
export function BookSheet({ id, ctx }) {
  const show = useShow();
  const c = byId(id);
  const svcs = SERVICES[id] || [];
  const [svc, setSvc] = useState(svcs[0]?.id || null);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => ({ ...dayLabel(i), slots: availability(id, i) }));
  const chosen = svcs.find((s) => s.id === svc);
  const slots = day === null ? [] : days[day].slots;
  const ready = chosen && day !== null && time;

  const confirm = () => {
    ctx.setBookings((b) => [...b, { key: Date.now(), cid: id, svc: chosen, dayOffset: day, time }]);
    ctx.toast(`Termin bei ${c.name} reserviert · ${days[day].dow}. ${time} Uhr`);
    ctx.pop();
  };

  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="ftop">
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h3>Termin bei {c.name}</h3>
        <span style={{ width: 42 }} />
      </div>
      <div className="fscreen" style={{ padding: "4px 18px 30px" }}>
        <div className="section-title">Leistung wählen</div>
        {svcs.map((s) => (
          <div key={s.id} className={`svc ${svc === s.id ? "on" : ""}`} onClick={() => setSvc(s.id)}>
            <div style={{ minWidth: 0 }}>
              <div className="sv-n">{s.name}</div>
              <div className="sv-d">{s.desc}</div>
            </div>
            <div className="sv-p"><b>{EUR(s.price)}</b><span>{s.mins} Min</span></div>
          </div>
        ))}

        <div className="section-title">Tag wählen</div>
        <div className="daystrip">
          {days.map((d, i) => (
            <div key={i} className={`day ${day === i ? "on" : ""} ${d.slots.length ? "" : "off"}`}
              onClick={() => { if (!d.slots.length) return; setDay(i); setTime(null); }}>
              <div className="dw">{d.today ? "Heute" : d.dow}</div>
              <div className="dn">{d.num}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Uhrzeit</div>
        {day === null
          ? <p className="muted" style={{ fontSize: 13 }}>Wähle zuerst einen Tag.</p>
          : <div className="slots">
              {slots.map((t) => (
                <span key={t} className={`slot ${time === t ? "on" : ""}`} onClick={() => setTime(t)}>{t}</span>
              ))}
            </div>}

        <button className="btn btn-primary" style={{ marginTop: 18, opacity: ready ? 1 : 0.5 }}
          disabled={!ready} onClick={confirm}>
          Termin reservieren{ready && <span className="btn-amt">· {EUR(chosen.price)}</span>}
        </button>
        <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 10 }}>
          Bezahlt wird erst beim Call — dein Guthaben wird jetzt nicht belastet.
        </p>
      </div>
    </div>
  );
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
          <TrustRow id={id} all={ctx.reviews} />
          {/* Figma call-profile card: gender + bio above the call action */}
          <div style={{ display: "flex", gap: 10, margin: "12px 0 8px" }}>
            <button className="btn btn-primary" onClick={() => ctx.startCall(id)}><Ico name="phone" />Ring me<span className="btn-amt">· {EUR(c.rate)}/Min</span></button>
            <button className="round md" style={{ flex: "none", border: "1px solid var(--line)" }} onClick={() => ctx.push("chat", id)}><Ico name="chat" /></button>
            <button className="round md" style={{ flex: "none", border: "1px solid var(--line)" }} onClick={() => ctx.push("tip", id)}><Ico name="gift" /></button>
          </div>
          <div className="set-row" style={{ borderBottom: "none", padding: "6px 2px 0" }}>
            <div><div className="lbl">Geschlecht</div><div className="val">Weiblich</div></div>
          </div>
          <div className="set-row" style={{ borderBottom: "1px solid var(--line)", paddingTop: 6 }}>
            <div><div className="lbl">Bio</div><p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-2)", margin: "4px 0 8px" }}>{c.bio}</p></div>
          </div>

          <div className="section-title">Buchbare Leistungen</div>
          {(SERVICES[id] || []).map((sv) => (
            <div key={sv.id} className="svc" onClick={() => ctx.push("book", id)}>
              <div style={{ minWidth: 0 }}>
                <div className="sv-n">{sv.name}</div>
                <div className="sv-d">{sv.desc}</div>
              </div>
              <div className="sv-p"><b>{EUR(sv.price)}</b><span>{sv.mins} Min</span></div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => ctx.push("book", id)}>Termin buchen</button>

          <div className="section-title">
            Bewertungen
            <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}>
              {rating(id, ctx.reviews).avg.toFixed(1)} <Stars n={Math.round(rating(id, ctx.reviews).avg)} /> · {rating(id, ctx.reviews).count}
            </span>
          </div>
          {(ctx.reviews[id] || REVIEWS[id] || []).map((r) => (
            <div key={r.id} className="rv">
              <div className="rv-av">{r.by.slice(0, 1)}</div>
              <div style={{ minWidth: 0 }}>
                <div><span className="rv-n">{r.by}</span><span className="rv-w">{r.when}</span></div>
                <Stars n={r.stars} />
                <p>{r.text}</p>
              </div>
            </div>
          ))}

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
      {ctx.guests.length > 0 && (
        <div className="parts">
          {ctx.guests.map((g) => (
            <div key={g} className="part" style={photoStyle(g)}>
              <span className="drop" onClick={() => ctx.setGuests(ctx.guests.filter((x) => x !== g))}>✕</span>
              <span className="pn">{byId(g).name}</span>
            </div>
          ))}
        </div>
      )}
      <div className="self" style={photoStyle("you")} />
      <div className="controls">
        <div className="ctrow">
          <button className="cbtn" onClick={() => ctx.toast("Mikro stumm")}><Ico name="mic" /></button>
          <button className="cbtn" aria-label="Tip senden" onClick={() => ctx.push("tip", call.id)}><Ico name="bolt" /></button>
          <button className="cbtn tip" aria-label="Geschenk senden" onClick={() => ctx.openGift(call.id)}><Ico name="gift" /></button>
          <button className="cbtn" aria-label="Teilnehmer hinzufügen" onClick={ctx.openAddPeople}><Ico name="plus" /></button>
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
