import { X } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";
import {
  BACKGROUND_OPTIONS,
  DESIGN_OPTIONS,
  PAGE_BACKGROUND_OPTIONS,
  TAPE_SHELL_OPTIONS,
  TEXT_COLOR_OPTIONS,
  type BackgroundId,
  type DesignId,
  type PageBackgroundId,
  type TapeShellId,
  type TextColorId,
} from "../../tapeOptions";
import { ShareButton } from "./ShareButton";
import { SpotifyInput } from "./SpotifyInput";

export function TapeEditor() {
  const message = useTapeStore((state) => state.message);
  const tapeShellId = useTapeStore((state) => state.tapeShellId);
  const backgroundId = useTapeStore((state) => state.backgroundId);
  const backgroundColor = useTapeStore((state) => state.backgroundColor);
  const designId = useTapeStore((state) => state.designId);
  const textColorId = useTapeStore((state) => state.textColorId);
  const pageBackgroundId = useTapeStore((state) => state.pageBackgroundId);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setMessage = useTapeStore((state) => state.setMessage);
  const setTapeShellId = useTapeStore((state) => state.setTapeShellId);
  const setBackgroundId = useTapeStore((state) => state.setBackgroundId);
  const setBackgroundColor = useTapeStore((state) => state.setBackgroundColor);
  const setDesignId = useTapeStore((state) => state.setDesignId);
  const setTextColorId = useTapeStore((state) => state.setTextColorId);
  const setPageBackgroundId = useTapeStore((state) => state.setPageBackgroundId);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);
  const selectedBackground = BACKGROUND_OPTIONS.find((option) => option.id === backgroundId) ?? BACKGROUND_OPTIONS[0];
  const displayedBackgroundColor = backgroundColor ?? selectedBackground.color;

  return (
    <aside
      className="editor-panel"
      aria-label="Kassette gestalten"
    >
      <div className="editor-topline">
        <div>
          <span className="eyebrow">{sharedMode ? "DIESE KASSETTE" : "DEINE KASSETTE"}</span>
          <h2>{sharedMode ? "Für dich." : "Make it yours."}</h2>
        </div>
        <button className="icon-button close-editor" type="button" onClick={() => setEditorOpen(false)} aria-label="Editor schließen">
          <X size={18} />
        </button>
      </div>

      <div className="editor-section">
        <label>Song</label>
        <SpotifyInput />
      </div>

      <div className="editor-section">
        <label>Artwork</label>
        <div className="tape-option-list">
          <label className="tape-option">
            <span>Kassette</span>
            <select value={tapeShellId} onChange={(event) => setTapeShellId(event.target.value as TapeShellId)}>
              {TAPE_SHELL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="tape-option">
            <span>Hintergrund</span>
            <select value={backgroundId} onChange={(event) => setBackgroundId(event.target.value as BackgroundId)}>
              {BACKGROUND_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className={`tape-option tape-color-option ${backgroundColor ? "is-active" : ""}`}>
            <span>Eigene Farbe</span>
            <span className="tape-color-control">
              <input
                type="color"
                value={displayedBackgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                aria-label="Eigene Hintergrundfarbe auswählen"
              />
              <output>{displayedBackgroundColor.toUpperCase()}</output>
            </span>
          </label>

          <label className="tape-option">
            <span>Design</span>
            <select value={designId} onChange={(event) => setDesignId(event.target.value as DesignId)}>
              {DESIGN_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="tape-option">
            <span>Textfarbe</span>
            <select value={textColorId} onChange={(event) => setTextColorId(event.target.value as TextColorId)}>
              {TEXT_COLOR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="tape-option">
            <span>Seitenfarbe</span>
            <select value={pageBackgroundId} onChange={(event) => setPageBackgroundId(event.target.value as PageBackgroundId)}>
              {PAGE_BACKGROUND_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="editor-section">
        <label htmlFor="message">Tape text</label>
        <div className="text-input-wrap text-input-wrap--area">
          <textarea id="message" value={message} maxLength={180} onChange={(event) => setMessage(event.target.value)} placeholder="Text auf der Kassette …" rows={4} />
          <span>{message.length}/180</span>
        </div>
      </div>

      <ShareButton />
    </aside>
  );
}
