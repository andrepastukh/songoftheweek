import { Pause, Play } from "lucide-react";
import { useSongPlayer } from "../../hooks/useSongPlayer";
import { useTapeStore } from "../../state/tapeStore";

export function PlayButton() {
  const playerState = useTapeStore((state) => state.playerState);
  const { toggle, isPlaying } = useSongPlayer();
  const label = isPlaying ? "Song pausieren" : "Song abspielen";

  return (
    <div className="transport-wrap">
      <button className={`transport-button state-${playerState}`} onClick={toggle} aria-label={label}>
        <span className="transport-button__top">
          {isPlaying ? <Pause size={20} strokeWidth={1.7} fill="currentColor" /> : <Play size={20} strokeWidth={1.7} fill="currentColor" />}
        </span>
      </button>
      <span className="transport-label">{isPlaying ? "playing" : "press play"}</span>
    </div>
  );
}
