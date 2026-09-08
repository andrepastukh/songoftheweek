import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/globals.css";
import { finishSpotifyLogin, isSpotifyCallback } from "./services/spotifyAuth";

const root = createRoot(document.getElementById("root")!);
async function start() {
  if (isSpotifyCallback()) {
    root.render(<main className="app-shell"><p className="route-error" role="status">Spotify wird verbunden. Deine Kassette wird wiederhergestellt …</p></main>);
    const result = await finishSpotifyLogin();
    window.history.replaceState(null, "", result.returnTo);
    root.render(<StrictMode><App initialDraft={result.draft} authNotice={result.error ?? "Spotify ist verbunden."} /></StrictMode>);
  } else root.render(<StrictMode><App /></StrictMode>);
}
void start().catch(() => {
  root.render(<main className="app-shell"><p className="route-error" role="alert">Die Anmeldung konnte nicht abgeschlossen werden. Bitte den ursprünglichen Tape-Link erneut öffnen.</p></main>);
});
