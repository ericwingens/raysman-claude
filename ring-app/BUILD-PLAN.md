# Ring — Technischer Build-Plan

> **Match. Ring. Connect.** — Dating-/Matching-Design der „Ring"-App (Figma *„Ring – Mockup – v6"*) kombiniert mit der Creator-Economy-Funktionalität von [Fanso](https://fanso.io/).
>
> Dieses Dokument beschreibt den Umbau des bestehenden Single-File-HTML-Prototyps (`ring-app/index.html`) in ein echtes React-+-Vite-Web-Projekt mit späterer Portierung nach Expo/React Native, inklusive Backend- und Feature-Roadmap.
>
> **Stand:** M0 (interaktiver Prototyp) abgeschlossen. Alle folgenden Meilensteine sind offen.
> **Hinweis:** Rechts- und Zahlungsaussagen in diesem Dokument sind technische Orientierung, **keine Rechtsberatung**. Vor Launch ist eine anwaltliche Prüfung zwingend (siehe §7).

---

## 1. Übersicht & Ziel

**Ring** ist eine Mobile-First-App, die zwei bewährte Produktmuster verschmilzt:

1. **Ring-Design & Informationsarchitektur** — Tinder-artige Dating-/Matching-App mit integriertem, **kostenpflichtigem Telefon-/Video-Call**. Ring verlangt bereits ~0,99 €/Min für Calls. Look & Feel: weißer Hintergrund, warmes **Orange (#F5761A)**, Amber→Rot-Logo-Verlauf, Pill-Buttons, verspielte Herzchen, Foto-Swipe-Karten, runde Avatare, fette schwarze Headlines, cleane iOS-System-Font-Typografie, Light + Dark Mode.
2. **Fanso-Funktionalität** — White-Label-OnlyFans/Fansly-Plattform: Creator-Abo-Tiers (Free/Paid monatlich), Pay-per-View (PPV) für gesperrte Posts und DMs, Tipping (Profil, Post, Chat, während Calls), bezahlte Direktnachrichten, Livestreaming, Content-Feed/Stories, Creator-/Fan-/Admin-Dashboards, Wallet-/Credits-System. Zahlungen via Stripe & PayPal.

### Zielgruppen

| Rolle | Bedürfnis | Kernwertschöpfung |
|---|---|---|
| **Fan** | Creator entdecken, matchen, in Kontakt treten | Swipe-Discovery, bezahlte 1:1-Calls, Abos, PPV, Tips |
| **Creator** | Reichweite monetarisieren | Abo-Einnahmen, €/Min-Calls, PPV-Verkäufe, Tips, Livestream, Auszahlungen |
| **Admin/Ops** | Plattform betreiben & absichern | Moderation, KYC, Auszahlungen, Fraud/Chargeback, Reporting |

### Kern-Monetarisierung (aus dem Prototyp abgeleitet, Werte in `index.html`)

- **Bezahlte Calls** pro Minute (Ring-Kernfunktion): Creator-Raten von **0,99 € bis 2,49 €/Min**.
- **Abo-Tiers** je Creator: **Free** (0 €) und **VIP** (z. B. 9,99 €/Monat, inkl. DMs, 10 % Call-Rabatt, Livestream-Zugang).
- **Pay-per-View** in Feed (z. B. 4,99 €) und DMs (z. B. 1,99 €).
- **Tips** (Beträge 2/5/10/20/50 €) auf Profilen, Posts, im Chat und live im Call.
- **Wallet-Guthaben**, das durch alle Aktionen live aktualisiert wird (Prototyp-Start: 24,50 €).

---

## 2. Architektur

### 2.1 Zielbild (High-Level)

```
┌──────────────┐   ┌──────────────┐   ┌─────────────────┐
│  Web (React  │   │ Native (Expo │   │  Creator/Admin  │
│  + Vite)     │   │  / RN)       │   │  Dashboard      │
└──────┬───────┘   └──────┬───────┘   └────────┬────────┘
       │  shared design tokens + shared TS SDK   │
       └───────────────────┬─────────────────────┘
                           │  HTTPS / WSS
                  ┌────────▼─────────┐
                  │   API-Gateway    │  (NestJS, REST + WS)
                  └──┬───┬───┬───┬───┘
        ┌────────────┘   │   │   └────────────┐
   ┌────▼────┐  ┌────────▼┐ ┌▼────────┐  ┌────▼─────┐
   │Postgres │  │  Redis  │ │ Object  │  │ Payment  │
   │(primary)│  │(cache/  │ │ Storage │  │ (Stripe/ │
   │         │  │ pub-sub)│ │ (S3)+CDN│  │ PayPal)  │
   └─────────┘  └─────────┘ └─────────┘  └──────────┘
                  ┌─────────────────────────────────┐
                  │ WebRTC-Ebene: SFU (LiveKit)      │
                  │ + TURN/STUN (coturn)             │
                  └─────────────────────────────────┘
```

### 2.2 Frontend

**Jetzt: React + Vite (Web-PWA).**

- **Vite + React 18 + TypeScript** — schnelle DX, ESM, einfacher Pfad zu RN via geteilter Logik.
- **State/Data:** TanStack Query (Server-State) + Zustand (lokaler UI-State; ersetzt das globale `state`-Objekt des Prototyps: `balance`, `subs`, `unlocked`, `liked`, `deckIdx`, `callSecs/callCost/callRate`).
- **Routing:** React Router (Web) → in RN via React Navigation gespiegelt; Routen-/Screen-Namen identisch halten.
- **Styling & Design-Tokens:** Die im Prototyp bereits als CSS-Custom-Properties definierten Tokens (`--orange:#F5761A`, `--brand-grad`, `--heart:#FF3D71`, `--live:#25C26E`, Radius, Schatten, Light/Dark-Sets) werden in eine **framework-neutrale `tokens.ts`** überführt (Single Source of Truth). Web: CSS-Variablen; RN: gleiche Werte als JS-Objekt. So bleibt der Look 1:1 portierbar.
- **Animation:** Framer Motion (Web) für Swipe-Deck, Sheets, Herz-Burst; in RN via Reanimated + Gesture Handler nachbauen.
- **Icons/Assets:** Die Inline-SVG-Icons (`I.heart`, `I.phone`, …) als React-Komponenten-Set. Foto-Platzhalter (deterministische Mesh-Gradienten via `hashStr`/`grad`) als Fallback beibehalten, bis echte Medien vorliegen.

**Komponentenstruktur (Vorschlag):**

```
src/
  tokens.ts               // Design-Tokens (light/dark)
  lib/                    // API-SDK, formatEUR, hashStr/grad, WebRTC-Client
  store/                  // Zustand-Stores (wallet, session, call)
  components/             // Button (pill), Chip, Avatar, Sheet, Tier, PostCard…
  screens/
    Onboarding/ Welcome, Login, Register (Steps), StartRecording
    Discover/  SwipeDeck, DeckActions
    Explore/   Stories, CreatorGrid
    Feed/      PostCard (PPV-Lock)
    Chats/     ChatList, ChatDetail (paid DM)
    Profile/   CreatorProfile (Tiers, Gallery, Ring-me)
    Call/      CallScreen (Cost-Ticker)
    Wallet/    Wallet (Top-up, Tx-History)
    Me/        Settings, Privacy, Imprint
```

**Später: Expo / React Native (native iOS/Android).**

- Geschäftslogik, Tokens, TS-API-SDK und Datentypen werden geteilt (Monorepo, z. B. **pnpm workspaces + Turborepo**: `packages/core`, `apps/web`, `apps/native`).
- WebRTC nativ via **`react-native-webrtc`** bzw. das LiveKit-RN-SDK.
- Store-spezifisch: In-App-Purchase-Zwang von Apple/Google prüfen (§10) — ggf. digitale Güter über IAP statt Stripe.

### 2.3 Backend

- **Runtime/Framework:** **Node.js + NestJS** (TypeScript, modular, DI, gut für REST + WebSocket-Gateways + Queues). Alternative: Fastify. TS im Backend erlaubt geteilte Typen/DTOs mit dem Frontend.
- **Datenbank:** **PostgreSQL** (relationale Integrität für Ledger, Abos, Unlocks). ORM: Prisma oder TypeORM. **Alle Geldbewegungen laufen über ein append-only Ledger (§4).**
- **Cache / Pub-Sub / Presence:** **Redis** — Session/Rate-Limit-Cache, Online-Presence, WebSocket-Fan-out, Call-Metering-Heartbeat, Idempotenz-Keys.
- **Object Storage:** S3-kompatibel (AWS S3 / Cloudflare R2 / MinIO) für Fotos, Videos, PPV-Assets. Zugriff nur über **signierte, zeitlich begrenzte URLs**; PPV-Medien niemals öffentlich.
- **Media/CDN-Ebene:** CDN (CloudFront / Cloudflare) vor dem Storage; Transcoding-Pipeline (z. B. `ffmpeg`-Worker oder Mux/Cloudflare Stream) für Video-Varianten, Thumbnails und HLS für Livestream/VOD.
- **Realtime:** WebSocket-Gateway (NestJS Gateway + Redis-Adapter) für Chat, Presence, Typing, Livestream-Chat, Tip-Events, Call-Signaling-Events.
- **Payments:** Stripe (+ Stripe Connect für Payouts) und PayPal; Webhook-Handler für asynchrone Bestätigung. Adult-Content-Policy-Risiko siehe §10 (ggf. CCBill/Segpay).
- **Async/Jobs:** BullMQ (Redis) für Payout-Batches, Transcoding, Benachrichtigungen, Webhook-Retries.

### 2.4 Echtzeit-Calls (WebRTC)

- **SFU:** **LiveKit** (self-hostbar, gute RN/Web-SDKs, Recording-Egress, skaliert Räume) — Alternativen: mediasoup (mehr Kontrolle, mehr Aufwand) oder Managed-Provider (Daily, Twilio, Agora).
- **TURN/STUN:** eigener **coturn** oder Provider-TURN — Pflicht, damit Calls hinter NAT/Firewalls durchkommen.
- **Signaling:** über das bestehende WebSocket-Gateway (Angebot/Antwort/ICE, plus Ring-spezifische Events: `call.authorized`, `call.tick`, `call.ended`).

---

## 3. Datenmodell

Kern-Entities (Postgres). PKs `id` (UUID/ULID), Timestamps `created_at`/`updated_at` überall implizit.

| Entity | Schlüsselfelder | Relationen / Notizen |
|---|---|---|
| **User** | `email`, `password_hash`, `role` (`fan`\|`creator`\|`admin`), `display_name`, `age`/`birthdate`, `gender`, `looking_for`, `city`, `avatar_media_id`, `age_verified_at`, `status` | 1:1 → CreatorProfile (wenn creator); 1:1 → Wallet |
| **CreatorProfile** | `user_id`, `bio`, `tags[]`, `verified`, `call_rate_per_min`, `is_live`, `is_online`, `followers_count`, `subs_count`, `payout_account_id` | 1:N Tiers, Posts, Livestreams; `call_rate_per_min` = Prototyp-`rate` (0,99–2,49 €) |
| **SubscriptionTier** | `creator_id`, `name` (`Free`/`VIP`), `price_month`, `perks[]`, `active` | Prototyp: Free 0 €, VIP 9,99 € (DMs inkl., 10 % Call-Rabatt, Livestream) |
| **Subscription** | `fan_id`, `creator_id`, `tier_id`, `status` (`active`/`canceled`/`past_due`), `current_period_end`, `provider_sub_id` | N:M Fan↔Creator über Tier; treibt Feed-Zugang & DM-Freischaltung |
| **Post** | `creator_id`, `caption`, `media_ids[]`, `is_ppv`, `ppv_price`, `visibility` (`public`/`subscribers`/`ppv`), `likes_count` | 1:N Media; PPV-Preis wie Prototyp (z. B. 4,99 €) |
| **Media** | `owner_id`, `type` (`image`/`video`), `storage_key`, `variants` (thumb/hls), `blurhash`, `duration`, `moderation_status` | referenziert von Post, Message, Avatar, Livestream |
| **PostUnlock** | `fan_id`, `post_id`, `price_paid`, `ledger_tx_id` | PPV-Kauf; Unique(fan, post) — spiegelt `state.unlocked` |
| **Message** | `conversation_id`, `sender_id`, `body`, `media_ids[]`, `is_paid`, `price`, `unlocked` | 1:N in Conversation; bezahlte DMs |
| **PaidMessageUnlock** | `fan_id`, `message_id`, `price_paid`, `ledger_tx_id` | Freischaltung bezahlter DM (Prototyp: 1,99 €) |
| **Conversation** | `fan_id`, `creator_id`, `last_message_at`, `unread_count` | Match- bzw. Chat-Thread |
| **Tip** | `sender_id`, `recipient_id`, `amount`, `context` (`profile`/`post`/`chat`/`call`), `context_id`, `ledger_tx_id` | Beträge 2/5/10/20/50 € |
| **Call** | `fan_id`, `creator_id`, `type` (`audio`/`video`/`live`), `rate_per_min`, `started_at`, `ended_at`, `duration_secs`, `total_cost`, `status` (`ringing`/`active`/`ended`/`cutoff`), `room_id`, `end_reason` | Metering-Quelle; `total_cost` = Summe der Ticks (§5) |
| **Wallet** | `user_id`, `balance` (Cent, integer), `currency` (`EUR`), `version` (optimistic lock) | 1:1 User; **Geld nie als float speichern** |
| **WalletTransaction (Ledger)** | `wallet_id`, `type` (`topup`/`ppv`/`sub`/`tip`/`call`/`payout`/`refund`/`hold`/`capture`/`release`), `amount` (signed, Cent), `balance_after`, `ref_type`, `ref_id`, `provider_ref`, `idempotency_key` | **append-only**; jede Guthabenänderung = eine Zeile |
| **Match / Like** | `from_user_id`, `to_user_id`, `kind` (`like`/`superlike`/`pass`), `is_match` | Discovery-Swipe; `superlike` = „Super Ring" |
| **LivestreamSession** | `creator_id`, `title`, `status` (`live`/`ended`), `room_id`, `viewer_count`, `started_at`, `recording_media_id` | Livestream + optionale VOD-Aufzeichnung |
| **Payout** | `creator_id`, `amount`, `period`, `status`, `provider_ref`, `fees` | Stripe-Connect-Auszahlung (§4) |
| **ModerationCase / Report** | `subject_type`, `subject_id`, `reporter_id`, `reason`, `status`, `resolution` | Trust & Safety (§7) |

**Faustregel:** Alles, was Geld bewegt (PPV, Abo, Tip, Call-Tick, Top-up, Payout, Refund), erzeugt **genau eine** `WalletTransaction`-Zeile mit `idempotency_key`. Der `Wallet.balance` ist eine materialisierte Sicht und muss jederzeit = Summe des Ledgers sein (Invariante, per Job prüfbar).

---

## 4. Zahlungen & Wallet

### 4.1 Modell

- **Wallet als Prepaid-Guthaben** (wie im Prototyp): Fan lädt auf, alle Käufe/Calls/Tips gehen gegen das Guthaben. Vorteil: schnelle Micro-Transaktionen (Call-Ticks, PPV) ohne pro Aktion die Zahlungsseite aufzurufen.
- **Geld in Ganzzahl-Cent** speichern (`integer`), Anzeige via `formatEUR` (Prototyp: `toLocaleString("de-DE", {minimumFractionDigits:2})`).
- **Ledger = einzige Wahrheit** (append-only, §3). Balance-Updates unter optimistischem Lock (`Wallet.version`) oder DB-Row-Lock, um Races bei parallelen Ticks/Käufen zu verhindern.

### 4.2 Aufladen (Top-up)

- Stripe (Payment Intents / Checkout) und PayPal. Guthaben wird **erst nach Webhook-Bestätigung** gutgeschrieben (`payment_intent.succeeded`), nicht clientseitig.
- Idempotenz: `idempotency_key` pro Top-up-Versuch; Webhook-Handler idempotent (Provider-`event.id` als Dedupe-Key).
- Packs wie im Prototyp: 10 / 25 / 50 / 100 €.

### 4.3 Holds/Escrow für Calls

Zwei praktikable Varianten:

1. **Prepaid-Cutoff (empfohlen, spiegelt den Prototyp):** Da das Guthaben bereits vorab kassiert wurde, ist keine separate Karten-Autorisierung nötig. Beim Call-Start wird geprüft, ob Guthaben > Mindestbetrag (z. B. ≥ 1 Minute Rate). Danach **pro Tick abbuchen** und bei Guthaben = 0 hart trennen.
2. **Card-Auth + Capture (falls ohne Prepaid-Wallet):** Beim Call-Start Betrag X autorisieren (Hold), nach Call-Ende die tatsächliche Dauer capturen, Rest freigeben. Aufwändiger, Auth-Ablaufzeiten beachten.

### 4.4 Per-Minute-Call-Billing (mirror des Prototyps)

Prototyp-Logik (`tickCall`), die serverseitig autoritativ nachgebaut wird:

```
perSec        = rate_per_min / 60
jede Sekunde: cost += perSec
              wenn (balance - perSec) <= 0:
                  balance = 0; call beenden (end_reason = "cutoff")
              sonst:
                  balance -= perSec
```

- **Server ist autoritativ.** Der Client zeigt nur den Ticker (`callCost`, `callTime`); die echte Verbrauchsrechnung läuft im Backend (Redis-Heartbeat + periodischer Ledger-Flush, z. B. alle 5–15 s aggregiert statt 1 Ledger-Zeile/Sekunde).
- **Cutoff:** Bei erschöpftem Guthaben SFU-Teilnehmer trennen und Fan zur Wallet leiten (Prototyp öffnet Wallet nach `broke`).
- **Settlement:** Am Call-Ende `Call.total_cost`, `duration_secs`, `end_reason` schreiben; eine (oder aggregierte) `WalletTransaction` vom Typ `call`; Beleg/Receipt erzeugen.

### 4.5 Payouts an Creator

- **Stripe Connect** (Express/Custom Accounts): Creator-Onboarding inkl. KYC. Einnahmen (Abo, Call, PPV, Tip) werden pro Creator als **Guthaben-Ansprüche** verbucht; periodische Auszahlung (`Payout`) minus Plattform-Provision.
- **Plattform-Provision / Fee:** konfigurierbarer Prozentsatz (z. B. 20 %) pro Umsatzart; transparent im Ledger führen (Brutto, Fee, Netto).
- **Refunds:** Gegenbuchung im Ledger (`refund`), Verknüpfung zur Original-Tx; Provider-Refund nur bei Kartenzahlungen relevant, Wallet-interne Stornos als Ledger-Reversal.
- **Idempotenz** überall: Top-ups, Webhooks, Ticks, Payouts.

### 4.6 Steuern / VAT (DE/EU-Kontext)

- **USt. auf digitale Dienstleistungen** an Endverbraucher in der EU: Leistungsort = Wohnsitz des Kunden (**MOSS/OSS**-Verfahren). USt.-Satz nach Kundenland; Nachweis (2 nicht-widersprüchliche Belege, z. B. Rechnungsland + IP) erforderlich.
- **Kleinunternehmerregelung (§ 19 UStG):** falls anwendbar, keine USt.-Ausweisung — für eine skalierende Plattform aber meist nicht praktikabel.
- **Creator-Auszahlungen:** Creator sind i. d. R. selbst steuerpflichtig; Plattform muss ggf. **DAC7**-Meldepflichten (Plattformbetreiber-Meldung an Finanzbehörden) erfüllen.
- **Rechnungen/Belege** für Top-ups und Käufe generieren und archivieren (GoBD-konform).
- **→ Steuerberatung + Rechtsberatung zwingend vor Launch.**

---

## 5. Paid Calls (WebRTC) — End-to-End-Flow

```
Fan tippt „Ring me · X €/Min"  (Profil oder Discover-Call-Button)
   │
   ▼
[1] Guthaben-Check/Autorisierung
    - Backend prüft: balance >= min. (z. B. 1 Min Rate)?  sonst → Wallet
    - Call-Row angelegt (status=ringing), rate_per_min gesetzt
   │
   ▼
[2] Signaling (WebSocket)
    - Fan & Creator treten LiveKit-Raum bei (Token vom Backend)
    - TURN/STUN vermittelt NAT-Traversal
   │
   ▼
[3] Connect (status=active, started_at)
    - Prototyp: nach ~1,4 s "verbunden", dann setInterval(tickCall, 1000)
   │
   ▼
[4] Per-Minute-Metering (server-autoritativ)
    - Redis-Heartbeat zählt Sekunden; perSec = rate/60
    - Client zeigt Live-Cost-Ticker (callCost) + Timer (mm:ss)
    - Ledger-Flush aggregiert (z. B. alle 10 s)
   │
   ├─ Guthaben erschöpft → [5a] Cutoff (end_reason=cutoff), Trennen, Wallet öffnen
   │
   ▼
[5] Fan/Creator beendet → endCall
    - clearInterval, Raum verlassen
    - Settlement: total_cost, duration_secs, WalletTransaction(type=call)
   │
   ▼
[6] Receipt / Beleg
    - Toast im Prototyp: "Call beendet · mm:ss · X,XX €"
    - Persistenter Beleg in Tx-History (Wallet), Creator-Gutschrift
```

**Weitere Aspekte:**

- **TURN/SFU:** LiveKit-Räume pro Call; coturn für Fallback-Relay. Call-Tokens kurzlebig, an `Call.id` gebunden.
- **Tips im Call:** `openTip` bleibt live erreichbar (Prototyp: Tip-Button im Call-Controls-Bereich) → separate Ledger-Tx (`tip`, context=`call`).
- **Livestream-Calls:** `type=live` wird ebenfalls pro Minute abgerechnet (Prototyp-Hinweis: „Live-Anrufe werden pro Minute abgerechnet").
- **Recording & Consent:** Aufzeichnung nur mit **beidseitiger, protokollierter Einwilligung** (DSGVO, ggf. § 201 StGB Vertraulichkeit des Wortes). Recording-Egress von LiveKit → Storage; Aufbewahrung/Retention definieren.

---

## 6. Realtime

WebSocket-Gateway (NestJS + Redis-Adapter). Kanäle/Events:

| Feature | Events | Notizen |
|---|---|---|
| **Chat** | `message.new`, `message.unlocked`, `conversation.read` | bezahlte DMs: `is_paid`/`unlocked` (Prototyp `unlockDM`) |
| **Presence / Online** | `presence.online`, `presence.offline`, `presence.lastSeen` | Prototyp: grüner Presence-Dot, „● Online" |
| **Typing** | `typing.start`, `typing.stop` | debounced |
| **Livestream-Chat** | `live.message`, `live.viewerCount` | pro `LivestreamSession.room_id` |
| **Tip-Animationen** | `tip.received` | löst Herz-Burst (`heartBurst`) & Toast aus |
| **Call-Signaling** | `call.ring`, `call.tick`, `call.ended`, `call.cutoff` | Ticker-Sync, aber Abrechnung serverseitig |

Presence & Fan-out über Redis Pub/Sub; horizontale Skalierung der WS-Nodes über den Redis-Adapter.

---

## 7. Trust, Safety & Legal

> **Kritisch für eine Creator-/Erwachsenen-Plattform. Rechtsberatung ist vor Launch verpflichtend — die folgenden Punkte sind praktische Umsetzungshinweise, keine abschließende Rechtsberatung.**

- **Altersverifikation (18+):** Robuste Verifikation für Fans **und** Creator (nicht nur Checkbox). Für Creator und für Zugriff auf erwachsene Inhalte ggf. Ausweis-/Alters-Verifikationsdienst. Feld `age_verified_at` erst nach echter Prüfung setzen. Deutschland/JMStV: harte Altersverifikation (AV) für pornografische Inhalte gesetzlich gefordert.
- **KYC für Creator/Payouts:** Identitätsprüfung vor erster Auszahlung (über Stripe Connect / spezialisierten KYC-Anbieter). Verknüpft mit Steuer-/DAC7-Pflichten.
- **Content-Moderation:** Automatische Vorabprüfung (Hash-Matching gegen bekannte Missbrauchsinhalte, NSFW-Klassifikatoren) + menschliche Review-Queue (`ModerationCase`). Upload → `moderation_status=pending` bis freigegeben. **CSAM: Null-Toleranz, gesetzliche Melde-/Löschpflichten (NCMEC/BKA).**
- **Consent & 2257-artige Nachweise:** Für erwachsene Inhalte Nachweise über Einwilligung und Alter aller abgebildeten Personen führen (US-2257-Analogie; in DE über Vertrags-/Einwilligungsdokumentation). Aufbewahrung revisionssicher.
- **DSGVO/DSGVO-Betroffenenrechte:** Rechtsgrundlagen, Auftragsverarbeiter-Verträge (AVV) mit Stripe/PayPal/LiveKit/Storage/CDN, Auskunft/Löschung/Export, Datensparsamkeit, Verschlüsselung at-rest & in-transit, Löschkonzept/Retention.
- **DSA (Digital Services Act):** Melde-/Abhilfeverfahren („Notice & Action"), Transparenzpflichten, Kontaktstelle, ggf. Trusted-Flagger-Prozesse.
- **Reporting & Blocking:** Nutzer können Profile/Posts/Nachrichten melden und blockieren; Block wirkt auf Chat, Call, Discovery, Feed.
- **Chargeback / Fraud:** Velocity-Checks, Device-Fingerprinting, 3-D-Secure (SCA/PSD2) bei Kartenzahlung, Limits für Neukunden, manuelle Review bei Auffälligkeiten; Chargeback-Handling im Ledger.
- **Impressum & AGB (DE-Pflicht):** Impressum (§ 5 DDG/TMG), AGB, Datenschutzerklärung, Widerrufsbelehrung (bzw. Hinweis auf Erlöschen des Widerrufsrechts bei digitalen Inhalten), Zahlungs-/Nutzungsbedingungen für Fans und Creator. Der Prototyp verlinkt bereits „AGB", „Datenschutz" und „Datenschutz & Impressum".

---

## 8. Auszubauende Figma-Screens (Ring Mockup — 1:1)

Vollständiges Screen-Inventar aus dem Mockup „Ring – Mockup – v6", das pixelgenau nachzubauen ist. **Hinweis:** Der Figma-Seat war rate-limited; die noch nicht gesehenen Screens (Register-Flow-Detailschritte, Start Recording, Settings-Unterseiten) brauchen für die pixelgenaue Umsetzung noch **Screenshots/Exports aus Figma**.

| # | Screen | Status im Prototyp | Anmerkung |
|---|---|---|---|
| 1 | **Welcome** | teils (Onboarding-Cluster) | Ring-Branding, Avatar-Cluster, „Los geht's" / Anmelden |
| 2 | **Login** | offen | Anmeldung |
| 3 | **Register** | offen | Basis-Registrierung |
| 3a | Register · **Gender** | offen | `gender` |
| 3b | Register · **Looking for** | offen | `looking_for` |
| 3c | Register · **Age** | offen | `birthdate`/`age` |
| 3d | Register · **Profile picture** | offen | Avatar-Upload |
| 4 | **Start Recording** (Video-Intro) | offen | Video-Vorstellung des Nutzers |
| 5 | **Home / Discover** | ✅ Swipe-Deck | Like/Pass/Super-Ring/Call, Badges, €/Min |
| 6 | **Explore** | ✅ | Live-Stories, Creator-Grid |
| 7 | **Matches** | teils (Chats „Neue Matches") | dedizierter Matches-Screen prüfen |
| 8 | **Call Screen** | ✅ | Live-Cost-Ticker pro Minute |
| 9 | **Profile** (Creator) | ✅ | Tiers, Gallery, „Ring me", Livestream |
| 10 | **Profile settings** | teils (Me) | Einstellungen |
| 10a | Settings · **Change photo** | offen | Foto ändern |
| 10b | Settings · **Delete account** | offen | Konto löschen |
| 11 | **Data Privacy** | offen (verlinkt) | Datenschutz |
| 12 | **Imprint** | offen (verlinkt) | Impressum |

Zusätzlich im Prototyp vorhanden (Fanso-Funktion, in Ring-Look): **Feed** (PPV-Lock), **Chats/Chat-Detail** (paid DM), **Wallet** (Top-up + Tx-History), **Tip-Sheet**. Diese sind gegen die restlichen Figma-Screens design-abzugleichen.

---

## 9. Roadmap / Meilensteine

Grobe Sequenzierung (keine fixen Daten); jeder Meilenstein liefert etwas Testbares.

| MS | Titel | Inhalt | Abhängig von |
|---|---|---|---|
| **M0** | **Prototyp** ✅ | Single-File-HTML: Onboarding, Discover, Explore, Feed, Chats, Profil, Call, Wallet, Me, Dark/Light | — |
| **M1** | **React/Vite-App + Design-System** | Vite+TS-Setup, Monorepo, `tokens.ts` (light/dark), Komponenten (Button/Chip/Avatar/Sheet/Tier/PostCard), Screens als Routen, Mock-Daten aus Prototyp portiert | M0 |
| **M2** | **Auth + Profile + Feed** | Registrierung (inkl. Gender/Looking-for/Age/Foto/Start-Recording), Login, User/CreatorProfile, Discover-Swipe gegen API, Explore, Feed (ohne Zahlungen) | M1, Backend-Grundgerüst |
| **M3** | **Wallet + Payments + Abos + PPV** | Postgres-Ledger, Stripe/PayPal-Top-up, Wallet-Screen, SubscriptionTier/Subscription, PostUnlock (PPV), Stripe Connect Payout-Grundlage | M2 |
| **M4** | **Chat + Paid DMs** | Conversations, WebSocket-Chat, Presence/Typing, bezahlte DMs (`PaidMessageUnlock`), Tips (Profil/Post/Chat) | M3 |
| **M5** | **WebRTC Paid Calls** | LiveKit + coturn, Signaling, server-autoritatives Per-Minute-Metering, Live-Ticker, Cutoff, Settlement, Receipt, Tips im Call | M3, M4 |
| **M6** | **Livestream** | LivestreamSession, HLS/Egress, Live-Chat, Live-Tips, optionale VOD-Aufzeichnung | M5 |
| **M7** | **Trust/Safety + Moderation + KYC** | Altersverifikation, Creator-KYC, Moderations-Queue, Reporting/Blocking, DSGVO/DSA-Flows, Impressum/AGB/Datenschutz | M2–M6 |
| **M8** | **Native (Expo) + Store-Submission** | Expo/RN-App aus geteiltem Core, `react-native-webrtc`, Push, IAP-Prüfung, App-Store/Play-Store-Einreichung | M1–M7 |

---

## 10. Risiken & offene Fragen

| Risiko | Beschreibung | Minderung |
|---|---|---|
| **Payment-Provider-Policies (Adult)** | **Stripe und PayPal schränken/verbieten Adult-Content i. d. R. ein.** Kontosperrung bei Policy-Verstoß ist ein realer, existenzieller Risikofaktor für Creator-Erwachsenen-Plattformen. | Frühzeitig Adult-freundliche Prozessoren evaluieren (**CCBill, Segpay**, ggf. Verotel). Klare Content-Policy: Wenn keine expliziten Inhalte → Stripe/PayPal ggf. nutzbar; wenn ja → spezialisierter PSP. Rechtlich verbindlich klären, **vor** M3. |
| **App-Store-Policies** | Apple/Google beschränken erwachsene/UGC-Creator-Inhalte stark; ggf. IAP-Zwang für digitale Güter (30 % Fee) statt eigener Zahlungen. | Web-PWA als primärer Zahlungskanal; native App ggf. „SFW"-Variante oder ohne In-App-Kauf digitaler Güter. Policy-Review vor M8. |
| **Skalierung Medien & Calls** | Video/Livestream-Transcoding, SFU-Bandbreite, TURN-Relay-Kosten skalieren steil mit Nutzung. | Managed-Optionen (Mux/Cloudflare Stream, LiveKit Cloud) gegen Self-Host abwägen; CDN-Caching; Autoscaling der SFU-/TURN-Nodes; Kostenmonitoring. |
| **Moderationskosten & -haftung** | Menschliche Moderation ist teuer; Haftung bei illegalen Inhalten (CSAM, Nichteinwilligung) ist gravierend. | Automatik-Vorfilter + Review-Queue, klare Melde-/Löschprozesse (DSA), Auslagerung an Moderations-Dienstleister prüfen, revisionssichere Logs. |
| **Betrug / Chargebacks** | Micro-Transaktionen + Prepaid-Wallet + Auszahlungen sind Betrugsziele. | 3-D-Secure/SCA, Velocity-/Device-Checks, Neukunden-Limits, Payout-Holdbacks. |
| **Rechtliche Komplexität (DE/EU)** | JMStV-Altersverifikation, DSGVO, DSA, DAC7, USt./OSS, Impressum/AGB — hoher Compliance-Aufwand. | Fachanwalt + Steuerberater ab M2/M3 einbinden; Compliance als eigener Arbeitsstrang (M7), nicht als Nachgedanke. |

### Offene Fragen (zu klären)

1. **Explizite vs. nicht-explizite Inhalte?** Entscheidet über PSP, Store-Strategie und AV-Anforderungen — die wichtigste Weichenstellung.
2. Pixelgenaue Vorlagen: Screenshots/Exports der noch nicht gesehenen Figma-Screens (Register-Steps, Start Recording, Settings-Unterseiten) beschaffen.
3. Prepaid-Wallet als einziges Bezahlmodell, oder zusätzlich direkte Kartenzahlung pro Aktion?
4. Self-hosted (LiveKit/coturn/MinIO) vs. Managed-Provider — Trade-off Kosten/Kontrolle/Time-to-Market.
5. Provisions-/Fee-Struktur pro Umsatzart final definieren.
6. Recording-Policy für Calls/Livestreams (rechtlich + Nutzererwartung).
```
