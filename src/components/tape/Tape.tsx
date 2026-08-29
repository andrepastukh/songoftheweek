import type { CSSProperties } from "react";
import { useTapeStore } from "../../state/tapeStore";

export function Tape() {
  const isPlaying = useTapeStore((state) => state.isPlaying);
  const message = useTapeStore((state) => state.message).trim();
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
            className="tape-layer tape-label-surface"
            src="/assets/tape/label-surface.webp"
            alt=""
            draggable={false}
          />
          <div
            className="tape-user-text"
            style={{ "--tape-text-size": textSize } as CSSProperties}
          >
            {message}
          </div>
          <img
            className="tape-layer tape-label-artwork"
            src="/assets/tape/label-artwork.webp"
            alt=""
            draggable={false}
          />
        </div>
        <div className="tape-grain" aria-hidden="true" />
      </div>
    </figure>
  );
}
