import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { type CSSProperties, useLayoutEffect, useState } from "react";
import { PlayButton } from "../components/player/PlayButton";
import { Tape } from "../components/tape/Tape";
import { TapeEditor } from "../components/editor/TapeEditor";
import { AppHeader } from "../components/layout/AppHeader";
import { useTapeStore } from "../state/tapeStore";
import { tapeFromHash } from "../utils/shareState";
import { SpotifyTrackInfo } from "../components/player/SpotifyTrackInfo";
import { resetPlayback } from "../services/spotifyPlayer";
import { PAGE_BACKGROUND_OPTIONS } from "../tapeOptions";

export function App({ initialDraft, authNotice }: { initialDraft?: unknown; authNotice?: string }) {
  const editorOpen = useTapeStore((state) => state.editorOpen);
  const sharedMode = useTapeStore((state) => state.sharedMode);
  const setEditorOpen = useTapeStore((state) => state.setEditorOpen);
  const hydrateSharedTape = useTapeStore((state) => state.hydrateSharedTape);
  const pageBackgroundId = useTapeStore((state) => state.pageBackgroundId);
  const [linkError, setLinkError] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pageBackground = PAGE_BACKGROUND_OPTIONS.find((option) => option.id === pageBackgroundId) ?? PAGE_BACKGROUND_OPTIONS[0];
  const pageStyle = {
    "--page-background": pageBackground.color,
    "--halftone-ink": pageBackground.halftone,
  } as CSSProperties;

  useLayoutEffect(() => {
    let firstLoad = true;
    const loadTapeFromUrl = () => {
      resetPlayback();
      const route = tapeFromHash();
      setLinkError(route.corrupted);
      if (route.tape) hydrateSharedTape(route.tape);
      else if (!route.corrupted) useTapeStore.setState({ sharedMode: false });
      if (firstLoad && initialDraft) useTapeStore.getState().restoreDraft(initialDraft);
      firstLoad = false;
      setIsHydrated(true);
    };

    loadTapeFromUrl();
    window.addEventListener("hashchange", loadTapeFromUrl);
    return () => window.removeEventListener("hashchange", loadTapeFromUrl);
  }, [hydrateSharedTape, initialDraft]);

  return (
    <main className={`app-shell ${sharedMode ? "shared-mode" : "create-mode"}`} style={pageStyle}>
      <div className="paper-grain" aria-hidden="true" />
      <AppHeader />
      {authNotice && <div className="auth-notice" role="status">{authNotice}</div>}

      {linkError && (
        <div className="route-error" role="status">
          <AlertTriangle size={16} /> Dieser Tape-Link ist unvollständig oder beschädigt.
          <a href={import.meta.env.BASE_URL}>Neue Kassette erstellen</a>
        </div>
      )}

      {!isHydrated && <p className="route-error" role="status">Kassette wird geladen …</p>}
      {isHydrated && !linkError && <div className={`experience-grid ${editorOpen ? "has-editor" : "editor-closed"}`}>
        <section className="hero-zone" aria-label="Song der Woche">
          <div className="tape-anchor">
            <div className="hero-kicker">A LITTLE SOMETHING FOR YOU</div>
            <Tape />
          </div>
          <div className="player-dock">
            <div className="spotify-track-slot"><SpotifyTrackInfo /></div>
            <PlayButton />
          </div>
        </section>

        {editorOpen && <TapeEditor />}
      </div>}

      {isHydrated && !linkError && !editorOpen && (
        <button
          className="editor-peek"
          type="button"
          onClick={() => setEditorOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>{sharedMode ? "EIGENE VERSION GESTALTEN" : "CUSTOMIZE"}</span>
        </button>
      )}

      <footer className="app-footer">
        <span>Made with ❤ for the music</span>
        <span>V 1.0.0</span>
      </footer>
    </main>
  );
}
