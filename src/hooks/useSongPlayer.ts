import { useCallback, useEffect } from "react";
import { useTapeStore } from "../state/tapeStore";

export function useSongPlayer() {
  const playerState = useTapeStore((state) => state.playerState);
  const progress = useTapeStore((state) => state.progress);
  const durationMs = useTapeStore((state) => state.track.durationMs);
  const setPlayerState = useTapeStore((state) => state.setPlayerState);
  const setProgress = useTapeStore((state) => state.setProgress);

  useEffect(() => {
    if (playerState !== "playing") return;
    const interval = window.setInterval(() => {
      const current = useTapeStore.getState().progress;
      const next = current + 250 / durationMs;
      if (next >= 1) {
        setProgress(1);
        setPlayerState("paused");
      } else {
        setProgress(next);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [durationMs, playerState, setPlayerState, setProgress]);

  const toggle = useCallback(() => {
    if (playerState === "playing") {
      setPlayerState("paused");
      return;
    }

    if (progress >= 1) setProgress(0);
    setPlayerState("playing");
  }, [playerState, progress, setPlayerState, setProgress]);

  return {
    toggle,
    isPlaying: playerState === "playing",
  };
}
