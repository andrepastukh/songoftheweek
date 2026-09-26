import { useEffect, useRef } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { startCassetteSound } from "../../services/cassetteSound";
import {
  pauseSpotifyEmbed,
  playSpotifyEmbed,
  seekSpotifyEmbed,
} from "../../services/spotifyEmbed";

type TransportControlProps = {
  label: string;
  legend: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function TransportControl({ label, legend, disabled, onClick, children }: TransportControlProps) {
  return <button
    className="transport-control"
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
  >
    <span className="transport-control__icon" aria-hidden="true">{children}</span>
    <span className="transport-control__legend">{legend}</span>
  </button>;
}

export function PlayButton() {
  const spotifyUrl = useTapeStore(state => state.spotifyUrl);
  const trackId = parseSpotifyTrackId(spotifyUrl);
  const player = useSpotifyStore();
  const active = player.isPlaying || player.isStarting || player.isPreviewPlaying;
  const empty = !spotifyUrl.trim();
  const controlsDisabled = !player.isDemoMode && !player.isReady;
  const previewTimer = useRef<number | null>(null);
  const stopPreviewSound = useRef<(() => void) | null>(null);
  const stopSongStartSound = useRef<(() => void) | null>(null);

  const playStartSound = () => {
    try {
      const sound = startCassetteSound();
      void sound.ready.catch(() => {
        useSpotifyStore.setState({ error: "Der Kassettensound wurde vom Browser blockiert. Bitte noch einmal klicken." });
      });
      return sound.stop;
    } catch {
      useSpotifyStore.setState({ error: "Der Kassettensound ist in diesem Browser nicht verfügbar." });
      return null;
    }
  };

  const stopPreview = () => {
    if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
    previewTimer.current = null;
    stopPreviewSound.current?.();
    stopPreviewSound.current = null;
    useSpotifyStore.setState({ isPreviewPlaying: false });
  };

  useEffect(() => () => {
    stopPreview();
    stopSongStartSound.current?.();
  }, []);

  const preview = () => {
    if (player.isPreviewPlaying) { stopPreview(); return; }
    stopPreview();
    useSpotifyStore.setState({ isPreviewPlaying: true, error: "", notice: "" });
    stopPreviewSound.current = playStartSound();
    previewTimer.current = window.setTimeout(stopPreview, 4_000);
  };

  const click = () => {
    if (player.isPreviewPlaying) { stopPreview(); return; }
    if (active) {
      stopSongStartSound.current?.();
      stopSongStartSound.current = null;
      pauseSpotifyEmbed();
      return;
    }
    if (empty || player.isDemoMode) { preview(); return; }
    if (!trackId) return;
    stopSongStartSound.current?.();
    stopSongStartSound.current = playStartSound();
    playSpotifyEmbed();
  };
  const label = active ? "Wiedergabe pausieren" : empty ? "Spulenanimation starten" : "Song abspielen";

  return <div className="transport-wrap">
    <div className={`transport-deck ${active ? "is-running" : ""}`}>
      <span className="transport-deck__screw transport-deck__screw--left" aria-hidden="true" />
      <span className="transport-deck__screw transport-deck__screw--right" aria-hidden="true" />
      <span className="transport-deck__meter" aria-hidden="true"><i /><i /><i /></span>
      <div className="transport-controls" role="group" aria-label="Spotify Wiedergabesteuerung">
        <TransportControl label="10 Sekunden zurückspulen" legend="−10s" disabled={controlsDisabled} onClick={() => seekSpotifyEmbed(-10)}>
          <svg className="transport-control__seek-icon" viewBox="0 0 24 18"><path d="m7 3-4 4 4 4M3 7h10a5 5 0 0 1 5 5v2" /></svg>
        </TransportControl>
        <button className={`transport-button ${active ? "is-playing" : ""}`} type="button"
        onClick={click} disabled={controlsDisabled || (!empty && !trackId)} aria-label={label} aria-pressed={active}>
        <span className="transport-button__top">
          <span className={`play-pause-icon ${active ? "is-paused" : ""}`} aria-hidden="true">
            <i /><i />
          </span>
        </span>
        <span className="transport-button__legend">{active ? "PAUSE" : "PLAY"}</span>
        </button>
        <TransportControl label="10 Sekunden vorspulen" legend="+10s" disabled={controlsDisabled} onClick={() => seekSpotifyEmbed(10)}>
          <svg className="transport-control__seek-icon" viewBox="0 0 24 18"><path d="m17 3 4 4-4 4M21 7H11a5 5 0 0 0-5 5v2" /></svg>
        </TransportControl>
      </div>
      <span className="transport-deck__lamp" aria-hidden="true" />
    </div>
    <span className="transport-label" role="status">{player.isConnecting ? "verbindet" : player.isStarting ? "startet" : active ? "playing" : player.isDemoMode ? "simulation" : player.isReady ? "bereit" : player.isConnected ? "angemeldet" : "nicht verbunden"}</span>
    <div className="player-feedback">
      {player.error ? <p className="player-message field-help--error" role="alert">{player.error}</p>
        : player.notice ? <p className="player-message" role="status">{player.notice}</p> : null}
    </div>
  </div>;
}
