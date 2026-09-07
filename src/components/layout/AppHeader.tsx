import { Menu, SlidersHorizontal } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";

export function AppHeader() {
  const editorOpen = useTapeStore((state) => state.editorOpen);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);

  return (
    <header className="app-header">
      <a className="wordmark" href="#" aria-label="Side A – Startseite">
        <span className="brand-mark" aria-hidden="true">
          <img src="/brand/side-a-logo-transparent.png" alt="" />
        </span>
        <span>SIDE A</span>
      </a>
      <div className="header-edition">{new Date().getDate()} - {new Date().getMonth() + 1} - {new Date().getFullYear()}</div>
      {!editorOpen && (
        <button className="header-menu" type="button" onClick={() => setEditorOpen(true)} aria-label="Editor öffnen">
          {sharedMode ? <Menu size={18} /> : <SlidersHorizontal size={17} />}
          <span>{sharedMode ? "Info" : "Customize"}</span>
        </button>
      )}
    </header>
  );
}
