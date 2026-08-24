import React, { useEffect, useRef, useState, useCallback } from "react";
import { CREATORS, byId, REVIEWS, FREE_SECS, CREATOR_ME } from "./data.js";
import { EUR, Ico } from "./lib.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import EditProfile from "./overlays/EditProfile.jsx";
import StudioFull from "./overlays/Studio.jsx";
import StatsFull from "./overlays/Stats.jsx";
import Discover from "./screens/Discover.jsx";
import Explore from "./screens/Explore.jsx";
import Feed from "./screens/Feed.jsx";
import Chats from "./screens/Chats.jsx";
import Me from "./screens/Me.jsx";
import { ProfileFull, ChatFull, TipSheet, WalletSheet, CallScreen, LegalFull, BookSheet, RateSheet, GiftSheet, ShareSheet, AddPeopleSheet, MoreSheet, ReportSheet, BlockedFull } from "./overlays/Overlays.jsx";

export default function App() {
  // ---- global state ----
  const [phase, setPhase] = useState("welcome"); // welcome | main
  const [view, setView] = useState("discover");
  const [balance, setBalance] = useState(24.5);
  const [subs, setSubs] = useState(() => new Set(["mia"]));
  const [unlocked, setUnlocked] = useState(() => new Set());
  const [likedPosts, setLikedPosts] = useState(() => new Set());
  const [likedPeople, setLikedPeople] = useState(() => new Set());
  const [bookings, setBookings] = useState([]); // {id, cid, svc, dayOffset, time}
  const [reviews, setReviews] = useState(REVIEWS);   // seeded, grows as the user rates
  const [ratePrompt, setRatePrompt] = useState(null); // creator id awaiting a rating
  const [giftFor, setGiftFor] = useState(null);      // creator id the gift picker targets
  const [shareFor, setShareFor] = useState(null);    // post id the share sheet targets
  const [guests, setGuests] = useState([]);          // extra participants in the running call
  const [freeUsed, setFreeUsed] = useState(() => new Set()); // creators whose free minutes are spent
  const [blocked, setBlocked] = useState(() => new Set());   // creators the user has blocked
  const [creator, setCreator] = useState(() => ({ ...CREATOR_ME, services: CREATOR_ME.services.map((x) => ({ ...x })) }));
  const [moreFor, setMoreFor] = useState(null);   // {id, what} — the ⋯ action menu
  const [reportFor, setReportFor] = useState(null); // {id, what} — the report form
  const [addPeople, setAddPeople] = useState(false);
  const [flying, setFlying] = useState(null);        // emoji floating up after a gift
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

  // Same reason: the ticker and endCall need the live call synchronously.
  const callRef = useRef(call);
  useEffect(() => { callRef.current = call; }, [call]);

  // startCall has to know *before* the re-render whether the free minutes are
  // still available, so the set is mirrored and written through.
  const freeUsedRef = useRef(freeUsed);
  useEffect(() => { freeUsedRef.current = freeUsed; }, [freeUsed]);

  // Blocking has to take effect inside the same click that triggers it —
  // startCall and endCall read the set before React re-renders.
  const blockedRef = useRef(blocked);
  useEffect(() => { blockedRef.current = blocked; }, [blocked]);

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
  // The first `call.free` seconds run without charge; only after that does the
  // per-second rate start moving the balance.
  useEffect(() => {
    if (!call || call.status !== "connected") return;
    const c = byId(call.id);
    const t = setInterval(() => {
      const live = callRef.current;
      if (!live) return;
      if (live.secs < live.free) {
        const next = live.secs + 1;
        setCall((cc) => (cc ? { ...cc, secs: cc.secs + 1 } : cc));
        if (next >= live.free) toast("Freiminuten aufgebraucht — ab jetzt läuft die Abrechnung");
        return;
      }
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

  // Blocking closes whatever is open on that person and cuts a running call.
  const block = (id) => {
    blockedRef.current = new Set(blockedRef.current).add(id);
    setBlocked(blockedRef.current);
    setGuests((g) => g.filter((x) => x !== id));
    if (callRef.current && callRef.current.id === id) endCall(false);
    popAll();
    toast(`${byId(id).name} blockiert — ihr seht euch nicht mehr.`);
  };
  const unblock = (id) => {
    blockedRef.current = new Set(blockedRef.current);
    blockedRef.current.delete(id);
    setBlocked(blockedRef.current);
    toast(`${byId(id).name} entsperrt.`);
  };

  const startCall = (id) => {
    if (blockedRef.current.has(id)) { toast(`${byId(id).name} ist blockiert — erst entsperren.`); return; }
    popAll();
    const free = freeUsedRef.current.has(id) ? 0 : FREE_SECS;
    if (free) {
      // Burn the allowance at dial time, so hanging up and redialling can't reset it.
      freeUsedRef.current = new Set(freeUsedRef.current).add(id);
      setFreeUsed(freeUsedRef.current);
    }
    setCall({ id, secs: 0, cost: 0, free, status: "connecting" });
    setTimeout(() => setCall((c) => (c && c.id === id ? { ...c, status: "connected" } : c)), 1400);
  };
  const endCall = (broke = false) => {
    const live = callRef.current;
    const rated = live && live.secs > 0 ? live.id : null;
    setGuests([]);
    setCall((c) => {
      if (c && c.secs > 0) {
        const m = Math.floor(c.secs / 60), s = String(c.secs % 60).padStart(2, "0");
        const gratis = c.free > 0 ? " · 3 Freiminuten inklusive" : "";
        toast(`Call beendet · ${m}:${s} · ${EUR(c.cost)}${gratis}${broke ? " · Guthaben leer" : ""}`);
      }
      return null;
    });
    if (broke) setTimeout(() => push("wallet"), 400);
    else if (rated) setTimeout(() => setRatePrompt(rated), 500);
  };

  // ---- clock ----
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 10000); return () => clearInterval(t); }, []);

  const ctx = {
    balance, setBalance, subs, setSubs, unlocked, setUnlocked,
    likedPosts, setLikedPosts, likedPeople, setLikedPeople,
    bookings, setBookings,
    reviews, setReviews,
    openGift: setGiftFor,
    openShare: setShareFor,
    call, guests, setGuests, openAddPeople: () => setAddPeople(true),
    freeUsed,
    blocked, block, unblock,
    creator, setCreator,
    openMore: (id, what) => setMoreFor({ id, what }),
    openReport: (id, what) => setReportFor({ id, what }),
    flyGift: (em) => { setFlying({ em, key: Date.now() }); setTimeout(() => setFlying(null), 1700); },
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
        const P = { profile: ProfileFull, chat: ChatFull, tip: TipSheet, wallet: WalletSheet, legal: LegalFull, edit: EditProfile, book: BookSheet, blocked: BlockedFull, studio: StudioFull, stats: StatsFull }[o.kind];
        return P ? <P key={o.key} id={o.id} ctx={ctx} /> : null;
      })}

      {call && <CallScreen call={call} ctx={ctx} />}

      {ratePrompt && <RateSheet id={ratePrompt} ctx={ctx} close={() => setRatePrompt(null)} />}

      {giftFor && <GiftSheet id={giftFor} ctx={ctx} close={() => setGiftFor(null)} />}
      {shareFor && <ShareSheet id={shareFor} ctx={ctx} close={() => setShareFor(null)} />}
      {addPeople && <AddPeopleSheet ctx={ctx} close={() => setAddPeople(false)} />}
      {moreFor && <MoreSheet {...moreFor} ctx={ctx} close={() => setMoreFor(null)} />}
      {reportFor && <ReportSheet {...reportFor} ctx={ctx} close={() => setReportFor(null)} />}
      {flying && <div key={flying.key} className="giftfly">{flying.em}</div>}

      {phase === "welcome" && (
        <Onboarding ctx={ctx} done={() => setPhase("main")}
          onContacts={(ids) => {
            setLikedPeople((s) => { const n = new Set(s); ids.forEach((i) => n.add(i)); return n; });
            toast(`${ids.length} Kontakte zu ring meApp hinzugefügt`);
          }} />
      )}

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
