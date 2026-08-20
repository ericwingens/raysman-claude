# Ring — Technischer Build-Plan

> **Match. Ring. Connect.** — Dating-/Matching-Design der „Ring"-App (Figma *„Ring – Mockup – v6"*) kombiniert mit der Creator-Economy-Funktionalität von [Fanso](https://fanso.io/).
>
> Dieses Dokument beschreibt den Umbau des bestehenden Single-File-HTML-Prototyps (`ring-app/index.html`) in ein echtes React-+-Vite-Web-Projekt mit späterer Portierung nach Expo/React Native, inklusive Backend- und Feature-Roadmap.
>
> **Stand:** M0 (interaktiver Prototyp) abgeschlossen — inzwischen in zwei parallel gepflegten Fassungen: dem Single-File-Prototyp (`ring-app/index.html`) und der React-App (`ring-react/`). Seit der ersten Fassung ist eine **Marktplatz-Ebene** dazugekommen (buchbare Leistungen, Termine, Bewertungen, Vertrauenskennzahlen, Geschenke, Rangliste) sowie Teilen nach außen und Gruppen-Calls — siehe §11. Alle folgenden Meilensteine sind offen.
>
> **Achtung:** §11 enthält drei ungelöste Fragen, die vor M3/M5 beantwortet sein müssen: Abrechnung von Gruppen-Calls, Missbrauchsschutz bei Bewertungen und Leckage bezahlter Inhalte beim Teilen.
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
- **Virtuelle Geschenke** (18 Artikel, **0,49 € bis 149,99 €**) im Call und im Livestream — feste Artikel mit Namen und Symbol, abgegrenzt vom frei wählbaren Tip.
- **Buchbare Leistungspakete** je Creator (z. B. „Yoga 1:1", 45 Min, 52 €) mit Terminreservierung. **Derzeit ohne Vorauszahlung** — siehe §11.3.
- **Erste drei Minuten gratis**, einmalig je Fan-Creator-Paar. Senkt die Einstiegshürde vor dem ersten bezahlten Call; wer sie kaufmännisch trägt, ist noch offen — siehe §4.8 und §11.6.

### Vertrauens- und Auswahlebene (neu)

Reine Preisanzeige reicht nicht, um zwischen Creatorn zu wählen. Dazu kommen: **Bewertungen** mit Sternen und Text, **Vertrauenskennzahlen** (Antwortquote, Abschlussquote, Stammgästeanteil, Anzahl gelieferter Calls), **Level und Abzeichen** sowie eine **Rangliste**, deren Punktzahl gelieferte Calls mit Bewertung und Abschlussquote gewichtet — damit Masse allein niemanden nach oben trägt.

### Creator-Ebene (neu)

Die App hatte lange nur die Fan-Ansicht. Dazu kommt jetzt das **Creator-Studio**: Einnahmen (heute, Woche, Monat, gesamt), Kennzahlen zu Calls, Minuten, Geschenkumsatz und Abos, die **Top-Unterstützer**, die **kommenden Termine aus Creator-Sicht**, der **Auszahlungsstand** — und die drei Stellschrauben, die ein Creator selbst setzen können muss: **Minutenpreis**, **Leistungspakete** und **Verfügbarkeiten**. Überall wird brutto und netto ausgewiesen, damit die Provision nie überrascht (§4.5). Was Änderungen an diesen Stellschrauben mit bereits bestehenden Buchungen machen, steht in §11.7.

### Schutz- und Kommunikationsebene (neu)

**Melden und Blocken** ist keine Zusatzfunktion, sondern Betriebsvoraussetzung — ohne sie ist die App weder DSA-konform noch für Creator zumutbar. Die Semantik (was ein Block sieht, was er nicht verrät, was mit laufenden Calls und Abos passiert) steht in §7.1. Dazu kommen **Sprachnachrichten im Chat** als asynchrones Gegenstück zum bezahlten Call: dieselbe Aufnahme- und Wellenform-Mechanik wie das Voice-Intro der Registrierung, aber als Nachricht im Verlauf.

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
- **Payments:** Stripe (+ Stripe Connect für Payouts) als Abwickler für Karte, **Apple Pay und Google Pay** (§4.2), dazu PayPal; Webhook-Handler für asynchrone Bestätigung. Adult-Content-Policy-Risiko siehe §10 (ggf. CCBill/Segpay).
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
| **ModerationCase / Report** | `subject_type` (`profile`/`post`/`message`/`review`/`call`), `subject_id`, `reporter_id`, `reason` (`harassment`/`nudity`/`scam`/`fake`/`minor`/`spam`/`other`), `note`, `also_blocked`, `status`, `priority`, `resolution` | Trust & Safety (§7.1). `reason=minor` und `reason=scam` gehen sofort in die Eskalationsschlange, nicht in die normale Queue |
| **CreatorService** | `creator_id`, `name`, `description`, `duration_min`, `price`, `active`, `sort_order` | Buchbares Paket; Prototyp: 2 je Creator, 19–89 € |
| **AvailabilityRule** | `creator_id`, `weekday`, `slot_start`, `slot_end`, `timezone`, `active` | Wiederkehrende Verfügbarkeit; erzeugt die Slots der Wochenleiste |
| **AvailabilityException** | `creator_id`, `date`, `blocked`, `slot_start`, `slot_end` | Einzelne Sperrungen/Zusatzzeiten, schlagen die Regel |
| **Booking** | `fan_id`, `creator_id`, `service_id`, `starts_at`, `duration_min`, `price`, `status` (`reserved`/`confirmed`/`completed`/`no_show`/`canceled`), `call_id`, `ledger_tx_id?` | `starts_at` in UTC, Anzeige in der Zeitzone des Fans. `ledger_tx_id` bleibt leer, solange nicht vorab kassiert wird (§11.3) |
| **Review** | `booking_id?`, `call_id?`, `author_id`, `creator_id`, `stars` (1–5), `body`, `status` (`published`/`hidden`/`flagged`), `edited_at` | **Mindestens eine der beiden Referenzen ist Pflicht** — keine Bewertung ohne stattgefundene Leistung (§11.2) |
| **CreatorStats** | `creator_id`, `response_rate`, `completion_rate`, `repeat_rate`, `calls_delivered`, `rating_avg`, `rating_count`, `level`, `badges[]`, `computed_at` | Materialisierte Sicht, per Job neu berechnet — nicht von Hand pflegbar |
| **Gift** | `code`, `name`, `symbol`, `price`, `active`, `sort_order` | Katalog, 18 Artikel; Preise als Cent-Integer |
| **GiftTransaction** | `sender_id`, `recipient_id`, `gift_id`, `price_paid`, `context` (`call`/`live`/`profile`), `context_id`, `ledger_tx_id` | Wie Tip, aber mit Artikelbezug für Auswertung und Bestenlisten |
| **CallParticipant** | `call_id`, `user_id`, `role` (`host`/`callee`/`guest`), `joined_at`, `left_at`, `billed_share` | Gruppen-Calls; `billed_share` offen bis §11.1 entschieden ist |
| **ShareEvent** | `user_id`, `subject_type` (`post`/`profile`), `subject_id`, `target` (`tiktok`/`instagram`/…/`copy_link`), `created_at` | Nur Absicht und Ziel protokollieren, keine Inhalte |
| **Block** | `blocker_id`, `blocked_id`, `created_at`, `source` (`profile`/`chat`/`post`/`report`) | Unique(blocker, blocked). Wirkt in **beide** Richtungen sichtbar (§7.1) und ist die einzige Quelle für alle Sichtbarkeitsfilter |
| **FreeMinuteGrant** | `fan_id`, `creator_id`, `seconds_granted`, `seconds_used`, `granted_at`, `first_call_id` | Unique(fan, creator) — die Freiminuten gibt es **einmal je Paar**, nicht je Call (§4.8). Wird beim Wählen angelegt, nicht beim Verbinden |
| **VoiceMessage** | `message_id`, `media_id`, `duration_ms`, `waveform` (int[], normalisiert), `transcript?`, `moderation_status` | 1:1 zu `Message` mit `kind=voice`; `Media.type` bekommt dafür den Wert `audio`. `waveform` wird serverseitig aus der Datei berechnet, nicht vom Client übernommen |
| **CreatorEarning** | `creator_id`, `period` (`day`/`week`/`month`), `period_start`, `gross`, `fee`, `net`, `by_source` (jsonb: `call`/`gift`/`tip`/`sub`/`ppv`), `computed_at` | Materialisierte Sicht für das Creator-Studio; aus dem Ledger berechnet, nie von Hand gepflegt |
| **CreatorSupporter** | `creator_id`, `fan_id`, `lifetime_spend`, `calls_count`, `first_seen_at`, `last_seen_at` | Materialisierte Sicht — speist die Liste „Top-Unterstützer". Fans sehen ihre eigene Position nie |

**Faustregel:** Alles, was Geld bewegt (PPV, Abo, Tip, **Geschenk**, Call-Tick, **Buchung**, Top-up, Payout, Refund), erzeugt **genau eine** `WalletTransaction`-Zeile mit `idempotency_key`. Der `Wallet.balance` ist eine materialisierte Sicht und muss jederzeit = Summe des Ledgers sein (Invariante, per Job prüfbar).

---

## 4. Zahlungen & Wallet

### 4.1 Modell

- **Wallet als Prepaid-Guthaben** (wie im Prototyp): Fan lädt auf, alle Käufe/Calls/Tips gehen gegen das Guthaben. Vorteil: schnelle Micro-Transaktionen (Call-Ticks, PPV) ohne pro Aktion die Zahlungsseite aufzurufen.
- **Geld in Ganzzahl-Cent** speichern (`integer`), Anzeige via `formatEUR` (Prototyp: `toLocaleString("de-DE", {minimumFractionDigits:2})`).
- **Ledger = einzige Wahrheit** (append-only, §3). Balance-Updates unter optimistischem Lock (`Wallet.version`) oder DB-Row-Lock, um Races bei parallelen Ticks/Käufen zu verhindern.

### 4.2 Aufladen (Top-up)

- **Stripe** als primärer Abwickler (Payment Intents / Checkout), **PayPal** als zweite Schiene. Guthaben wird **erst nach Webhook-Bestätigung** gutgeschrieben (`payment_intent.succeeded`), nicht clientseitig.
- Idempotenz: `idempotency_key` pro Top-up-Versuch; Webhook-Handler idempotent (Provider-`event.id` als Dedupe-Key).
- Packs wie im Prototyp: 10 / 25 / 50 / 100 €.

#### Zahlungsmittel: Apple Pay, Google Pay, Karte

Wichtig für die Planung: **Apple Pay und Google Pay sind keine eigenen Zahlungsdienstleister, sondern Zahlungsmittel, die über Stripe laufen.** Es gibt also nicht drei Integrationen, sondern eine — Stripe — mit drei Knöpfen davor. Das reduziert den Aufwand erheblich, verschiebt ihn aber in die Einrichtung:

| Mittel | Weg | Aufwand |
|---|---|---|
| **Karte** (Visa/Mastercard/Amex) | Stripe Payment Element | Basis |
| **Apple Pay** | Stripe Payment Request Button / Payment Element | **Domain-Verifizierung** bei Apple je Domain, Zertifikatsdatei unter `/.well-known/`; nur über HTTPS und nur in Safari/iOS-WebViews |
| **Google Pay** | dito | Merchant-Konfiguration in Stripe, keine Domain-Datei nötig |
| **PayPal** | eigene Integration | separat, nicht über Stripe |

- **Ein Ledger-Pfad für alle.** Egal welches Mittel: Es entsteht dieselbe `WalletTransaction` vom Typ `topup`. Das Zahlungsmittel wird nur als Metadatum (`provider_ref`, `payment_method_type`) mitgeschrieben — für Auswertung und Support, nicht für die Buchungslogik. Nichts an der Guthabenlogik darf vom Zahlungsmittel abhängen.
- **Verfügbarkeit prüfen, nicht raten.** Die Wallet-Oberfläche darf den Apple-Pay-Knopf nur zeigen, wenn das Gerät ihn wirklich anbietet (`PaymentRequest.canMakePayment()`); sonst steht dort ein toter Knopf. Fallback ist immer die Kartenzahlung.
- **SCA/3-D-Secure** ist bei Apple Pay und Google Pay durch die Geräte-Authentifizierung in der Regel bereits erfüllt, bei reiner Kartenzahlung nicht — der Flow muss den zusätzlichen Bestätigungsschritt aushalten (§7, Chargeback/Fraud).

**Die entscheidende Einschränkung** steht in §10: In einer **nativen** App aus dem App Store bzw. Play Store dürfen digitale Güter — und Wallet-Guthaben ist ein digitales Gut — nach den Store-Regeln **nicht** über Apple Pay, Google Pay oder Stripe verkauft werden, sondern nur über **In-App-Purchase** mit deren Provision. Apple Pay ist für physische Waren und externe Dienstleistungen gedacht, nicht für App-Währung. Praktische Folge: Apple Pay und Google Pay sind die richtige Wahl für die **Web-PWA**, die damit auch der primäre Aufladekanal bleibt; die native App braucht entweder IAP oder verzichtet auf das Aufladen und verweist auf den Browser. Diese Weiche muss **vor M8** fallen, nicht danach.

### 4.3 Holds/Escrow für Calls

Zwei praktikable Varianten:

1. **Prepaid-Cutoff (empfohlen, spiegelt den Prototyp):** Da das Guthaben bereits vorab kassiert wurde, ist keine separate Karten-Autorisierung nötig. Beim Call-Start wird geprüft, ob Guthaben > Mindestbetrag (z. B. ≥ 1 Minute Rate). Danach **pro Tick abbuchen** und bei Guthaben = 0 hart trennen. **Ausnahme:** solange dem Paar noch Freiminuten zustehen, entfällt dieser Check (§4.8).
2. **Card-Auth + Capture (falls ohne Prepaid-Wallet):** Beim Call-Start Betrag X autorisieren (Hold), nach Call-Ende die tatsächliche Dauer capturen, Rest freigeben. Aufwändiger, Auth-Ablaufzeiten beachten.

### 4.4 Per-Minute-Call-Billing (mirror des Prototyps)

Prototyp-Logik (`tickCall`), die serverseitig autoritativ nachgebaut wird:

```
perSec        = rate_per_min / 60
jede Sekunde: wenn (elapsed < free_secs):          # Freiminuten, §4.8
                  elapsed += 1                      # Uhr läuft, Ledger nicht
                  weiter
              cost += perSec
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
- **Creator-Sicht (Studio):** Der Creator sieht Einnahmen, Auszahlbetrag, nächsten Auszahlungstermin und die letzten Auszahlungen. Alle Zahlen kommen aus `CreatorEarning`/`Payout` und damit aus dem Ledger — es gibt keinen zweiten Rechenweg. Die Provision wird **überall brutto/netto ausgewiesen**, auch schon beim Setzen eines Preises („bei X €/Min bleiben dir Y €"), damit der Creator nie über die Fee stolpert.

### 4.6 Geschenke und Buchungen

**Geschenke** verhalten sich abrechnungstechnisch wie Tips: sofortige Abbuchung vom Guthaben, eine Ledger-Zeile (`type=tip`, `ref_type=gift`), Gutschrift beim Creator abzüglich Provision. Der Unterschied ist inhaltlich, nicht finanziell — ein Geschenk hat Artikel, Namen und Symbol und ist damit auswertbar (beliebteste Artikel, Umsatz je Artikel, Bestenlisten). Der Katalog liegt in der Datenbank, nicht im Client, damit Preise und Sortiment ohne App-Release änderbar sind.

**Buchungen** sind derzeit **reine Reservierungen ohne Zahlungsvorgang**. Das war eine bewusste Produktentscheidung (Treuhand wurde für diese Runde verworfen), hat aber Folgen, die vor M3 zu klären sind — siehe §11.3.

### 4.7 Steuern / VAT (DE/EU-Kontext)

- **USt. auf digitale Dienstleistungen** an Endverbraucher in der EU: Leistungsort = Wohnsitz des Kunden (**MOSS/OSS**-Verfahren). USt.-Satz nach Kundenland; Nachweis (2 nicht-widersprüchliche Belege, z. B. Rechnungsland + IP) erforderlich.
- **Kleinunternehmerregelung (§ 19 UStG):** falls anwendbar, keine USt.-Ausweisung — für eine skalierende Plattform aber meist nicht praktikabel.
- **Creator-Auszahlungen:** Creator sind i. d. R. selbst steuerpflichtig; Plattform muss ggf. **DAC7**-Meldepflichten (Plattformbetreiber-Meldung an Finanzbehörden) erfüllen.
- **Rechnungen/Belege** für Top-ups und Käufe generieren und archivieren (GoBD-konform).
- **→ Steuerberatung + Rechtsberatung zwingend vor Launch.**

---

### 4.8 Freiminuten (die ersten drei Minuten)

Jeder Fan bekommt bei **jedem Creator einmalig** die ersten drei Minuten geschenkt. Das ist ein Akquise-Instrument, kein Rabatt — die entscheidende Regel ist deshalb, dass das Kontingent **an das Paar (Fan, Creator) gebunden** ist und nicht an den einzelnen Call.

- **Vergabe beim Wählen, nicht beim Verbinden.** `FreeMinuteGrant` wird angelegt, sobald der Fan den Anruf auslöst. Wer auflegt und sofort neu wählt, bekommt keine neuen drei Minuten. (Der Prototyp macht es genauso: das Kontingent wird beim Dial verbraucht.)
- **Kein Guthaben-Mindestbetrag für den ersten Call.** Der Guthaben-Check aus §4.3 greift erst, wenn die Freiminuten aufgebraucht sind. Ein Fan ohne Guthaben kann den ersten Call also führen — aber nur drei Minuten lang.
- **Metering:** die Sekunden laufen normal, nur ohne Ledger-Buchung (§4.4). Beim Übergang wird der Fan sichtbar informiert; ab dann gilt die reguläre Abrechnung inklusive Cutoff.
- **Creator-Vergütung:** Freiminuten werden dem Creator **nicht** vom Fan bezahlt. Ob die Plattform sie dem Creator erstattet (Akquise-Kosten der Plattform) oder ob der Creator sie trägt (Akquise-Kosten des Creators), ist eine kaufmännische Entscheidung und **noch offen** — siehe §11.6. Solange sie offen ist, buchen wir die Freiminuten mit `gross=0` und markieren den Call-Abschnitt in `Call.free_secs`, damit die Entscheidung später rückwirkend auswertbar bleibt.
- **Missbrauch:** Mehrfachkonten sind der offensichtliche Angriff (neuer Account = wieder überall drei Minuten frei). Gegenmaßnahmen gehören zur Altersverifikation und zum Fraud-Stack (§7): verifizierte Telefonnummer bzw. Ausweis als Voraussetzung für Freiminuten, Device-Fingerprinting, Velocity-Limits.

## 5. Paid Calls (WebRTC) — End-to-End-Flow

```
Fan tippt „Ring me · X €/Min"  (Profil oder Discover-Call-Button)
   │
   ▼
[1] Guthaben-Check/Autorisierung
    - Backend prüft: besteht eine Blockierung in einer der beiden
      Richtungen?  dann Abbruch, kein Klingeln (§7.1)
    - Freiminuten offen?  dann FreeMinuteGrant anlegen, Guthaben-Check
      überspringen (§4.8)
    - sonst: balance >= min. (z. B. 1 Min Rate)?  sonst → Wallet
    - Call-Row angelegt (status=ringing), rate_per_min + free_secs gesetzt
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
- **Freiminuten im Call:** Der Ticker zeigt während der Freiminuten einen Countdown statt eines steigenden Betrags; beim Ablauf wechselt der Hinweistext und der Fan bekommt eine Meldung. Der Wechsel ist ein **Server-Event**, nicht nur eine Client-Animation — sonst läuft die Anzeige beim ersten Reconnect aus dem Tritt.
- **Tips im Call:** `openTip` bleibt live erreichbar (Prototyp: Tip-Button im Call-Controls-Bereich) → separate Ledger-Tx (`tip`, context=`call`).
- **Geschenke im Call:** eigener Knopf in der Call-Leiste, gleiche Behandlung wie Tips, zusätzlich `GiftTransaction` (§4.6).
- **Livestream-Calls:** `type=live` wird ebenfalls pro Minute abgerechnet (Prototyp-Hinweis: „Live-Anrufe werden pro Minute abgerechnet").
- **Gruppen-Calls:** Der Anrufer kann bis zu **5 weitere Teilnehmer** in einen laufenden Call holen. Technisch ist das für einen SFU unkritisch — LiveKit-Räume sind ohnehin mehrteilnehmerfähig, jeder Beitritt bekommt ein eigenes kurzlebiges Token, und `CallParticipant` protokolliert Beitritt und Austritt. **Kaufmännisch ist es ungeklärt** (§11.1). Zusätzlich: Jeder Hinzugefügte muss **selbst zustimmen**, bevor sein Medienstrom läuft — niemand wird ungefragt in einen Call gezogen.
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
| **Gruppen-Call** | `call.invite`, `call.participant.joined`, `call.participant.left`, `call.invite.declined` | Einladung braucht Zustimmung des Eingeladenen, bevor Medien fließen |
| **Geschenke** | `gift.sent` | Artikel + Absender, löst die Flug-Animation bei allen Teilnehmern aus |
| **Buchungen** | `booking.created`, `booking.reminder`, `booking.starting`, `booking.canceled` | Erinnerung als Push; `booking.starting` verlinkt direkt in den Call |
| **Bewertungen** | `review.requested`, `review.published` | `review.requested` nach Call-Ende, einmalig und ablaufend |

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
- **Reporting & Blocking:** siehe §7.1 — der Prototyp hat beides, und die Semantik dahinter ist nicht trivial.
- **Chargeback / Fraud:** Velocity-Checks, Device-Fingerprinting, 3-D-Secure (SCA/PSD2) bei Kartenzahlung, Limits für Neukunden, manuelle Review bei Auffälligkeiten; Chargeback-Handling im Ledger.
- **Bewertungen:** Nur zu einer tatsächlich stattgefundenen Leistung (Call oder Buchung), pro Leistung genau eine, editierbar innerhalb einer Frist. Bewertungen sind meldbar und moderierbar wie jeder andere Inhalt. Ohne Kaufbindung ist ein Bewertungssystem in kurzer Zeit wertlos (§11.2). **Gekaufte Bewertungen und das Entfernen negativer Bewertungen gegen Entgelt sind nach UWG unzulässig** — die Plattform darf Creatorn keinen Weg anbieten, schlechte Bewertungen verschwinden zu lassen.
- **Teilen nach außen:** Geteilt werden darf nur, was öffentlich ist. Für Abo- oder PPV-Inhalte darf der Teilen-Vorgang **niemals** die Mediendatei oder eine signierte URL nach außen geben, sondern nur einen Landeplatz-Link, der beim Empfänger erneut die Zugangsprüfung durchläuft (§11.4). `ShareEvent` protokolliert Absicht und Ziel, nicht den Inhalt.
- **Gruppen-Calls:** Zustimmung jedes Hinzugefügten vor Medienübertragung; Blockierungen wirken auch hier — wer jemanden blockiert hat, kann nicht mit ihm in denselben Raum gezogen werden. Aufzeichnung braucht die Einwilligung **aller** Anwesenden, nicht nur der beiden ursprünglichen.
- **Sprachnachrichten:** Audio ist Inhalt wie jeder andere und geht durch dieselbe Moderationskette (`Media.moderation_status`). Zusätzlich gilt: Transkription darf nur laufen, wenn sie in der Datenschutzerklärung steht und einen Zweck hat (Moderation, Barrierefreiheit) — nicht „weil es geht". Die Wellenform wird serverseitig berechnet; ein Client, der sie mitliefern darf, kann eine Aufnahme als etwas anderes ausgeben, als sie ist. Aufbewahrung wie andere Nachrichteninhalte, Löschung zieht die Mediendatei mit.
- **Impressum & AGB (DE-Pflicht):** Impressum (§ 5 DDG/TMG), AGB, Datenschutzerklärung, Widerrufsbelehrung (bzw. Hinweis auf Erlöschen des Widerrufsrechts bei digitalen Inhalten), Zahlungs-/Nutzungsbedingungen für Fans und Creator. Der Prototyp verlinkt bereits „AGB", „Datenschutz" und „Datenschutz & Impressum".

### 7.1 Melden und Blocken

Der Prototyp hat beides: ein ⋯-Menü auf Profil, Chat und Beitrag, dahinter „melden" und „blockieren", und eine Liste der blockierten Profile unter *Me → Sicherheit*. Das Verhalten dahinter ist bewusst festgelegt:

**Melden**

- **Sieben Gründe**, in der Reihenfolge ihrer Häufigkeit: Belästigung, Nacktheit/sexuelle Inhalte, Betrug/Geldforderung, Fake-Profil, Person wirkt minderjährig, Spam, Sonstiges. Freitext ist optional, der Grund ist Pflicht.
- **Melden blockiert nicht automatisch.** Das ist eine Checkbox im selben Formular, kein Automatismus — wer einen Betrugsversuch meldet, will die Person oft trotzdem noch im Chat sehen können, bis die Prüfung läuft.
- **Anonym gegenüber dem Gemeldeten.** Die Meldung ist gegenüber der Moderation natürlich zugeordnet (`reporter_id`), sonst wären Serienmelder nicht erkennbar.
- **Zwei Gründe eskalieren sofort:** `minor` und `scam` gehen nicht in die normale Queue, sondern in die Eskalationsschlange. Bei Verdacht auf Minderjährige gelten die Melde- und Löschpflichten aus dem CSAM-Absatz oben.
- **DSA-konforme Rückmeldung:** Der Meldende bekommt eine Eingangsbestätigung und eine Entscheidung mit Begründung; beides ist unter „Notice & Action" Pflicht, nicht Kür.

**Blockieren**

- **Eine Blockierung ist einseitig gesetzt, aber beidseitig wirksam.** Wer blockiert, sieht die andere Person nirgends mehr — Discover, Explore, Feed, Rangliste, Chatliste, Gästeauswahl im Call. Umgekehrt darf der Blockierte den Blockierenden ebenfalls nicht mehr erreichen. **Er darf aber nicht erfahren, dass er blockiert wurde** (Sicherheitsanforderung bei Stalking): das Profil verhält sich für ihn wie ein nicht mehr existierendes oder inaktives, nicht wie ein gesperrtes.
- **Ein Filter, nicht viele.** Alle Listen laufen über dieselbe Sichtbarkeitsfunktion gegen `Block`. Jede Liste, die ihren eigenen Filter mitbringt, ist die Liste, die beim nächsten Feature vergessen wird.
- **Wirkung auf Laufendes:** Ein laufender Call wird beendet, ein offenes Profil geschlossen, ein Gast aus der Teilnehmerliste entfernt. Ein neuer Anruf wird serverseitig abgewiesen, bevor es beim Empfänger klingelt.
- **Was bleibt:** Bereits gezahltes Geld bleibt gezahlt. Ein laufendes Abo endet nicht automatisch durch eine Blockierung — das wäre eine stille Kündigung mit finanzieller Folge. Der Fan muss aktiv kündigen; die App weist beim Blockieren darauf hin, wenn ein Abo besteht.
- **Entsperren** ist jederzeit möglich und stellt nur die Sichtbarkeit wieder her — es stellt keine gelöschten Inhalte wieder her und hebt keine Moderationsentscheidung auf.

---

## 8. Auszubauende Figma-Screens (Ring Mockup — 1:1)

Vollständiges Screen-Inventar aus dem Mockup „Ring – Mockup – v6", das pixelgenau nachzubauen ist. **Hinweis:** Der Figma-Seat war rate-limited; die noch nicht gesehenen Screens (Register-Flow-Detailschritte, Start Recording, Settings-Unterseiten) brauchen für die pixelgenaue Umsetzung noch **Screenshots/Exports aus Figma**.

| # | Screen | Status im Prototyp | Anmerkung |
|---|---|---|---|
| 1 | **Welcome** | teils (Onboarding-Cluster) | Ring-Branding, Avatar-Cluster, „Los geht's" / Anmelden |
| 2 | **Login** | offen | Anmeldung |
| 3 | **Register** | ✅ | 6-stufiger Flow mit Fortschrittsbalken |
| 3a | Register · **Gender** | ✅ | `gender`, Weiter erst nach Auswahl |
| 3b | Register · **Looking for** | ✅ | `looking_for` |
| 3c | Register · **Age** | ✅ | Schieberegler ab 18 |
| 3d | Register · **Profile picture** | ✅ | Avatar-Auswahl (Demo) |
| 4 | **Start Recording** (Voice-Intro) | ✅ | Wellenform + Timer, simuliert |
| 5 | **Home / Discover** | ✅ Swipe-Deck | Like/Pass/Super-Ring/Call, Badges, €/Min |
| 6 | **Explore** | ✅ | Live-Stories, Creator-Grid |
| 7 | **Matches** | ✅ | Eigener Tab in Explore, mit Anrufen und Entfernen |
| 8 | **Call Screen** | ✅ | Live-Cost-Ticker pro Minute |
| 9 | **Profile** (Creator) | ✅ | Tiers, Gallery, Ring me, Livestream, **Vertrauenskennzahlen, Leistungen, Bewertungen** |
| 10 | **Profile settings** | ✅ | Fotos, Sprachnachricht, Profilfelder, Termine |
| 10a | Settings · **Change photo** | ✅ | Dialog Galerie/Kamera |
| 10b | Settings · **Delete account** | ✅ | Konto löschen, mit Bestätigung |
| 11 | **Data Privacy** | ✅ | Volle Seite, Platzhaltertext |
| 12 | **Imprint** | ✅ | Volle Seite, Platzhaltertext |

Zusätzlich im Prototyp vorhanden (Fanso-Funktion, in Ring-Look): **Feed** (PPV-Lock), **Chats/Chat-Detail** (paid DM), **Wallet** (Top-up + Tx-History), **Tip-Sheet**.

Neu hinzugekommen und **ohne Figma-Vorlage** — diese brauchen einen Design-Abgleich, bevor sie als final gelten:

| Screen | Inhalt |
|---|---|
| **Buchung** | Paketwahl, Wochenleiste, Zeitfenster, Bestätigung |
| **Meine Termine** | Liste im eigenen Profil, mit Leerzustand |
| **Bewertungsabfrage** | Dialog nach Call-Ende, 5 Sterne + Text |
| **Bewertungsliste** | Im Creator-Profil, unter den Leistungen |
| **Geschenke-Galerie** | 18 Artikel, scrollendes Raster |
| **Rangliste** | Top 5 im Explore-Tab |
| **Teilen** | 7 Plattform-Kacheln + Link kopieren |
| **Teilnehmer hinzufügen** | Auswahlliste mit Obergrenze 5 |

---

## 9. Roadmap / Meilensteine

Grobe Sequenzierung (keine fixen Daten); jeder Meilenstein liefert etwas Testbares.

| MS | Titel | Inhalt | Abhängig von |
|---|---|---|---|
| **M0** | **Prototyp** ✅ | Zwei gepflegte Fassungen (Single-File + React): Onboarding inkl. 6-stufiger Registrierung, Discover, Explore mit Matches, Feed mit Teilen, Chats, Profil mit Kennzahlen/Leistungen/Bewertungen, Call mit Geschenken und Gästen, Buchung, Wallet, Me, Rechtsseiten | — |
| **M1** | **React/Vite-App + Design-System** | Vite+TS-Setup, Monorepo, `tokens.ts` (light/dark), Komponenten (Button/Chip/Avatar/Sheet/Tier/PostCard), Screens als Routen, Mock-Daten aus Prototyp portiert | M0 |
| **M2** | **Auth + Profile + Feed** | Registrierung (inkl. Gender/Looking-for/Age/Foto/Start-Recording), Login, User/CreatorProfile, Discover-Swipe gegen API, Explore, Feed (ohne Zahlungen) | M1, Backend-Grundgerüst |
| **M3** | **Wallet + Payments + Abos + PPV** | Postgres-Ledger, Stripe/PayPal-Top-up, Wallet-Screen, SubscriptionTier/Subscription, PostUnlock (PPV), Stripe Connect Payout-Grundlage | M2 |
| **M4** | **Chat + Paid DMs + Sprachnachrichten** | Conversations, WebSocket-Chat, Presence/Typing, bezahlte DMs (`PaidMessageUnlock`), Tips (Profil/Post/Chat), Sprachnachrichten (`VoiceMessage`: Upload, serverseitige Wellenform, Moderation) | M3 |
| **M5** | **WebRTC Paid Calls** | LiveKit + coturn, Signaling, server-autoritatives Per-Minute-Metering inkl. Freiminuten-Fenster (`FreeMinuteGrant`), Live-Ticker, Cutoff, Settlement, Receipt, Tips im Call | M3, M4 |
| **M5.5** | **Marktplatz-Ebene** | CreatorService, Verfügbarkeiten, Booking, Review mit Leistungsbindung + Moderation, CreatorStats-Job, Gift-Katalog + GiftTransaction, Rangliste, Teilen mit Zugangsprüfung, Gruppen-Calls inkl. Zustimmung und Abrechnungsmodell | M3, M5 |
| **M5.6** | **Creator-Studio** | Einnahmen- und Auszahlungssicht (`CreatorEarning`, `Payout`), Top-Unterstützer (`CreatorSupporter`), kommende Buchungen aus Creator-Sicht, Editoren für Minutenpreis, Leistungspakete und Verfügbarkeiten inkl. der Regeln aus §11.7 | M3, M5.5 |
| **M6** | **Livestream** | LivestreamSession, HLS/Egress, Live-Chat, Live-Tips, optionale VOD-Aufzeichnung | M5 |
| **M7** | **Trust/Safety + Moderation + KYC** | Altersverifikation, Creator-KYC, Moderations-Queue, Melden und Blocken nach §7.1 (inkl. Eskalationsschlange und DSA-Rückmeldung), Audio-Moderation, DSGVO/DSA-Flows, Impressum/AGB/Datenschutz | M2–M6 |
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
| **Gruppen-Call-Abrechnung** | Bis zu 6 Personen im Raum, aber nur ein Zahler und ein Minutenpreis. Ohne Modell verschenkt die Plattform Creator-Einnahmen und macht die Kosten für den Anrufer unvorhersehbar. | Modell vor M5.5 entscheiden (§11.1); Metering von „pro Call" auf „pro Teilnehmer" umbauen, Preisanzeige vor dem Hinzufügen. |
| **Manipulierte Bewertungen** | Bewertungen ohne Leistungsnachweis, Mehrfachbewertungen und gekaufte Sterne entwerten Bewertungen **und** die darauf aufbauende Rangliste. Gekaufte Bewertungen sind zudem nach UWG unzulässig. | Harte Bindung an `call_id`/`booking_id`, eine je Leistung, Mindestdauer, Meldeweg, Mindestfallzahl vor Anzeige (§11.2, §11.5). |
| **Leckage bezahlter Inhalte beim Teilen** | Ein geteilter Link auf PPV- oder Abo-Material umgeht die Bezahlschranke; signierte Storage-URLs lassen sich nicht zurückrufen. | Teilen erzeugt nur Landeplatz-Links mit erneuter Zugangsprüfung, nie Mediendateien oder signierte URLs (§11.4). |
| **Store-Regeln vs. Apple Pay / Google Pay** | Wallet-Guthaben ist ein digitales Gut. In der nativen App ist dafür IAP vorgeschrieben — Apple Pay, Google Pay und Stripe sind dort **nicht** zulässig. | Aufladen primär in der Web-PWA (dort sind Apple Pay und Google Pay genau richtig); native App entweder mit IAP oder ohne Aufladefunktion. Weiche vor M8 (§4.2). |
| **Ausfallrisiko bei Terminen** | Buchungen ohne Anzahlung: Ein Nichterscheinen kostet den Fan nichts und den Creator die freigehaltene Zeit. | Stornofrist und No-Show-Regel definieren; Anzahlung erneut bewerten (§11.3). |
| **Rechtliche Komplexität (DE/EU)** | JMStV-Altersverifikation, DSGVO, DSA, DAC7, USt./OSS, Impressum/AGB — hoher Compliance-Aufwand. | Fachanwalt + Steuerberater ab M2/M3 einbinden; Compliance als eigener Arbeitsstrang (M7), nicht als Nachgedanke. |

### Offene Fragen (zu klären)

1. **Explizite vs. nicht-explizite Inhalte?** Entscheidet über PSP, Store-Strategie und AV-Anforderungen — die wichtigste Weichenstellung.
2. Pixelgenaue Vorlagen: Screenshots/Exports der noch nicht gesehenen Figma-Screens (Register-Steps, Start Recording, Settings-Unterseiten) beschaffen.
3. Prepaid-Wallet als einziges Bezahlmodell, oder zusätzlich direkte Kartenzahlung pro Aktion?
4. Self-hosted (LiveKit/coturn/MinIO) vs. Managed-Provider — Trade-off Kosten/Kontrolle/Time-to-Market.
5. Provisions-/Fee-Struktur pro Umsatzart final definieren.
6. Recording-Policy für Calls/Livestreams (rechtlich + Nutzererwartung).
7. **Gruppen-Calls: welches Abrechnungsmodell?** (§11.1) — blockiert das Metering-Design.
8. Zeitfenster und Mindestfallzahl je Vertrauenskennzahl, bevor sie öffentlich angezeigt wird (§11.5).
9. Stornofrist und Folgen eines Nichterscheinens bei Buchungen (§11.3).
10. Aufladen in der nativen App: IAP akzeptieren oder auf den Browser verweisen? (§4.2, §10)
```

---

## 11. Marktplatz-Ebene — was gebaut ist und was offen bleibt

Diese Funktionen sind im Prototyp fertig und bedienbar, tragen aber Entscheidungen in sich, die im Prototyp nicht wehtun und in Produktion sofort.

### 11.1 Gruppen-Calls: Abrechnung ungeklärt

**Gebaut:** Der Anrufer holt bis zu 5 weitere Teilnehmer in einen laufenden Call, sichtbar als Kacheln, einzeln entfernbar.

**Offen:** Wer bezahlt? Der Prototyp holt Gäste kostenlos dazu — das ist als Geschäftsmodell nicht haltbar, weil ein Creator dann bei sechs Zuhörern denselben Minutenpreis bekommt wie bei einem. Drei denkbare Modelle:

| Modell | Wirkung | Nachteil |
|---|---|---|
| **Anrufer zahlt alles** | Einfach, eine Abrechnung, ein Guthaben | Bei 5 Gästen wird es für den Anrufer schnell teuer, ohne dass er es vorher merkt |
| **Jeder zahlt seinen Anteil** | Fair, skaliert | Jeder Gast braucht ausreichend Guthaben; was passiert, wenn einem mittendrin das Guthaben ausgeht? |
| **Aufschlag pro Kopf** | Creator-Einnahme wächst mit der Runde | Preisanzeige wird erklärungsbedürftig |

Bis das entschieden ist, bleibt `CallParticipant.billed_share` bewusst leer. **Die Entscheidung gehört vor M5.5**, weil sie den Metering-Kern aus §4.4 verändert: aus einem Zähler pro Call wird einer pro Teilnehmer, mit eigenem Cutoff je Guthaben.

### 11.2 Bewertungen: nur mit Leistungsnachweis

**Gebaut:** Sterne plus Text, abgefragt nach Call-Ende, sofort im Profil sichtbar, verschiebt den Durchschnitt.

**Offen:** Im Prototyp kann jede beendete Verbindung bewertet werden. In Produktion braucht es harte Bindung an `booking_id` oder `call_id`, genau eine Bewertung je Leistung, eine Mindestdauer (eine Bewertung nach vier Sekunden Call sagt nichts), eine Bearbeitungsfrist und einen Meldeweg. Ohne das ist das System innerhalb von Wochen wertlos — und die Rangliste aus §11.5, die auf den Bewertungen aufbaut, gleich mit.

### 11.3 Buchungen ohne Vorauszahlung

**Gebaut:** Paket wählen, Tag und Uhrzeit wählen, reservieren. Es wird **nichts** abgebucht; bezahlt wird beim Call zum Minutenpreis.

**Offen:** Ohne Vorauszahlung kostet ein Nichterscheinen niemanden etwas. Der Creator hält eine Stunde frei und bekommt womöglich nichts. Zu klären ist mindestens: Stornofrist, Verhalten bei Nichterscheinen, und ob eine Anzahlung eingeführt wird. Letzteres wurde für diese Runde bewusst verworfen — das ist als Produktentscheidung in Ordnung, muss aber vor einem echten Marktstart erneut auf den Tisch, sonst trägt der Creator das gesamte Ausfallrisiko.

Außerdem: `Booking.starts_at` gehört in UTC, angezeigt in der Zeitzone des Fans. Der Prototyp rechnet mit der lokalen Zeit des Browsers und kennt keine Zeitzonen — sobald Creator und Fan in verschiedenen Zonen sitzen, ist das falsch.

### 11.4 Teilen: Zugangsprüfung beim Empfänger

**Gebaut:** Teilen-Sheet an jedem Beitrag mit sieben Zielen und Link kopieren.

**Offen:** Der Prototyp teilt nur symbolisch. In Produktion ist die Regel bindend: ein geteilter Link führt auf eine Landeseite, die **beim Empfänger erneut prüft**, ob er den Inhalt sehen darf. Für PPV- und Abo-Inhalte wird nie die Mediendatei geteilt, sondern eine Vorschau plus Kaufaufforderung. Andernfalls ist jeder geteilte Link ein Leck — und bei signierten Storage-URLs ein Leck, das sich nicht zurückholen lässt.

### 11.5 Kennzahlen, Level und Rangliste sind berechnet, nicht gepflegt

**Gebaut:** Antwortquote, Abschlussquote, Stammgästeanteil, gelieferte Calls, Level, Abzeichen und eine Rangliste, deren Punktzahl gelieferte Calls mit Bewertung und Abschlussquote multipliziert.

**Offen:** Im Prototyp sind diese Werte fest hinterlegt. In Produktion sind sie ausnahmslos **abgeleitet** und gehören in einen periodischen Job (`CreatorStats.computed_at`), nicht in ein editierbares Feld — sonst sind sie manipulierbar und damit wertlos. Zu definieren ist je Kennzahl das Zeitfenster (Antwortquote der letzten 30 Tage? aller Zeiten?) und die Mindestfallzahl, ab der sie überhaupt angezeigt wird. Ein Creator mit einem gelieferten Call und fünf Sternen darf nicht die Rangliste anführen.


### 11.6 Freiminuten: wer bezahlt sie?

Die ersten drei Minuten sind für den Fan gratis. Für den Creator sind sie **Arbeitszeit**, und die Frage, wer sie vergütet, ist noch offen:

- **Plattform trägt sie** — sauberste Variante für die Creator-Akzeptanz, aber ein direkter Kostenblock, der mit jedem neuen Fan-Creator-Paar mitwächst. Bei 1,79 €/Min sind drei Minuten rund 5,40 € Bruttoumsatz, den jemand tragen muss.
- **Creator trägt sie** — kostenlos für die Plattform, aber die guten Creator werden es merken und die Funktion ablehnen, sobald sie ausgelastet sind. Dann braucht es einen Schalter „Freiminuten anbieten: ja/nein" im Studio — und damit zwei Klassen von Profilen im Discover.
- **Geteilt** — z. B. Plattform zahlt die Provision nicht und erstattet die Hälfte. Kompromiss, der beides halb löst.

Solange die Entscheidung offen ist, wird der Freiminuten-Abschnitt als `Call.free_secs` mitgeschrieben und mit `gross=0` gebucht, damit die Kosten hinterher exakt beziffert und rückwirkend zugeordnet werden können. **Vor M5 zu entscheiden.**

### 11.7 Studio-Änderungen und bestehende Buchungen

Im Creator-Studio kann der Creator Minutenpreis, Leistungspakete und Verfügbarkeiten ändern. Der Prototyp lässt das ohne Rückfrage zu — produktiv geht das nicht:

- **Preisänderung wirkt nie rückwirkend.** Eine bestehende `Booking` behält den Preis, zu dem sie gebucht wurde; `Booking.price` ist deshalb eine Kopie, kein Verweis auf `CreatorService.price`. (Im Datenmodell ist das schon so.)
- **Ein gelöschtes Leistungspaket** darf eine bestehende Buchung nicht mitreißen. `CreatorService` wird deaktiviert (`active=false`), nicht gelöscht, solange noch Buchungen daran hängen.
- **Eine zurückgenommene Verfügbarkeit** kollidiert womöglich mit einem bereits reservierten Termin. Die App muss das beim Speichern erkennen und die Wahl lassen: Termin behalten oder absagen — Absagen ist eine Nachricht an den Fan, kein stiller Vorgang.
- **Preisänderung während eines laufenden Calls** gilt nicht mehr für diesen Call. `Call.rate_per_min` wird beim Start eingefroren; das ist im Datenmodell bereits so angelegt.
