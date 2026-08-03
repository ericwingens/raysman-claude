import React from "react";
import { POSTS, byId } from "../data.js";
import { photoStyle, EUR, num, Ico } from "../lib.jsx";

/* Fanso layer: content feed with PPV-locked posts, likes, tips. */
export default function Feed({ ctx }) {
  return (
    <>
      <div className="appbar" style={{ padding: "6px 0 10px" }}>
        <div><h1>Feed</h1><div className="sub">Von Creators, denen du folgst</div></div>
        <button className="iconbtn" onClick={() => ctx.toast("Benachrichtigungen")}><Ico name="bell" /></button>
      </div>
      {POSTS.map((p) => <Post key={p.id} p={p} ctx={ctx} />)}
    </>
  );
}

function Post({ p, ctx }) {
  const c = byId(p.cid);
  const unlockedPost = ctx.unlocked.has(p.id) || !p.ppv;
  const liked = ctx.likedPosts.has(p.id);

  const like = () => {
    ctx.setLikedPosts((s) => {
      const n = new Set(s);
      liked ? n.delete(p.id) : n.add(p.id);
      return n;
    });
  };
  const unlock = () => {
    if (ctx.spend(p.price, `Freigeschaltet! ${EUR(p.price)} abgebucht.`)) {
      ctx.setUnlocked((s) => new Set(s).add(p.id));
    } else ctx.push("wallet");
  };

  return (
    <article className="post">
      <div className="post-head">
        <div className="avatar ring" onClick={() => ctx.push("profile", c.id)}><div style={photoStyle(c.id)} /></div>
        <div>
          <div className="n" onClick={() => ctx.push("profile", c.id)}>{c.name} {c.verified && <span className="badge-verif" style={{ width: 15, height: 15 }}><Ico name="verif" /></span>}</div>
          <div className="t">{c.city} · {p.time}</div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: "auto", marginLeft: "auto", padding: "8px 14px" }} onClick={() => ctx.push("profile", c.id)}>Profil</button>
      </div>

      <div className="post-media">
        <div style={{ position: "absolute", inset: 0, ...photoStyle(p.id), filter: unlockedPost ? "none" : "blur(2px)" }} />
        {!unlockedPost && (
          <div className="locked">
            <div className="lk"><Ico name="lock" /></div>
            <h4>Exklusiver Inhalt</h4>
            <p>{c.name} hat diesen Post gesperrt. Schalte ihn einmalig frei.</p>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={unlock}>Freischalten für {EUR(p.price)}</button>
          </div>
        )}
      </div>

      <div className="post-actions">
        <span className={`a ${liked ? "on" : ""}`} onClick={like}><Ico name="heart" /><span className="tnum">{num(p.likes + (liked ? 1 : 0))}</span></span>
        <span className="a" onClick={() => ctx.push("chat", c.id)}><Ico name="comment" /><span>Kommentar</span></span>
        <span className="a" onClick={() => ctx.push("tip", c.id)}><Ico name="gift" />Tip</span>
        <span className="a spacer" style={{ color: "var(--orange)" }} onClick={() => ctx.push("tip", c.id)}><Ico name="bolt" />Senden</span>
      </div>
      <div className="post-cap"><b>{c.name}</b> {p.cap}</div>
    </article>
  );
}
