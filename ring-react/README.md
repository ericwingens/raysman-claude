# Ring — React-App (Vite)

Echte Codebasis des Ring-Prototyps: **Ring-Design** (Figma *„Ring – Mockup – v6"*, 1:1-Muster aus dem Board-Screenshot) kombiniert mit **Fanso-Funktionalität** (Abos, PPV, Tips, bezahlte Calls & DMs, Wallet).

## Starten

```bash
cd ring-react
npm install
npm run dev        # Entwicklung → http://localhost:5173
npm run build      # Produktions-Build → dist/
npm run preview    # Build lokal ansehen
```

## Struktur

```
src/
  main.jsx                 Einstieg
  App.jsx                  Shell: Statusbar, Tabbar, State (Wallet, Abos, Call-Ticker), Overlay-Stack
  styles.css               Design-Tokens (Ring-Orange, Light/Dark) + alle Komponenten-Styles
  data.js                  Demo-Daten (Creator, Posts, Chats) — später durch API ersetzen
  lib.jsx                  Helpers: Gradient-Fotos, EUR-Format, Icon-Set
  screens/
    Onboarding.jsx         Welcome + Register-Flow (Formular → Gender → Suche → Alter → Foto → Voice) — 1:1 Figma
    Discover.jsx           Swipe-Deck (Like/Pass/Super-Ring/Call) mit Drag-Geste
    Explore.jsx            Top-Tabs Explore|Matches, Voice-Intro-Listen (▶/❤ bzw. 📞/✕) — 1:1 Figma; + Live-Stories & Creator-Grid (Fanso)
    Feed.jsx               PPV-gesperrte Posts, Likes, Tips (Fanso)
    Chats.jsx              Matches + Unterhaltungen
    Me.jsx                 Profile Settings 1:1 Figma: Fotos, Voice-Message, Bio/Geburtsdatum/Gender,
                           Change-Image- & Delete-Account-Modal; + Wallet/Abos/Premium (Fanso)
  overlays/
    Overlays.jsx           Creator-Profil (Abo-Tiers, Ring-me, PPV-Galerie), Chat-Detail (bezahlte DMs),
                           Tip-Sheet, Wallet-Sheet, Call-Screen (Kosten-Ticker/Min), Datenschutz & Impressum
```

## Verifiziert

Build (`vite build`) und kompletter Klick-Durchlauf (Onboarding → Register → Discover → Explore → Matches → bezahlter Call mit Ticker) via Headless-Chromium getestet — keine Konsolen-Fehler; Ticker-Abrechnung stimmt (1,99 €/Min → 0,10 € nach 3 s).

## Weg zu nativen Apps (Expo / React Native)

- `data.js`, State-Logik und Screen-Aufteilung sind bewusst View-agnostisch gehalten.
- CSS-Tokens (`styles.css` `:root`) 1:1 in ein RN-Theme-Objekt überführen.
- Swipe-Deck → `react-native-gesture-handler`/`reanimated`; Sheets → `@gorhom/bottom-sheet`; Calls → LiveKit/Twilio RN-SDK.
- Details & Roadmap: siehe `../ring-app/BUILD-PLAN.md`.
