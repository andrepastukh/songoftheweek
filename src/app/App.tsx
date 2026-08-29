import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { PlayButton } from "../components/player/PlayButton";
import { Tape } from "../components/tape/Tape";
import { TapeEditor } from "../components/editor/TapeEditor";
import { AppHeader } from "../components/layout/AppHeader";
import { useTapeStore } from "../state/tapeStore";
import { tapeFromHash } from "../utils/shareState";

export function App() {
  const editorOpen = useTapeStore((state) => state.editorOpen);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);
  const hydrateSharedTape = useTapeStore((state) => state.hydrateSharedTape);
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    const loadTapeFromUrl = () => {
      const route = tapeFromHash();
      setLinkError(route.corrupted);
      if (route.tape) hydrateSharedTape(route.tape);
    };

    loadTapeFromUrl();
    window.addEventListener("hashchange", loadTapeFromUrl);
    return () => window.removeEventListener("hashchange", loadTapeFromUrl);
  }, [hydrateSharedTape]);

  return (
    <main className={`app-shell ${sharedMode ? "shared-mode" : "create-mode"}`}>
      <div className="paper-grain" aria-hidden="true" />
      <AppHeader />

      {linkError && (
        <div className="route-error" role="status">
          <AlertTriangle size={16} /> Dieser Tape-Link ist beschädigt. Du kannst eine neue Kassette erstellen.
        </div>
      )}

      <div className={`experience-grid ${editorOpen ? "has-editor" : "editor-closed"}`}>
        <section className="hero-zone" aria-label="Song der Woche">
          <div className="hero-kicker">A LITTLE SOMETHING FOR YOUR EARS</div>
          <Tape />
          <PlayButton />
          <div className="hero-caption" aria-hidden="true">
            <span>A</span>
            <span className="caption-line" />
            <span>60 MIN</span>
          </div>
        </section>

        {editorOpen && <TapeEditor />}
      </div>

      {!editorOpen && (
        <button
          className="editor-peek"
          type="button"
          onClick={() => setEditorOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>{sharedMode ? "ABOUT THIS TAPE" : "CUSTOMIZE"}</span>
        </button>
      )}

      <footer className="app-footer">
        <span>Made with ❤ for the music</span>
        <span>V 1.0.0</span>
      </footer>
    </main>
  );
}
