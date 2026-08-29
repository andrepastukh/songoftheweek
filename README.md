# Side A

Eine kleine React-App für eine persönliche, teilbare Kassette.

## Start

```bash
pnpm install
pnpm dev
```

Öffne danach die Adresse, die Vite im Terminal anzeigt.

## So funktioniert die App

- `src/app/App.tsx` setzt die Seite aus Kassette, Play-Button und Editor zusammen.
- `src/components/` enthält die einzelnen sichtbaren Bausteine.
- `src/state/tapeStore.ts` speichert Spotify-Link, Kassettentext und UI-Zustand zentral.
- `src/utils/spotifyUrl.ts` prüft Spotify-Links.
- `src/utils/shareState.ts` wandelt die Kassettendaten in einen teilbaren Link um und wieder zurück.
- `src/styles/globals.css` enthält Layout, Design, Grain-Effekt und Spulenanimation.

Der Play-Button startet aktuell kein Spotify-Audio. Er steuert nur die Animation der beiden Spulen und funktioniert auch ohne Spotify-Link. Dafür ist weder ein Spotify-Konto noch eine `.env`-Datei nötig.

## Teilen

Sobald ein gültiger Spotify-Track-Link eingetragen ist, schreibt „Tape teilen“ den Track und den Kassettentext in einen URL-sicheren Zustand unter `/#/tape/<state>`.
