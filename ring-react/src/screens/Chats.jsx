import React from "react";
import { CHATS, byId } from "../data.js";
import { photoStyle, Ico } from "../lib.jsx";

export default function Chats({ ctx }) {
  const newMatches = [...ctx.likedPeople, "mia", "sofia"]
    .filter((v, i, a) => a.indexOf(v) === i && byId(v) && !ctx.blocked.has(v)).slice(0, 6);
  const rows = CHATS.filter((ch) => !ctx.blocked.has(ch.cid));
  return (
    <>
      <div className="appbar" style={{ padding: "6px 0 10px" }}>
        <div><h1>Chats</h1><div className="sub">Nachrichten & Matches</div></div>
        <button className="iconbtn" onClick={() => ctx.toast("Neue Nachricht")}><Ico name="send" /></button>
      </div>

      <div className="section-title">Neue Matches</div>
      <div className="hscroll">
        {newMatches.map((id) => {
          const c = byId(id);
          return (
            <div key={id} className="story" onClick={() => ctx.push("chat", id)}>
              <div className="av"><div style={photoStyle(id)} /></div>
              <div className="nm">{c.name}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Unterhaltungen</div>
      {rows.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Keine Unterhaltungen.</p>}
      {rows.map((ch) => {
        const c = byId(ch.cid);
        return (
          <div key={ch.cid} className="chat-row" onClick={() => ctx.push("chat", ch.cid)}>
            <div className="avatar" style={photoStyle(c.id)}>{ch.online && <span className="presence" />}</div>
            <div style={{ minWidth: 0 }}>
              <div className="n">{c.name} {c.verified && <span className="badge-verif" style={{ width: 14, height: 14 }}><Ico name="verif" /></span>}</div>
              <div className="last" style={ch.paid ? { color: "var(--orange)", fontWeight: 700 } : undefined}>{ch.last}</div>
            </div>
            <div className="meta">
              <span className="time">{ch.time}</span>
              {ch.unread > 0 && <span className="pill-unread">{ch.unread}</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}
