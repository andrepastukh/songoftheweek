import { useEffect, useRef } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { mountSpotifyEmbed } from "../../services/spotifyEmbed";

export function SpotifyTrackInfo() {
  const id = parseSpotifyTrackId(useTapeStore(state => state.spotifyUrl));
  const demo = useSpotifyStore(state => state.isDemoMode);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || demo || !host.current) return;
    const abortController = new AbortController();
    let cleanup: (() => void) | undefined;
    let disposed = false;
    void mountSpotifyEmbed(host.current, id, abortController.signal).then(result => {
      if (disposed) result();
      else cleanup = result;
    }).catch(error => {
      if (!disposed) {
        const message = error instanceof Error ? error.message : "Der Spotify-Player konnte nicht geladen werden.";
        useSpotifyStore.setState({ isConnecting: false, error: message });
      }
    });
    return () => { disposed = true; abortController.abort(); cleanup?.(); };
  }, [id, demo]);

  if (!id) return null;
  if (demo) return <div className="track-info track-info--demo">
    <span className="track-info__demo-cover" aria-hidden="true">A</span>
    <div>
      <strong>Demo-Song</strong>
      <a href={`https://open.spotify.com/track/${id}`} target="_blank" rel="noopener noreferrer">Auf Spotify öffnen ↗</a>
    </div>
  </div>;
  return <div className="spotify-embed-wrap">
    <div ref={host} className="spotify-embed" aria-label="Spotify-Player" />
  </div>;
}
