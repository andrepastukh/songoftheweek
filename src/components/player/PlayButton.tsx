import { Pause, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { useSpotifyPlayer } from "../../hooks/useSpotifyPlayer";
import { startCassetteSound } from "../../services/cassetteSound";

export function PlayButton() {
  const spotifyUrl = useTapeStore(state => state.spotifyUrl);
  const trackId = parseSpotifyTrackId(spotifyUrl);
  const player = useSpotifyPlayer();
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
    if (active) { void player.pause(); return; }
    if (empty) { useSpotifyStore.setState({ isPreviewPlaying: true }); return; }
    if (!trackId) return;
    if (!player.isConnected) { void player.login(); return; }
    if (!player.isReady) { void player.reconnect(); return; }
    void player.play(trackId);
  };
  const label = active ? "Wiedergabe pausieren" : empty ? "Spulenanimation starten" : !player.isConnected ? "Spotify verbinden" : !player.isReady ? "Spotify-Player verbinden" : "Song abspielen";

  return <div className="transport-wrap">
    <div className={`transport-deck ${active ? "is-running" : ""}`}>
      <span className="transport-deck__screw transport-deck__screw--left" aria-hidden="true" />
      <span className="transport-deck__screw transport-deck__screw--right" aria-hidden="true" />
      <span className="transport-deck__meter" aria-hidden="true"><i /><i /><i /></span>
      <button className={`transport-button ${active ? "is-playing" : ""}`} type="button"
        onClick={click} disabled={(!empty && !trackId) || player.isConnecting} aria-label={label} aria-pressed={active}>
        <span className="transport-button__top">
          {active ? <Pause size={19} strokeWidth={2} fill="currentColor" /> : <Play size={19} strokeWidth={2} fill="currentColor" />}
        </span>
        <span className="transport-button__legend">{active ? "PAUSE" : "PLAY"}</span>
      </button>
      <span className="transport-deck__lamp" aria-hidden="true" />
      <span className="transport-deck__mode" aria-hidden="true">AUTO STOP</span>
    </div>
    <span className="transport-label" role="status">{player.isConnecting ? "Player wird verbunden …" : player.isStarting ? "Kassette startet …" : player.isPlaying ? "playing" : empty ? "Design-Vorschau · ohne Audio" : label}</span>
    {trackId && <div className="spotify-connection">
      {!player.isConnected ? <>
        <button className="text-button" type="button" onClick={() => void player.login()}>Mit Spotify verbinden</button>
        <span>Für Audio in Side A brauchst du Spotify Premium.</span>
      </> : <div className="action-row">
        {!player.isReady && <button className="text-button" disabled={player.isConnecting} type="button" onClick={() => void player.reconnect()}>Player erneut verbinden</button>}
        <button className="text-button" type="button" onClick={player.disconnect}>Spotify trennen</button>
      </div>}
      {player.isReady && <span>Play startet diesen Song hier und löst die Wiedergabe auf anderen Geräten ab.</span>}
    </div>}
    {!player.isConnected && trackId && <button className="preview-button" type="button" onClick={preview}>
      {player.isPreviewPlaying ? "Vorschau stoppen" : "Mechanik ohne Spotify testen"}
    </button>}
    <div className="player-feedback">
      {player.error ? <p className="player-message field-help--error" role="alert">{player.error}</p>
        : player.notice ? <p className="player-message" role="status">{player.notice}</p> : null}
    </div>
  </div>;
}
