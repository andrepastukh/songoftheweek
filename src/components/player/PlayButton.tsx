import { Pause, Play } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";

export function PlayButton() {
  const isPlaying = useTapeStore((state) => state.isPlaying);
  const togglePlaying = useTapeStore((state) => state.togglePlaying);
  const label = isPlaying ? "Spulenanimation pausieren" : "Spulenanimation starten";

  return (
    <div className="transport-wrap">
      <button
        className={`transport-button ${isPlaying ? "is-playing" : ""}`}
        type="button"
        onClick={togglePlaying}
        aria-label={label}
      >
        <span className="transport-button__top">
          {isPlaying ? <Pause size={20} strokeWidth={1.7} fill="currentColor" /> : <Play size={20} strokeWidth={1.7} fill="currentColor" />}
        </span>
      </button>
      <span className="transport-label">{isPlaying ? "playing" : "press play"}</span>
    </div>
  );
}
