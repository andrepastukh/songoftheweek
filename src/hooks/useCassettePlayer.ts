import { useCallback, useEffect, useRef } from "react";
import { useTapeStore } from "../state/tapeStore";
import { playMechanicalSound } from "../audio/tapeSound";

export function useCassettePlayer() {
  const playerState = useTapeStore((state) => state.playerState);
  const progress = useTapeStore((state) => state.progress);
  const durationMs = useTapeStore((state) => state.track.durationMs);
  const setPlayerState = useTapeStore((state) => state.setPlayerState);
  const setProgress = useTapeStore((state) => state.setProgress);
  const transitionTimer = useRef<number | null>(null);

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

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  const toggle = useCallback(() => {
    if (playerState === "starting" || playerState === "pausing") return;
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);

    if (playerState === "playing") {
      setPlayerState("pausing");
      playMechanicalSound("stop");
      transitionTimer.current = window.setTimeout(() => setPlayerState("paused"), 360);
      return;
    }

    if (progress >= 1) setProgress(0);
    setPlayerState("starting");
    playMechanicalSound("start");
    transitionTimer.current = window.setTimeout(() => setPlayerState("playing"), 820);
  }, [playerState, progress, setPlayerState, setProgress]);

  return {
    toggle,
    isPlaying: playerState === "playing",
    isBusy: playerState === "starting" || playerState === "pausing",
  };
}
