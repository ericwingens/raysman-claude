# Ring — Match. Ring. Connect.

Interaktiver Prototyp, der **zwei Welten verbindet**:

- **Design & Informationsarchitektur** der **Ring**-App (aus dem Figma-Board *„Ring – Mockup – v6"*) — eine Dating-/Matching-App mit Calling: warmes Orange, Pill-Buttons, Foto-Karten-Stapel, runde Avatare, verspielte Herzchen, iOS-Look.
- **Funktionalität von [Fanso](https://fanso.io/)** — die Creator-Economy-Plattform: Abos/Tiers, Pay-per-View, Tips, bezahlte Direktnachrichten, Livestreams, Feed, Wallet.

## Öffnen

Einzelne, self-contained HTML-Datei — keine Abhängigkeiten, kein Build.

```
ring-app/index.html   →   im Browser öffnen (oder als Artifact-Link)
```

## Enthaltene Screens & Flows

| Bereich | Funktion |
|---|---|
| **Onboarding** | Ring-Branding, Avatar-Cluster, „Los geht's" / Anmelden |
| **Discover** | Tinder-artiger Swipe-Karten-Stapel (Drag & Buttons), Like / Pass / Super-Ring / direkt anrufen; Creator-Badges, Live-Status, €/Min-Preis |
| **Explore** | Live-Stories, Creator-Grid, Kategorien |
| **Feed** | Posts abonnierter Creator, **PPV-gesperrte Inhalte** einmalig freischalten, Likes, Tips |
| **Chats** | Match- & Nachrichtenliste, Chat-Detail mit **bezahlten DMs**, Tip- und Call-Buttons |
| **Creator-Profil** | Bio, **Abo-Tiers (Free / VIP 9,99 €)**, „Ring me"-Call (€/Min), PPV-Galerie, Livestream |
| **Call-Screen** | Aktiver bezahlter Call mit **live hochzählendem Cost-Ticker pro Minute** (Ring: ab 0,99 €/Min) |
| **Wallet** | Guthaben, Aufladen (Stripe/PayPal-Optik), Transaktionshistorie |
| **Me** | Fan-Profil, Abos, Premium, „Creator werden", Einstellungen, **Dark/Light-Toggle** |

## Monetarisierung (aus Fanso, in den Ring-Look übersetzt)

- **Bezahlte Calls** pro Minute (Ring-Kernfunktion, direkt in Fanso-Logik überführt)
- **Abo-Tiers** je Creator
- **Pay-per-View** in Feed & DMs
- **Tips** auf Profilen, Posts, im Chat und während Calls
- **Wallet-Guthaben**, das durch alle Aktionen live aktualisiert wird

## Technik

- Vanilla JS SPA in einer Datei, tokenbasiertes Design (Light + Dark), CSP-sicher (keine externen Fonts/Bilder/Skripte).
- Foto-Platzhalter sind deterministische Mesh-Gradienten pro Person.
- Prototyp / Demo-Daten — keine echten Zahlungen oder Backend-Anbindung.

## Nächste mögliche Schritte

- Umbau in ein echtes React/Vite- oder Expo-Projekt (native iOS/Android).
- Anbindung eines Backends (Auth, Zahlungen via Stripe, WebRTC für echte Calls).
- Design-Feintuning gegen die restlichen Figma-Screens (Register-Flow, Start Recording, Settings).
