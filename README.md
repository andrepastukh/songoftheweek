# Side A

Eine React-/TypeScript-App für persönliche digitale Kassetten. Läuft vollständig statisch auf GitHub Pages: kein Backend, keine Datenbank und keine Side-A-Konten.

## Lokal starten

Node.js 24+ und pnpm 11 verwenden:

```bash
pnpm install
pnpm dev
```

Die ausgegebene Adresse unter `http://127.0.0.1:5173/` öffnen. Der Dev-Server verwendet diesen festen Port und bricht bei einem belegten Port ab. Eine bereits laufende Side-A-Instanz kann weiterverwendet werden. Gestaltung, Vorschau, Teilen und der öffentliche Spotify Embed benötigen keine Spotify-App-Konfiguration.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview --host 127.0.0.1
```

## Teilen ohne Backend

Auf Wunsch bleibt die komplette Kassette im Link:

```text
https://NAME.github.io/songoftheweek/#/t/<snapshot>
```

Gespeichert werden Formatversion, Spotify-Track-ID, Nachricht und die stabilen IDs für Kassettenfarbe, Design, Textfarbe und Seitenfarbe. Das kompakte JSON-Array wird UTF-8-/Base64URL-kodiert. Es enthält keine Tokens, Bilddateien, Metadaten oder UI-Objekte. Die Nachricht bleibt einschließlich Zeilenumbrüchen und Leerzeichen erhalten; die bestehende Kassettenanzeige trimmt weiterhin äußere Leerzeichen.

Der Link funktioniert auf anderen Geräten ohne localStorage, solange die App mit kompatiblem Decoder und ihren Artwork-Dateien erreichbar bleibt. Er enthält den gesamten Snapshot: spätere Änderungen im Editor verändern einen bereits verschickten Link nicht. „Neuen Share-Link erstellen“ erzeugt den neuen Stand. Identische Inhalte erzeugen denselben Link. Bisherige `#/tape/<state>`-Links bleiben lesbar.

Das ersetzt bewusst die ursprünglich angedachten POST/GET-Endpunkte und Datenbank-Datensätze. Es gibt keine kurze Datenbank-ID, kein serverseitiges Eigentum, keine Widerrufsfunktion und keine Signatur. Jeder mit dem Link kann dessen Nachricht lesen und durch Erstellen eines anderen Links verändern. Base64 ist keine Verschlüsselung. Der Fragmentinhalt wird beim Seitenabruf nicht an GitHub gesendet. Individuelle Social-Media-Vorschaukarten sind ohne Server nicht möglich.

`App.tsx` validiert den Hash und übernimmt das Design vor der Anzeige vollständig. Beschädigte Links zeigen eine Fehlerseite. Der Editor ist auf Share-Seiten geschlossen. „Eigene Version gestalten“ öffnet ihn; das Original bleibt unverändert.

## Spotify-Wiedergabe

Side A verwendet den offiziellen [Spotify Embed mit iFrame API](https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api). Dafür sind keine eigene Spotify-App, keine Client ID, keine Redirect URI und keine E-Mail-Allowlist nötig. Anmeldung, Kontowahl, DRM und Wiedergaberechte bleiben vollständig im von Spotify bereitgestellten Player. Besucher können dessen sichtbare Bedienelemente oder den Kassetten-Playbutton verwenden.

### Environment Variables

| Variable | Bedeutung |
| --- | --- |
| `VITE_CASSETTE_START_SOUND_URL` | Optionale eigene Sounddatei, z. B. `assets/audio/cassette-start.mp3`; leer verwendet synthetischen Klick |

Alle `VITE_*`-Werte sind öffentlich und werden beim Build eingebettet. Sie eignen sich nicht für Secrets. Die eigene Sounddatei gehört z. B. nach `public/assets/audio/cassette-start.mp3`.

### Was Spotify ermöglicht und begrenzt

Der Embed ist die öffentliche Spotify-Lösung für Websites. Ob ein kompletter Song oder nur eine Vorschau verfügbar ist, entscheidet Spotify anhand von Konto, Region, Browser und geschützter Medienwiedergabe. Side A erhält und speichert dabei keine Spotify-Tokens oder Kontodaten. Für volle Wiedergabe sollte der Besucher im Embed bei Spotify angemeldet sein und `encrypted-media` im Browser erlauben. [Spotify Embed Troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)

Im lokalen Dev-Server erscheint unten im Editor „Spotify UI testen“. „Verbindung simulieren“ zeigt Metadaten- und Player-Zustand und lässt den Kassettenplayer-Taster samt Startsound und Spulenanimation vier Sekunden lang laufen. Der Schalter wird durch `import.meta.env.DEV` aus Produktions-Builds entfernt und liefert kein Spotify-Audio.

Die iFrame-API meldet Start, Pause und Ende an Side A; daraus folgt ausschließlich die Spulenanimation. Der Spotify-Player bleibt sichtbar und zeigt die zugehörigen Metadaten und das Cover.

