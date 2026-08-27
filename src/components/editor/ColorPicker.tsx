import { Check } from "lucide-react";
import { TAPE_COLORS } from "../../constants";
import { useTapeStore } from "../../state/tapeStore";

export function ColorPicker() {
  const tapeColor = useTapeStore((state) => state.tapeColor);
  const setTapeColor = useTapeStore((state) => state.setTapeColor);

  return (
    <div className="color-picker" role="radiogroup" aria-label="Kassettenfarbe">
      {TAPE_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          className={`color-swatch ${tapeColor === color.id ? "is-selected" : ""}`}
          style={{ "--swatch": color.shell, "--swatch-shadow": color.shadow } as React.CSSProperties}
          onClick={() => setTapeColor(color.id)}
          role="radio"
          aria-checked={tapeColor === color.id}
          aria-label={color.label}
          title={color.label}
        >
          {tapeColor === color.id && <Check size={14} strokeWidth={2.2} />}
        </button>
      ))}
    </div>
  );
}
