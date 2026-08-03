import React, { useRef, useState } from "react";
import { CREATORS } from "../data.js";
import { photoStyle, EUR, Ico } from "../lib.jsx";

/* Swipe deck — like/pass/super-ring/call, with creator badges & €/min pricing. */
export default function Discover({ ctx }) {
  const [idx, setIdx] = useState(0);
  const cards = CREATORS.slice(idx, idx + 3);
  const c = CREATORS[idx];

  const advance = (dir) => {
    if (dir === "right" && c) {
      ctx.setLikedPeople((s) => new Set(s).add(c.id));
      ctx.toast(`Du hast ${c.name} geliked 💛`);
    }
    setIdx((i) => i + 1);
  };

  return (
    <>
      <div className="appbar" style={{ padding: "6px 0 10px" }}>
        <div>
          <div className="brandrow"><span className="ring-logo" /><span className="wordmark">ring<b>.</b></span></div>
          <div className="sub">Menschen & Creator in deiner Nähe</div>
        </div>
        <button className="wallet-chip" onClick={() => ctx.push("wallet")}>
          <span className="coin"><Ico name="bolt" /></span><span>{EUR(ctx.balance)}</span>
        </button>
      </div>

      <div className="deck">
        {cards.length === 0 ? (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", color: "var(--muted)", padding: 30 }}>
            <div>
              <div style={{ fontSize: 40 }}>🎉</div>
              <p style={{ fontWeight: 700, color: "var(--ink)" }}>Das war's für heute!</p>
              <p style={{ fontSize: 13 }}>Schau später wieder rein für neue Vorschläge.</p>
              <button className="btn btn-outline btn-sm" style={{ width: "auto" }} onClick={() => setIdx(0)}>Neu starten</button>
            </div>
          </div>
        ) : (
          [...cards].reverse().map((cc, i) => (
            <Card key={cc.id} c={cc} depth={cards.length - 1 - i}
              top={i === cards.length - 1}
              onOpen={() => ctx.push("profile", cc.id)}
              onSwipe={advance} />
          ))
        )}
      </div>

      <div className="deck-actions">
        <button className="round md pass" onClick={() => advance("left")} aria-label="Pass"><Ico name="x" /></button>
        <button className="round md dial" onClick={() => c && ctx.startCall(c.id)} aria-label="Anrufen"><Ico name="phone" /></button>
        <button className="round lg like" onClick={() => advance("right")} aria-label="Like"><Ico name="heart" /></button>
        <button className="round md star" onClick={() => { if (c) { ctx.toast(`Super Ring an ${c.name}! ⭐`); setIdx((i) => i + 1); } }} aria-label="Super Ring"><Ico name="star" /></button>
      </div>
      <p className="center muted" style={{ fontSize: 11.5, marginTop: 14 }}>
        Anrufe über die Ring-Funktion kosten je nach Creator ab 0,99 €/Min.
      </p>
    </>
  );
}

function Card({ c, depth, top, onOpen, onSwipe }) {
  const el = useRef(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, dx: 0, dy: 0, moved: false });

  const style = { transform: `scale(${1 - depth * 0.04}) translateY(${depth * -10}px)` };

  const down = (e) => {
    if (!top) return;
    el.current.setPointerCapture(e.pointerId);
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false };
    el.current.style.transition = "none";
  };
  const move = (e) => {
    const d = drag.current;
    if (!d.on) return;
    d.dx = e.clientX - d.sx; d.dy = e.clientY - d.sy;
    if (Math.abs(d.dx) > 6) d.moved = true;
    el.current.style.transform = `translate(${d.dx}px,${d.dy}px) rotate(${d.dx * 0.05}deg)`;
    el.current.querySelector(".stamp.like").style.opacity = Math.max(0, d.dx / 120);
    el.current.querySelector(".stamp.nope").style.opacity = Math.max(0, -d.dx / 120);
  };
  const up = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    el.current.style.transition = "transform .3s";
    if (d.dx > 110 || d.dx < -110) {
      const dir = d.dx > 0 ? "right" : "left";
      el.current.style.transform = `translate(${dir === "right" ? 600 : -600}px,${d.dy}px) rotate(${dir === "right" ? 30 : -30}deg)`;
      setTimeout(() => onSwipe(dir), 260);
    } else {
      el.current.style.transform = "";
      el.current.querySelector(".stamp.like").style.opacity = 0;
      el.current.querySelector(".stamp.nope").style.opacity = 0;
    }
  };

  return (
    <div ref={el} className="swipe" style={style}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClick={() => top && !drag.current.moved && onOpen()}>
      <div className="photo" style={photoStyle(c.id)} />
      <div className="grad" />
      <div className="stamp like">RING</div>
      <div className="stamp nope">NOPE</div>
      <div className="meta">
        <div className="name">{c.name} <span className="age">{c.age}</span>{c.verified && <span className="badge-verif"><Ico name="verif" /></span>}</div>
        <div className="row">
          {c.live ? <span className="chip live">● LIVE</span>
            : c.online ? <span className="chip"><span style={{ width: 7, height: 7, background: "var(--live)", borderRadius: "50%" }} />Online</span>
            : <span className="chip">{c.dist} km entfernt</span>}
          <span className="chip price"><Ico name="phone" /> {EUR(c.rate)}/Min</span>
        </div>
        <div className="row">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      </div>
    </div>
  );
}
