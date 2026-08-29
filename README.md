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
- `src/tapeOptions.ts` listet alle auswählbaren Hintergründe, Designs und Textfarben auf.
- `src/styles/globals.css` enthält Layout, Design, Grain-Effekt und Spulenanimation.

Der Play-Button startet aktuell kein Spotify-Audio. Er steuert nur die Animation der beiden Spulen und funktioniert auch ohne Spotify-Link. Dafür ist weder ein Spotify-Konto noch eine `.env`-Datei nötig.

## Teilen

Sobald ein gültiger Spotify-Track-Link eingetragen ist, schreibt „Tape teilen“ den Track und den Kassettentext in einen URL-sicheren Zustand unter `/#/tape/<state>`.

## Neues Artwork ergänzen

Alle Artwork-PNGs haben `2000 × 1333 px` und behalten ihren transparenten Rand. Die Dateien liegen in:

```text
public/assets/tape/background_color/
public/assets/tape/design/
public/assets/tape/text/
```

Nach dem Export wird die neue Datei in `src/tapeOptions.ts` zur passenden Liste hinzugefügt. Die App erzeugt daraus automatisch einen weiteren Eintrag im Auswahlmenü. Hintergründe, Designs und Textfarben bleiben getrennt und können frei kombiniert werden.
