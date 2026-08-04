import React, { useState } from "react";
import { byId } from "../data.js";
import { photoStyle, EUR, Ico, RingLockup } from "../lib.jsx";

/*
 * Me — Profile Settings 1:1 after the Figma board:
 * photo grid, bio, voice message (edit recording), birthdate, gender,
 * change-image sheet, delete-account modal, Data Privacy & Imprint pages.
 * Plus Fanso layer: wallet, subscriptions, premium, become-a-creator.
 */
export default function Me({ ctx }) {
  const [modal, setModal] = useState(null); // 'delete' | 'image' | null

  return (
    <>
      <div className="appbar" style={{ padding: "6px 0 10px" }}>
        <div className="brandrow"><RingLockup height={34} /></div>
        <button className="iconbtn" onClick={() => ctx.toast("Benachrichtigungen")}><Ico name="bell" /></button>
      </div>

      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
        <div className="avatar ring" style={{ width: 96, height: 96, margin: "0 auto" }}><div style={photoStyle("you")} /></div>
        <h1 style={{ margin: "12px 0 2px", fontSize: 23 }}>Jane Doe · <span style={{ fontWeight: 600, color: "var(--muted)" }}>28</span></h1>
        <div className="muted" style={{ fontSize: 13 }}>Berlin · Fan-Konto</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={() => ctx.push("edit")}>Profil bearbeiten</button>
          <button className="btn btn-outline btn-sm" style={{ width: "auto" }} onClick={() => setModal("image")}>Bild ändern</button>
        </div>
      </div>

      <div className="stat-row" style={{ borderTop: "1px solid var(--line)", justifyContent: "space-around" }}>
        <div className="s center"><b className="tnum">{ctx.subs.size}</b><span>Abos</span></div>
        <div className="s center"><b className="tnum">{ctx.likedPeople.size}</b><span>Likes</span></div>
        <div className="s center"><b className="tnum">{EUR(ctx.balance)}</b><span>Guthaben</span></div>
      </div>

      {/* photos (Figma: profile settings photo grid) */}
      <div className="section-title">Meine Fotos</div>
      <div className="photo-grid">
        {["you", "you2", "you3"].map((s) => (
          <div key={s} className="ph" style={photoStyle(s)}><span className="rm" onClick={() => ctx.toast("Foto entfernt")}>✕</span></div>
        ))}
        <div className="ph" style={{ display: "grid", placeItems: "center", border: "1.6px dashed var(--line)", background: "var(--card-2)", cursor: "pointer", color: "var(--muted)" }}
          onClick={() => setModal("image")}>+</div>
      </div>

      {/* voice message (Ring signature) */}
      <div className="section-title">Sprachnachricht</div>
      <button className="btn btn-ghost" onClick={() => ctx.toast("Aufnahme bearbeiten")} style={{ justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Ico name="mic" /> Aufnahme bearbeiten</span>
        <span className="muted tnum" style={{ fontSize: 13 }}>00:08</span>
      </button>

      {/* editable fields */}
      <div className="section-title">Profil</div>
      <SetRow label="Bio" val="Kaffee, Berge & gute Gespräche. Frag mich nach meiner Playlist." ctx={ctx} />
      <SetRow label="Geburtsdatum" val="28.06.1998" ctx={ctx} />
      <SetRow label="Geschlecht" val="Weiblich" ctx={ctx} />
      <SetRow label="Ich suche" val="Alle" ctx={ctx} />

      {/* Fanso layer */}
      <div className="section-title">Konto</div>
      <Row icon="bolt" label="Wallet & Guthaben" right={EUR(ctx.balance)} onClick={() => ctx.push("wallet")} />
      <Row icon="star" label="Ring Premium" right="Upgrade" onClick={() => ctx.toast("Premium: unbegrenzte Likes, günstigere Calls & mehr")} />
      <Row icon="video" label="Creator werden" right="" onClick={() => ctx.toast("Werde Creator: verdiene mit Abos, Calls & PPV")} />

      <div className="section-title">Meine Abos</div>
      {[...ctx.subs].map((id) => {
        const c = byId(id);
        return <Row key={id} avatar={id} label={c.name} right="aktiv" onClick={() => ctx.push("profile", id)} />;
      })}
      {ctx.subs.size === 0 && <p className="muted" style={{ fontSize: 13 }}>Noch keine Abos.</p>}

      <div className="section-title">Rechtliches & Konto</div>
      <Row icon="lock" label="Datenschutz" right="" onClick={() => ctx.push("legal", "privacy")} />
      <Row icon="user" label="Impressum" right="" onClick={() => ctx.push("legal", "imprint")} />
      <Row icon="x" label="Konto löschen" right="" onClick={() => setModal("delete")} danger />

      <p className="center muted" style={{ fontSize: 11, marginTop: 20 }}>Ring · Prototyp · v1.0 — Design nach Ring-Figma, Funktionen nach Fanso</p>

      {/* Delete account modal (Figma 1:1) */}
      {modal === "delete" && (
        <Modal onClose={() => setModal(null)}>
          <h3>Konto löschen</h3>
          <p>Dein Profil, deine Matches und dein Guthaben werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.</p>
          <div className="mrow">
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Abbrechen</button>
            <button className="btn btn-primary btn-sm" style={{ background: "var(--heart)", boxShadow: "none" }}
              onClick={() => { setModal(null); ctx.toast("Demo: Konto nicht wirklich gelöscht 😉"); }}>Löschen</button>
          </div>
        </Modal>
      )}

      {/* Change image sheet (Figma 1:1) */}
      {modal === "image" && (
        <Modal onClose={() => setModal(null)}>
          <h3>Bild ändern</h3>
          <div style={{ width: 160, height: 160, borderRadius: 20, margin: "0 auto 16px", ...photoStyle("you") }} />
          <button className="btn btn-primary btn-sm" style={{ marginBottom: 8 }} onClick={() => { setModal(null); ctx.toast("Galerie geöffnet (Demo)"); }}>📁 Aus Galerie wählen</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setModal(null); ctx.toast("Kamera geöffnet (Demo)"); }}>📷 Foto aufnehmen</button>
        </Modal>
      )}
    </>
  );
}

function SetRow({ label, val, ctx }) {
  return (
    <div className="set-row">
      <div style={{ minWidth: 0, paddingRight: 12 }}>
        <div className="lbl">{label}</div>
        <div className="val">{val}</div>
      </div>
      <span className="pen" onClick={() => ctx.toast(`${label} bearbeiten`)}>✎</span>
    </div>
  );
}

function Row({ icon, avatar, label, right, onClick, danger }) {
  return (
    <div className="chat-row" onClick={onClick}>
      {avatar
        ? <span className="avatar" style={{ width: 38, height: 38, ...photoStyle(avatar) }} />
        : <span className="iconbtn" style={{ width: 38, height: 38, pointerEvents: "none", color: danger ? "var(--heart)" : undefined }}><Ico name={icon} /></span>}
      <div className="n" style={{ fontSize: 14.5, color: danger ? "var(--heart)" : undefined }}>{label}</div>
      <div className="meta"><span className="muted" style={{ fontSize: 13 }}>{right}</span></div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="modal show" onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,1,.5)" }} />
      <div className="mbox" style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
