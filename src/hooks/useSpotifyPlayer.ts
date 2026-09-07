import { useEffect } from "react";
import { useSpotifyStore } from "../state/spotifyStore";
import { useTapeStore } from "../state/tapeStore";
import { connectPlayer, disconnectPlayer, pauseTape, playTape, resetPlayback } from "../services/spotifyPlayer";
import { hasSpotifySession, loginSpotify } from "../services/spotifyAuth";

export function useSpotifyPlayer() {
  const state = useSpotifyStore();
  useEffect(() => {
    if (hasSpotifySession()) void connectPlayer();
    return useTapeStore.subscribe((next, previous) => {
      if (next.spotifyUrl !== previous.spotifyUrl) resetPlayback();
    });
  }, []);

  const login = async () => {
    const { spotifyUrl, message, backgroundId, designId, textColorId, editorOpen, sharedMode } = useTapeStore.getState();
    try { await loginSpotify({ spotifyUrl, message, backgroundId, designId, textColorId, editorOpen, sharedMode }); }
    catch (error) { useSpotifyStore.setState({ error: error instanceof Error ? error.message : "Spotify konnte nicht verbunden werden." }); }
  };
  return { ...state, login, play: playTape, pause: pauseTape, reconnect: connectPlayer, disconnect: disconnectPlayer };
}
