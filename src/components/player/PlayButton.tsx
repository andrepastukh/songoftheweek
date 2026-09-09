import { Pause, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { startCassetteSound } from "../../services/cassetteSound";
import { pauseSpotifyEmbed, playSpotifyEmbed } from "../../services/spotifyEmbed";

export function PlayButton() {
  const spotifyUrl = useTapeStore(state => state.spotifyUrl);
  const trackId = parseSpotifyTrackId(spotifyUrl);
  const player = useSpotifyStore();
  const active = player.isPlaying || player.isStarting || player.isPreviewPlaying;
  const empty = !spotifyUrl.trim();
  const previewTimer = useRef<number | null>(null);
  const stopPreviewSound = useRef<(() => void) | null>(null);

  const stopPreview = () => {
    if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
    previewTimer.current = null;
    stopPreviewSound.current?.();
    stopPreviewSound.current = null;
    useSpotifyStore.setState({ isPreviewPlaying: false });
  };

  useEffect(() => stopPreview, []);

  const preview = () => {
    if (player.isPreviewPlaying) { stopPreview(); return; }
    stopPreview();
    useSpotifyStore.setState({ isPreviewPlaying: true, error: "", notice: "" });
    try {
      const sound = startCassetteSound();
      stopPreviewSound.current = sound.stop;
      void sound.ready.catch(() => {
        useSpotifyStore.setState({ error: "Der Kassettensound wurde vom Browser blockiert. Bitte noch einmal klicken." });
      });
    } catch {
      useSpotifyStore.setState({ error: "Der Kassettensound ist in diesem Browser nicht verfügbar." });
    }
    previewTimer.current = window.setTimeout(stopPreview, 4_000);
  };

  const click = () => {
    if (player.isPreviewPlaying) { stopPreview(); return; }
    if (active) { pauseSpotifyEmbed(); return; }
    if (empty || player.isDemoMode) { preview(); return; }
    if (!trackId) return;
    if (!player.isReady) return;
    if (player.isPlaying) pauseSpotifyEmbed();
    else playSpotifyEmbed();
  };
  const label = active ? "Wiedergabe pausieren" : empty ? "Spulenanimation starten" : !player.isReady ? "Spotify wird geladen" : "Song abspielen";

  return <div className="transport-wrap">
    <div className={`transport-deck ${active ? "is-running" : ""}`}>
      <span className="transport-deck__screw transport-deck__screw--left" aria-hidden="true" />
      <span className="transport-deck__screw transport-deck__screw--right" aria-hidden="true" />
      <span className="transport-deck__meter" aria-hidden="true"><i /><i /><i /></span>
      <button className={`transport-button ${active ? "is-playing" : ""}`} type="button"
        onClick={click} disabled={(!empty && !trackId) || (!empty && !player.isDemoMode && !player.isReady)} aria-label={label} aria-pressed={active}>
        <span className="transport-button__top">
          {active ? <Pause size={19} strokeWidth={2} fill="currentColor" /> : <Play size={19} strokeWidth={2} fill="currentColor" />}
        </span>
        <span className="transport-button__legend">{active ? "PAUSE" : "PLAY"}</span>
      </button>
      <span className="transport-deck__lamp" aria-hidden="true" />
      <span className="transport-deck__mode" aria-hidden="true">AUTO STOP</span>
    </div>
    <span className="transport-label" role="status">{player.isConnecting ? "verbindet" : player.isStarting ? "startet" : active ? "playing" : player.isDemoMode ? "simulation" : player.isReady ? "bereit" : player.isConnected ? "angemeldet" : "nicht verbunden"}</span>
    <div className="player-feedback">
      {player.error ? <p className="player-message field-help--error" role="alert">{player.error}</p>
        : player.notice ? <p className="player-message" role="status">{player.notice}</p> : null}
    </div>
  </div>;
}
