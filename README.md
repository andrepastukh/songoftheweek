# Side A

Eine interaktive, teilbare 90er-Jahre-Kassette für deinen Song der Woche.

## Start

```bash
npm install
npm run dev
```

Ohne Spotify-Konfiguration läuft die App vollständig im Demo-Modus. Eine spätere Spotify-Anbindung ist über `src/spotify/` vorbereitet; Zugangsdaten gehören ausschließlich in eine lokale `.env`.

## Teilen

Der Button „Tape teilen“ schreibt die Konfiguration als URL-sicheren Zustand in `/#/tape/<state>`. OAuth-Tokens werden niemals geteilt.