Spotify-Audio wird nicht heruntergeladen, verändert, mit dem Startsound gemischt oder an eine zeitlich synchronisierte Animation gekoppelt. Die vorhandenen Spulen zeigen nur den Wiedergabestatus. Spotify untersagt die Synchronisierung seiner Aufnahmen mit visuellen Medien; kommerzielle Streaming-Integrationen unterliegen zusätzlichen Einschränkungen. Ein eigener Player ist keine Erlaubnis, Spotify-Inhalte beliebig zu verwenden. [Spotify Developer Policy](https://developer.spotify.com/policy)

Ein gültiges Linkformat ist noch kein Nachweis, dass der Song existiert oder beim Empfänger verfügbar ist. Teilen funktioniert dennoch ohne Login; Spotify zeigt Verfügbarkeit und Anmeldeoptionen im Embed selbst.

## GitHub Pages

GitHub Pages hostet statische Dateien, keine Node-Server. Vite verwendet relative Build-Pfade; Grafiken und Logo berücksichtigen den App-Unterpfad. Die Hash-Routen benötigen keine Server-Rewrites oder 404-Tricks. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Ein manuell auslösbarer Workflow liegt unter `.github/workflows/pages.yml`:

1. Änderungen ins Repository übernehmen.
2. In Settings → Pages als Source **GitHub Actions** auswählen.
3. Optional unter Settings → Secrets and variables → Actions → Variables `VITE_CASSETTE_START_SOUND_URL` hinterlegen.
4. Unter Actions **Deploy Side A to GitHub Pages → Run workflow** starten. Der Workflow prüft Typen und Tests, baut die App und veröffentlicht ausschließlich `dist`.

Der Spotify Embed funktioniert ohne Spotify-Variablen. Diese Implementierung führt selbst kein Deployment aus. [GitHub Pages Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Architektur und manuelle Prüfung

- `src/state/tapeStore.ts`: editierbarer Entwurf plus Editor-/Share-Modus
- `src/state/spotifyStore.ts`: Verbindungs-, Playback- und Vorschauzustand, ohne Tokens
- `src/utils/spotifyUrl.ts`, `tapeData.ts`, `shareState.ts`: Parsing, stabile Snapshots, Hydration und versionierte Links
- `src/services/spotifyEmbed.ts`, `cassetteSound.ts`: öffentlicher Spotify Embed und lokaler Startsound
- `ShareButton.tsx`: lokaler Erstellungs-/Copy-/Share-Zustand

### Design selbst ändern

- `src/styles/globals.css`: vollständiges Layout, Abstände, Halftone-Muster und Retro-Play-Taster. `.player-dock` verschiebt den kompletten Player; `.transport-deck` und `.transport-button` gestalten das Gerät und den Taster.
- `src/tapeOptions.ts`: alle auswählbaren Kassettenbilder sowie die vier Seitenfarben. Neue Optionen brauchen eine dauerhafte, eindeutige `id`.
- `src/components/tape/Tape.tsx`: Reihenfolge und Position der Bildschichten der Kassette. Änderungen an `.tape-stage` und den Reel-Werten beeinflussen deren Proportionen und sollten nur zusammen mit den Originalmaßen 1963 × 1403 geändert werden.
- `src/components/editor/TapeEditor.tsx`: Aufbau und Reihenfolge der Felder im rechten Formular.
- `src/components/player/PlayButton.tsx`: Verhalten und JSX des Play-Bereichs; `SpotifyTrackInfo.tsx` zeigt Songdaten.
- `src/app/App.tsx`: setzt Header, Kassette, Player und Editor zur ganzen Seite zusammen und reicht die gewählte Seitenfarbe als CSS-Variablen weiter.

Die lokale Spotify-Simulation steckt in `src/components/dev/SpotifyPreviewToggle.tsx`. Weil sie nur bei `pnpm dev` gerendert wird, muss sie vor einem Deployment nicht gelöscht werden. Zum vollständigen Entfernen genügen der Import und `<SpotifyPreviewToggle />` in `TapeEditor.tsx` sowie diese eine Datei.

Manuell testen:

1. Ohne Song die Spulen starten/pausieren; Hintergrund, Design, Textfarbe, Nachricht und Editor weiterhin bedienen.
2. Album-Link oder falsche Domain einfügen: verständlicher Fehler, Share deaktiviert. Gültigen Track-Link mit `?si=` oder `intl-de` einfügen.
3. Nachricht mit Emojis/Zeilenumbrüchen gestalten, Link erstellen und kopieren. In einem privaten Fenster öffnen: identische Grafik/Nachricht, Editor geschlossen.
4. Eine eigene Version bearbeiten und neuen Link erstellen. Alten Link erneut öffnen: unverändert. Beschädigten `#/t/...`-Link öffnen: Fehlerzustand statt Default-Kassette.
5. Im sichtbaren Spotify Embed anmelden und den vollständigen Song starten; derselbe Link muss ohne E-Mail-Allowlist auch in einem zweiten Spotify-Konto funktionieren.
6. Play/Pause sowohl im Embed als auch am Kassettenbutton testen; die Spulenanimation muss dem gemeldeten Wiedergabestatus folgen.
7. Unbekannten Song, Offline-Verbindung, blockierte Drittanbieter-Inhalte und Browser ohne geschützte Medien prüfen.
8. Nach dem Deployment eine Share-URL direkt laden und neu laden: Assets müssen auch unter dem Repository-Unterpfad erreichbar sein.

Die automatisierten Tests decken reine Datenlogik und die iFrame-API-Anbindung ab. Echte Spotify-Anmeldung und DRM-Audio müssen zusätzlich im Browser getestet werden.

## Neues Artwork

Die vorhandenen PNGs sind 2000 × 1333 px und behalten ihren transparenten Rand. Neue Dateien in `public/assets/tape/` ablegen und in `src/tapeOptions.ts` mit einer stabilen ID registrieren. Bestehende IDs und Dateien erhalten, damit alte Share-Links weiterhin gleich aussehen.
