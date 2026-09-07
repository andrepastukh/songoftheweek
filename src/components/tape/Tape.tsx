import type { CSSProperties } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { useSpotifyStore } from "../../state/spotifyStore";
import { BACKGROUND_OPTIONS, DESIGN_OPTIONS, TEXT_COLOR_OPTIONS } from "../../tapeOptions";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export function Tape() {
  const isPlaying = useSpotifyStore((state) => state.isPlaying || state.isStarting || state.isPreviewPlaying);
  const message = useTapeStore((state) => state.message).trim();
  const backgroundId = useTapeStore((state) => state.backgroundId);
  const designId = useTapeStore((state) => state.designId);
  const textColorId = useTapeStore((state) => state.textColorId);
  const background = BACKGROUND_OPTIONS.find((option) => option.id === backgroundId) ?? BACKGROUND_OPTIONS[0];
  const design = DESIGN_OPTIONS.find((option) => option.id === designId) ?? DESIGN_OPTIONS[0];
  const textColor = TEXT_COLOR_OPTIONS.find((option) => option.id === textColorId) ?? TEXT_COLOR_OPTIONS[0];
  const textSize = message.length > 140
    ? "4.35cqw"
    : message.length > 100
      ? "4.55cqw"
      : message.length > 60
        ? "4.75cqw"
        : message.length > 30
          ? "4.05cqw"
          : "4.35cqw";

  return (
    <figure
      className={`tape-stage ${isPlaying ? "is-playing" : ""}`}
      role="img"
      aria-label="Personalisierte Kassette"
    >
      <div className="tape-composition">
        <img
          className="tape-layer tape-shadow"
          src={asset("/assets/tape/tape-shadow.webp")}
          alt=""
          draggable={false}
        />
        <img
          className="tape-reel tape-reel--left"
          src={asset("/assets/tape/reel-left.webp")}
          alt=""
          draggable={false}
        />
        <img
          className="tape-reel tape-reel--right"
          src={asset("/assets/tape/reel-right.webp")}
          alt=""
          draggable={false}
        />
        <img
          className="tape-layer tape-shell"
          src={asset("/assets/tape/tape-shell.webp")}
          alt=""
          draggable={false}
        />
        <div className="tape-label-stack">
          <img
            className="tape-custom-layer tape-label-background"
            src={asset(background.src)}
            alt=""
            draggable={false}
          />
          <img
            className="tape-custom-layer tape-label-design"
            src={asset(design.src)}
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
            src={asset(textColor.sideTextSrc)}
            alt=""
            draggable={false}
          />
          <img
            className="tape-custom-layer tape-label-text"
            src={asset(textColor.bottomTextSrc)}
            alt=""
            draggable={false}
          />
        </div>
        <div className="tape-grain" aria-hidden="true" />
      </div>
    </figure>
  );
}
