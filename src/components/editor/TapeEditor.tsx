import { X } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";
import { ShareButton } from "./ShareButton";
import { SpotifyInput } from "./SpotifyInput";

export function TapeEditor() {
  const message = useTapeStore((state) => state.message);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setMessage = useTapeStore((state) => state.setMessage);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);

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
