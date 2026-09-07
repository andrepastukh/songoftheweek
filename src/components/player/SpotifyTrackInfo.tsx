import { useEffect, useState } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { getSpotifyTrack, type SpotifyTrack } from "../../services/spotify";

export function SpotifyTrackInfo() {
  const id = parseSpotifyTrackId(useTapeStore(state => state.spotifyUrl));
  const connected = useSpotifyStore(state => state.isConnected);
  const [result, setResult] = useState<{ id: string; track?: SpotifyTrack; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id || !connected) { setResult(null); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void getSpotifyTrack(id, controller.signal).then(track => {
        if (!controller.signal.aborted) setResult({ id, track });
      }).catch(error => {
        if (!controller.signal.aborted) setResult({ id, error: error instanceof Error ? error.message : "Songdetails konnten nicht geladen werden." });
      });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [id, connected, attempt]);
  if (!id) return null;
  const current = result?.id === id && connected ? result : null;
  return <div className="track-info">
    {current?.track?.cover && <img src={current.track.cover} alt={`Albumcover zu ${current.track.title}`} />}
    <div>
      {current?.track && <><strong>{current.track.title}</strong><span>{current.track.artist}</span></>}
      <a href={`https://open.spotify.com/track/${id}`} target="_blank" rel="noopener noreferrer">Auf Spotify öffnen ↗</a>
      {connected && !current && <span role="status">Songdetails werden geladen …</span>}
      {current?.track && !current.track.playable && <span role="alert">Dieser Song ist für dein Konto nicht verfügbar.</span>}
      {current?.error && <span className="field-help--error" role="alert">{current.error}</span>}
    </div>
  </div>;
}
