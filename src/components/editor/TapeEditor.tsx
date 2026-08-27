import { X } from "lucide-react";
import { motion } from "motion/react";
import { useTapeStore } from "../../state/tapeStore";
import { ShareButton } from "./ShareButton";
import { SpotifyInput } from "./SpotifyInput";

export function TapeEditor() {
  const senderName = useTapeStore((state) => state.senderName);
  const message = useTapeStore((state) => state.message);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setSenderName = useTapeStore((state) => state.setSenderName);
  const setMessage = useTapeStore((state) => state.setMessage);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);

  return (
    <motion.aside
      className="editor-panel"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Kassette gestalten"
    >
      <div className="editor-topline">
        <div>
          <span className="eyebrow">{sharedMode ? "DIESE KASSETTE" : "DEIN MIXTAPE"}</span>
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

      <div className="editor-row">
        <div className="editor-section compact">
          <label htmlFor="sender">From</label>
          <div className="text-input-wrap">
            <input id="sender" value={senderName} maxLength={30} onChange={(event) => setSenderName(event.target.value)} placeholder="Dein Name" />
            <span>{senderName.length}/30</span>
          </div>
        </div>
      </div>

      <div className="editor-section">
        <label htmlFor="message">Note</label>
        <div className="text-input-wrap text-input-wrap--area">
          <textarea id="message" value={message} maxLength={180} onChange={(event) => setMessage(event.target.value)} placeholder="Schreib etwas Persönliches …" rows={4} />
          <span>{message.length}/180</span>
        </div>
      </div>

      <ShareButton />
    </motion.aside>
  );
}
