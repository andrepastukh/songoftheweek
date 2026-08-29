import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo } from "react";
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
  const initialRoute = useMemo(() => tapeFromHash(), []);

  useLayoutEffect(() => {
    if (initialRoute.tape) hydrateSharedTape(initialRoute.tape);
  }, [hydrateSharedTape, initialRoute]);

  useEffect(() => {
    const handleHashChange = () => {
      const route = tapeFromHash();
      if (route.tape) hydrateSharedTape(route.tape);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [hydrateSharedTape]);

  return (
    <main className={`app-shell ${sharedMode ? "shared-mode" : "create-mode"}`}>
      <div className="paper-grain" aria-hidden="true" />
      <AppHeader />

      {initialRoute.corrupted && (
        <div className="route-error" role="status">
          <AlertTriangle size={16} /> Dieser Tape-Link ist beschädigt. Wir zeigen dir stattdessen eine Demo.
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

        <AnimatePresence>{editorOpen && <TapeEditor />}</AnimatePresence>
      </div>

      {!editorOpen && (
        <motion.button
          className="editor-peek"
          type="button"
          onClick={() => setEditorOpen(true)}
          initial={{ x: 60 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
        >
          <SlidersHorizontal size={16} />
          <span>{sharedMode ? "ABOUT THIS TAPE" : "CUSTOMIZE"}</span>
        </motion.button>
      )}

      <footer className="app-footer">
        <span>Made with ❤ for the music</span>
        <span>V 1.0.0</span>
      </footer>
    </main>
  );
}
