import { Pause, Play } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";
import { useCassettePlayer } from "../../hooks/useCassettePlayer";

export function PlayButton() {
  const playerState = useTapeStore((state) => state.playerState);
  const { toggle, isPlaying, isBusy } = useCassettePlayer();
  const label = isPlaying ? "Kassette pausieren" : "Kassette abspielen";

  return (
    <div className="transport-wrap">
      <button className={`transport-button state-${playerState}`} onClick={toggle} disabled={isBusy} aria-label={label}>
        <span className="transport-button__top">
          {isPlaying ? <Pause size={20} strokeWidth={1.7} fill="currentColor" /> : <Play size={20} strokeWidth={1.7} fill="currentColor" />}
        </span>
      </button>
      <span className="transport-label">{playerState === "starting" ? "läuft an" : isPlaying ? "playing" : "press play"}</span>
    </div>
  );
}
