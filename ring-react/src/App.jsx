import React, { useEffect, useRef, useState, useCallback } from "react";
import { CREATORS, byId } from "./data.js";
import { EUR, Ico } from "./lib.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import EditProfile from "./overlays/EditProfile.jsx";
import Discover from "./screens/Discover.jsx";
import Explore from "./screens/Explore.jsx";
import Feed from "./screens/Feed.jsx";
import Chats from "./screens/Chats.jsx";
import Me from "./screens/Me.jsx";
import { ProfileFull, ChatFull, TipSheet, WalletSheet, CallScreen, LegalFull } from "./overlays/Overlays.jsx";

export default function App() {
  // ---- global state ----
  const [phase, setPhase] = useState("welcome"); // welcome | main
  const [view, setView] = useState("discover");
  const [balance, setBalance] = useState(24.5);
  const [subs, setSubs] = useState(() => new Set(["mia"]));
  const [unlocked, setUnlocked] = useState(() => new Set());
  const [likedPosts, setLikedPosts] = useState(() => new Set());
  const [likedPeople, setLikedPeople] = useState(() => new Set());
  const [overlays, setOverlays] = useState([]); // stack: {kind, id}
  const [call, setCall] = useState(null); // {id, secs, cost, status}
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // Ref mirrors balance so ticker callbacks & spend read the current value synchronously.
  const balanceRef = useRef(balance);
  useEffect(() => { balanceRef.current = balance; }, [balance]);

  const spend = useCallback(
    (amount, label) => {
      if (balanceRef.current < amount) {
        toast("Guthaben zu niedrig — bitte aufladen.");
        return false;
      }
      setBalance((b) => +(b - amount).toFixed(4));
      if (label) toast(label);
      return true;
    },
    [toast]
  );

  const push = (kind, id) => setOverlays((o) => [...o, { kind, id, key: Date.now() + Math.random() }]);
  const pop = () => setOverlays((o) => o.slice(0, -1));
  const popAll = () => setOverlays([]);

  // ---- paid call ticker ----
  useEffect(() => {
    if (!call || call.status !== "connected") return;
    const c = byId(call.id);
    const t = setInterval(() => {
      const perSec = c.rate / 60;
      if (balanceRef.current - perSec <= 0) {
        setBalance(0);
        endCall(true);
        return;
      }
      setBalance((b) => +(b - perSec).toFixed(4));
      setCall((cc) => (cc ? { ...cc, secs: cc.secs + 1, cost: cc.cost + perSec } : cc));
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.status, call?.id]);

  const startCall = (id) => {
    popAll();
    setCall({ id, secs: 0, cost: 0, status: "connecting" });
    setTimeout(() => setCall((c) => (c && c.id === id ? { ...c, status: "connected" } : c)), 1400);
  };
  const endCall = (broke = false) => {
    setCall((c) => {
      if (c && c.secs > 0) {
        const m = Math.floor(c.secs / 60), s = String(c.secs % 60).padStart(2, "0");
        toast(`Call beendet · ${m}:${s} · ${EUR(c.cost)}${broke ? " · Guthaben leer" : ""}`);
      }
      return null;
    });
    if (broke) setTimeout(() => push("wallet"), 400);
  };

  // ---- clock ----
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 10000); return () => clearInterval(t); }, []);

  const ctx = {
    balance, setBalance, subs, setSubs, unlocked, setUnlocked,
    likedPosts, setLikedPosts, likedPeople, setLikedPeople,
    toast, spend, push, pop, popAll, startCall, endCall, setPhase,
  };

  const Screen = { discover: Discover, explore: Explore, feed: Feed, chats: Chats, me: Me }[view];

  return (
    <div className="phone">
      <div className="notch" />
      <div className="statusbar">
        <span className="tnum">{now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}</span>
        <span className="dots">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="1.5" width="3" height="10.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
          <span className="bar" />
        </span>
      </div>

      <div className="app">
        <div className="screen" key={view}>
          <div className="pad">
            <Screen ctx={ctx} />
          </div>
        </div>

        {/* bottom tabbar */}
        <nav className="tabbar">
          <Tab v="discover" cur={view} set={setView} icon="layers" label="Discover" />
          <Tab v="explore" cur={view} set={setView} icon="compass" label="Explore" />
          <button className="tab center" onClick={() => setView("feed")}>
            <span className="fab"><Ico name="plus" /></span>
          </button>
          <Tab v="chats" cur={view} set={setView} icon="chat" label="Chats" dot />
          <Tab v="me" cur={view} set={setView} icon="user" label="Me" />
        </nav>
      </div>

      {/* overlay stack */}
      {overlays.length > 0 && <div className="sheet-scrim show" onClick={pop} />}
      {overlays.map((o) => {
        const P = { profile: ProfileFull, chat: ChatFull, tip: TipSheet, wallet: WalletSheet, legal: LegalFull, edit: EditProfile }[o.kind];
        return P ? <P key={o.key} id={o.id} ctx={ctx} /> : null;
      })}

      {call && <CallScreen call={call} ctx={ctx} />}

      {phase === "welcome" && <Onboarding ctx={ctx} done={() => setPhase("main")} />}

      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}

function Tab({ v, cur, set, icon, label, dot }) {
  return (
    <button className={`tab ${cur === v ? "on" : ""}`} onClick={() => set(v)}>
      <Ico name={icon} />
      {dot && <span className="dot" />}
      <span>{label}</span>
    </button>
  );
}
