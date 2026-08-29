import type { CSSProperties } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { BACKGROUND_OPTIONS, DESIGN_OPTIONS, TEXT_COLOR_OPTIONS } from "../../tapeOptions";

export function Tape() {
  const isPlaying = useTapeStore((state) => state.isPlaying);
  const message = useTapeStore((state) => state.message).trim();
  const backgroundId = useTapeStore((state) => state.backgroundId);
  const designId = useTapeStore((state) => state.designId);
  const textColorId = useTapeStore((state) => state.textColorId);
  const background = BACKGROUND_OPTIONS.find((option) => option.id === backgroundId) ?? BACKGROUND_OPTIONS[0];
  const design = DESIGN_OPTIONS.find((option) => option.id === designId) ?? DESIGN_OPTIONS[0];
  const textColor = TEXT_COLOR_OPTIONS.find((option) => option.id === textColorId) ?? TEXT_COLOR_OPTIONS[0];
  const textSize = message.length > 140
    ? "1.35cqw"
    : message.length > 100
      ? "1.55cqw"
      : message.length > 60
        ? "1.75cqw"
        : message.length > 30
          ? "2.05cqw"
          : "2.35cqw";

  return (
    <figure
      className={`tape-stage ${isPlaying ? "is-playing" : ""}`}
      role="img"
      aria-label="Personalisierte Kassette"
    >
      <div className="tape-composition">
        <img
          className="tape-layer tape-shadow"
          src="/assets/tape/tape-shadow.webp"
          alt=""
          draggable={false}
        />
        <img
          className="tape-reel tape-reel--left"
          src="/assets/tape/reel-left.webp"
          alt=""
          draggable={false}
        />
        <img
          className="tape-reel tape-reel--right"
          src="/assets/tape/reel-right.webp"
          alt=""
          draggable={false}
        />
        <img
          className="tape-layer tape-shell"
          src="/assets/tape/tape-shell.webp"
          alt=""
          draggable={false}
        />
        <div className="tape-label-stack">
          <img
            className="tape-custom-layer tape-label-background"
            src={background.src}
            alt=""
            draggable={false}
          />
          <img
            className="tape-custom-layer tape-label-design"
            src={design.src}
            alt=""
            draggable={false}
          />
          <div
            className="tape-user-text"
            style={{
              "--tape-text-size": textSize,
              "--tape-text-color": textColorId === "white" ? "#f7f4ea" : "#292927",
            } as CSSProperties}
          >
            {message}
          </div>
          <img
            className="tape-custom-layer tape-label-text"
            src={textColor.sideTextSrc}
            alt=""
            draggable={false}
          />
          <img
            className="tape-custom-layer tape-label-text"
            src={textColor.bottomTextSrc}
            alt=""
            draggable={false}
          />
        </div>
        <div className="tape-grain" aria-hidden="true" />
      </div>
    </figure>
  );
}
