# Side A

Eine React-/TypeScript-App für persönliche digitale Kassetten. Läuft vollständig statisch auf GitHub Pages: kein Backend, keine Datenbank und keine Side-A-Konten.

## Lokal starten

Node.js 24+ und pnpm 11 verwenden:

```bash
pnpm install
pnpm dev
```

Die ausgegebene Adresse unter `http://127.0.0.1:5173/` öffnen. Der Dev-Server verwendet diesen festen Port und bricht bei einem belegten Port ab. Eine bereits laufende Side-A-Instanz kann weiterverwendet werden. Gestaltung, Vorschau und Teilen funktionieren ohne Spotify-Konfiguration.

Wird die App über `localhost` oder einen anderen lokalen Port geöffnet, bringt „Mit Spotify verbinden“ den aktuellen Song samt Nachricht und Design als Snapshot zur konfigurierten lokalen Rücksprungadresse. Dort erneut verbinden. OAuth beginnt erst an der passenden Adresse, damit der PKCE-Verifier im richtigen Tab-Speicher liegt. Zwischen unterschiedlichen öffentlichen Websites findet dieser Wechsel nicht statt.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview --host 127.0.0.1
```

Für OAuth in der Preview muss deren Adresse zusätzlich bei Spotify registriert und vor dem Build als Redirect URI konfiguriert sein.

## Teilen ohne Backend

Auf Wunsch bleibt die komplette Kassette im Link:

```text
https://NAME.github.io/songoftheweek/#/t/<snapshot>
```

Gespeichert werden Formatversion, Spotify-Track-ID, Nachricht und die stabilen IDs für Kassettenfarbe, Design, Textfarbe und Seitenfarbe. Das kompakte JSON-Array wird UTF-8-/Base64URL-kodiert. Es enthält keine Tokens, Bilddateien, Metadaten oder UI-Objekte. Die Nachricht bleibt einschließlich Zeilenumbrüchen und Leerzeichen erhalten; die bestehende Kassettenanzeige trimmt weiterhin äußere Leerzeichen.

Der Link funktioniert auf anderen Geräten ohne localStorage, solange die App mit kompatiblem Decoder und ihren Artwork-Dateien erreichbar bleibt. Er enthält den gesamten Snapshot: spätere Änderungen im Editor verändern einen bereits verschickten Link nicht. „Neuen Share-Link erstellen“ erzeugt den neuen Stand. Identische Inhalte erzeugen denselben Link. Bisherige `#/tape/<state>`-Links bleiben lesbar.

Das ersetzt bewusst die ursprünglich angedachten POST/GET-Endpunkte und Datenbank-Datensätze. Es gibt keine kurze Datenbank-ID, kein serverseitiges Eigentum, keine Widerrufsfunktion und keine Signatur. Jeder mit dem Link kann dessen Nachricht lesen und durch Erstellen eines anderen Links verändern. Base64 ist keine Verschlüsselung. Der Fragmentinhalt wird beim Seitenabruf nicht an GitHub gesendet. Individuelle Social-Media-Vorschaukarten sind ohne Server nicht möglich.

`App.tsx` validiert den Hash und übernimmt das Design vor der Anzeige vollständig. Beschädigte Links zeigen eine Fehlerseite. Der Editor ist auf Share-Seiten geschlossen. „Eigene Version gestalten“ öffnet ihn; das Original bleibt unverändert.

## Spotify Setup

1. Im [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) eine App erstellen und Web API/Web Playback SDK als verwendete Schnittstellen auswählen.
2. Die öffentliche Client ID kopieren. **Kein Client Secret im Frontend verwenden.**
3. Redirect URIs exakt registrieren:
   - lokal: `http://127.0.0.1:5173/`
   - GitHub Project Pages bei einem Repository namens `songoftheweek`: `https://DEIN-GITHUB-NAME.github.io/songoftheweek/`
   - GitHub User Page bei einem Repository namens `DEIN-GITHUB-NAME.github.io`: `https://DEIN-GITHUB-NAME.github.io/`
   - eigene Domain beispielsweise: `https://side-a.app/`
4. Im Development Mode unter Users Management die Spotify-Konten der Testnutzer freischalten.
5. `.env.example` nach `.env.local` kopieren und Client ID sowie Redirect URI eintragen. Nach Änderungen den Dev-Server neu starten bzw. neu bauen.

Du darfst die lokale und die spätere öffentliche Redirect URI gleichzeitig im Spotify Dashboard hinterlegen. In `VITE_SPOTIFY_REDIRECT_URI` steht jeweils genau die Adresse, für die du gerade baust. GitHub Actions liest den Produktionswert aus der Repository-Variable gleichen Namens. Groß-/Kleinschreibung, Pfad und abschließender Slash müssen mit dem Dashboard übereinstimmen; `#/t/...` gehört nie in die Redirect URI.

Die Callback-Adresse ist bewusst die reale statische Startdatei, keine virtuelle `/spotify/callback`-Route. Spotify liefert `?code=…&state=…` dort ab. Anschließend stellt Side A die vorherige Hash-Route und den Entwurf wieder her. Redirect URIs dürfen keinen Hash enthalten. HTTPS ist erforderlich, außer bei lokalen Loopback-IP-Adressen; `localhost` ist nicht zulässig. Siehe [Spotify Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

Angefragte Scopes:

- `streaming`: Web Playback SDK
- `user-read-email`, `user-read-private`: SDK-Autorisierung
- `user-read-playback-state`, `user-modify-playback-state`: Playback-Geräte und Songsteuerung

### Environment Variables

| Variable | Bedeutung |
| --- | --- |
| `VITE_SPOTIFY_CLIENT_ID` | Öffentliche App-ID; ohne Wert bleiben Gestaltung und Teilen verfügbar |
| `VITE_SPOTIFY_REDIRECT_URI` | Exakte Rücksprungadresse auf derselben Origin; leer verwendet den aktuellen Seitenpfad |
| `VITE_SPOTIFY_PLAYBACK_DELAY_MS` | Mindestverzögerung ab Play, Standard 900 ms, begrenzt auf 0–5000 ms |
| `VITE_CASSETTE_START_SOUND_URL` | Optionale eigene Sounddatei, z. B. `assets/audio/cassette-start.mp3`; leer verwendet synthetischen Klick |

Alle `VITE_*`-Werte sind öffentlich und werden beim Build eingebettet. Sie eignen sich nicht für Secrets. Die eigene Sounddatei gehört z. B. nach `public/assets/audio/cassette-start.mp3`. Sie wird spätestens vor dem Spotify-Start gestoppt; am besten einen kurzen Clip verwenden. `src/config.ts` enthält die zentrale Delay-Konfiguration.

### Was Spotify ermöglicht und begrenzt

Ein Browser-Login bei Spotify ersetzt die App-Autorisierung nicht. Side A leitet zu Spotify weiter; Spotify kann seine bestehende Sitzung wiederverwenden. Side A liest keine Spotify-Cookies und erzwingt keinen erneuten Login per `show_dialog`. Consent, Kontowahl und erneute Anmeldung kontrolliert Spotify. [Authorization Code mit PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)

Jeder Empfänger benötigt für Browser-Audio ein eigenes Premium-Konto und muss Side A freigeben. Ohne dies bleibt „Auf Spotify öffnen“ verfügbar. Laut aktueller Dokumentation brauchen Development-Mode-Apps einen Premium-Inhaber und erlauben höchstens fünf freigeschaltete Nutzer. OAuth kann für andere Nutzer gelingen, während API-Zugriffe anschließend mit 403 scheitern. Öffentliche Wiedergabe für beliebige Empfänger erfordert eine passende Spotify-Freigabe; Extended Quota ist kein automatisch verfügbarer Schritt für kleine Projekte. [Spotify Quota Modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)

Im lokalen Dev-Server erscheint unten im Editor „Spotify UI testen“. „Verbindung simulieren“ zeigt Metadaten- und Player-Zustand und lässt den Kassettenplayer-Taster samt Startsound und Spulenanimation vier Sekunden lang laufen. Der Schalter wird durch `import.meta.env.DEV` aus Produktions-Builds entfernt und liefert kein Spotify-Audio.

Das Web Playback SDK erzeugt das Spotify-Connect-Gerät „Side A Cassette“. Die Web API wählt den Song auf genau diesem Gerät. Der eigene Button steuert Start, Pause und Fortsetzen. Ein Play-Klick kann laufende Wiedergabe auf einem anderen Gerät ablösen; die Oberfläche erklärt dies. Ein Gerätewechsel stoppt die lokale Statusanimation, sobald das SDK ihn meldet.

Audio beginnt nur nach einem echten Klick. Dabei werden SDK-Audioelement und eigener Sound unmittelbar aktiviert; erst nach mindestens der eingestellten Verzögerung und erfolgreicher Track-Prüfung startet Spotify. Netzwerklatenz kann den Start verlängern. Pause während der Verzögerung verhindert den späteren Start. Nach OAuth ist erneut Play nötig. Manche Browser blockieren Audio trotzdem; die App zeigt dann einen Hinweis zum erneuten Klicken. Browser ohne geschützte Medien/EME können das SDK nicht verwenden. Die Verfügbarkeit kann außerdem vom Markt und Konto abhängen. [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/reference)

Spotify-Audio wird nicht heruntergeladen, verändert, mit dem Startsound gemischt oder an eine zeitlich synchronisierte Animation gekoppelt. Die vorhandenen Spulen zeigen nur den Wiedergabestatus. Spotify untersagt die Synchronisierung seiner Aufnahmen mit visuellen Medien; kommerzielle Streaming-Integrationen unterliegen zusätzlichen Einschränkungen. Ein eigener Player ist keine Erlaubnis, Spotify-Inhalte beliebig zu verwenden. [Spotify Developer Policy](https://developer.spotify.com/policy)

Metadaten (Titel, Künstler, Cover) kommen nach dem Verbinden aus der Web API und bleiben nur im Speicher. Ein gültiges Linkformat ist noch kein Nachweis, dass der Song existiert oder für den Empfänger verfügbar ist. Deshalb ist Teilen ohne Login möglich, während Metadaten und Playback fehlende/gesperrte Songs verständlich melden. [Get Track](https://developer.spotify.com/documentation/web-api/reference/get-track)

### Security-Modell

Direktes OAuth mit PKCE S256, kryptografischem `state` und einmalig verbrauchtem Verifier; kein Better Auth und kein Client Secret. Better Auth wäre für eigene Side-A-Konten eine getrennte Entscheidung.

- Access Token nur im Modulspeicher, niemals in Zustand, Share-Link oder localStorage.
- Refresh Token im `sessionStorage` des aktuellen Tabs, damit Reloads funktionieren. OAuth-Entwurf, Rücksprungpfad und Verifier ebenfalls nur dort und nur bis zum Callback.
- Ablaufprüfung mit 60 Sekunden Puffer; gleichzeitige Refreshes werden zusammengefasst. Neue Refresh Tokens ersetzen alte, fehlende werden nicht gelöscht. Bei 401 erfolgt höchstens ein Refresh/Retry; abgelehnte Refresh Tokens werden entfernt. [Spotify Refresh](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- Rücksprung nur auf dieselbe Origin; OAuth-Query wird vor dem Rendern der App aus der Adresszeile entfernt. Nachrichten werden ausschließlich als React-Text angezeigt. Keine Tokens in Logs.
- „Spotify trennen“ löscht die lokale Anmeldung und trennt das SDK. Es widerruft nicht die Freigabe im Spotify-Konto; diese kann unter Spotify → Apps entfernt werden.

sessionStorage ist für JavaScript derselben Origin lesbar und schützt daher nicht vor XSS oder kompromittierten Abhängigkeiten. Eine HttpOnly-Cookie-Lösung würde ein vertrauenswürdiges Backend erfordern. Die statische Architektur priorisiert wenig Infrastruktur und begrenzte Speicherung, nicht vollständige Isolation von Browser-JavaScript.

## GitHub Pages

GitHub Pages hostet statische Dateien, keine Node-Server. Vite verwendet relative Build-Pfade; Grafiken und Logo berücksichtigen den App-Unterpfad. Die Hash-Routen benötigen keine Server-Rewrites oder 404-Tricks. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Ein manuell auslösbarer Workflow liegt unter `.github/workflows/pages.yml`:

1. Änderungen ins Repository übernehmen.
2. In Settings → Pages als Source **GitHub Actions** auswählen.
3. Unter Settings → Secrets and variables → Actions → Variables `VITE_SPOTIFY_CLIENT_ID` und `VITE_SPOTIFY_REDIRECT_URI` für die veröffentlichte Adresse hinterlegen. Delay/Sound sind optional.
4. Unter Actions **Deploy Side A to GitHub Pages → Run workflow** starten. Der Workflow prüft Typen und Tests, baut die App und veröffentlicht ausschließlich `dist`.

Ohne Spotify-Variablen funktioniert die veröffentlichte App für Design und Share-Links. Diese Implementierung führt selbst kein Deployment aus. [GitHub Pages Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Architektur und manuelle Prüfung

- `src/state/tapeStore.ts`: editierbarer Entwurf plus Editor-/Share-Modus
- `src/state/spotifyStore.ts`: Verbindungs-, Playback- und Vorschauzustand, ohne Tokens
- `src/utils/spotifyUrl.ts`, `tapeData.ts`, `shareState.ts`: Parsing, stabile Snapshots, Hydration und versionierte Links
- `src/services/spotifyAuth.ts`, `spotify.ts`, `spotifyPlayer.ts`, `cassetteSound.ts`: PKCE/Refresh, Metadaten/API, SDK-Steuerung und Startsound
- `src/hooks/useSpotifyPlayer.ts`: kleine React-Schnittstelle zum Player
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
5. Spotify verbinden und OAuth abbrechen bzw. abschließen: Rückkehr zur gleichen URL und zum noch nicht geteilten Entwurf. Nach erfolgreichem Login erneut Play drücken.
6. Play: Klicksound, Verzögerung, Spotify-Song; Pause/Fortsetzen testen. Während der Verzögerung pausieren oder Song wechseln: kein verspäteter Start des alten Songs.
7. Gerätewechsel, abgelaufene/entzogene Freigabe, Konto ohne Premium, unbekannten Song, Offline-Verbindung und Browser-Audioblockade prüfen. Der direkte Spotify-Link bleibt erreichbar.
8. Nach dem Deployment eine Share-URL direkt laden und neu laden: Assets müssen auch unter dem Repository-Unterpfad erreichbar sein.

Die automatisierten Tests decken reine Datenlogik und gemockte OAuth-/SDK-Abläufe ab. Echter Spotify-Login, DRM-Audio und kontospezifische Freigaben müssen mit einer eingerichteten Spotify-App und erlaubtem Premium-Konto getestet werden.

## Neues Artwork

Die vorhandenen PNGs sind 2000 × 1333 px und behalten ihren transparenten Rand. Neue Dateien in `public/assets/tape/` ablegen und in `src/tapeOptions.ts` mit einer stabilen ID registrieren. Bestehende IDs und Dateien erhalten, damit alte Share-Links weiterhin gleich aussehen.
