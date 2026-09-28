import { create } from "zustand";
import {
  DEFAULT_BACKGROUND_ID,
  DEFAULT_DESIGN_ID,
  DEFAULT_PAGE_BACKGROUND_ID,
  DEFAULT_TAPE_SHELL_ID,
  DEFAULT_TEXT_COLOR_ID,
  type BackgroundId,
  type DesignId,
  type PageBackgroundId,
  type TapeShellId,
  type TextColorId,
} from "../tapeOptions";
import type { TapeDesign } from "../types";
import { hydrateTape, isBackgroundColor, isRecord } from "../utils/tapeData";
import { isBackgroundId, isDesignId, isPageBackgroundId, isTapeShellId, isTextColorId } from "../tapeOptions";

type TapeState = {
  spotifyUrl: string;
  message: string;
  tapeShellId: TapeShellId;
  backgroundId: BackgroundId;
  backgroundColor: string | null;
  designId: DesignId;
  textColorId: TextColorId;
  pageBackgroundId: PageBackgroundId;
  editorOpen: boolean;
  sharedMode: boolean;
  setSpotifyUrl: (value: string) => void;
  setMessage: (value: string) => void;
  setTapeShellId: (value: TapeShellId) => void;
  setBackgroundId: (value: BackgroundId) => void;
  setBackgroundColor: (value: string) => void;
  setDesignId: (value: DesignId) => void;
  setTextColorId: (value: TextColorId) => void;
  setPageBackgroundId: (value: PageBackgroundId) => void;
  setEditorOpen: (value: boolean) => void;
  hydrateSharedTape: (tape: TapeDesign) => void;
  restoreDraft: (draft: unknown) => void;
};

export const useTapeStore = create<TapeState>((set) => ({
  spotifyUrl: "",
  message: "",
  tapeShellId: DEFAULT_TAPE_SHELL_ID,
  backgroundId: DEFAULT_BACKGROUND_ID,
  backgroundColor: null,
  designId: DEFAULT_DESIGN_ID,
  textColorId: DEFAULT_TEXT_COLOR_ID,
  pageBackgroundId: DEFAULT_PAGE_BACKGROUND_ID,
  editorOpen: true,
  sharedMode: false,
  setSpotifyUrl: (spotifyUrl) => set({ spotifyUrl: spotifyUrl.slice(0, 2048) }),
  setMessage: (message) => set({ message: message.slice(0, 180) }),
  setTapeShellId: (tapeShellId) => set({ tapeShellId }),
  setBackgroundId: (backgroundId) => set({ backgroundId, backgroundColor: null }),
  setBackgroundColor: (backgroundColor) => {
    if (isBackgroundColor(backgroundColor)) set({ backgroundColor: backgroundColor.toLowerCase() });
  },
  setDesignId: (designId) => set({ designId }),
  setTextColorId: (textColorId) => set({ textColorId }),
  setPageBackgroundId: (pageBackgroundId) => set({ pageBackgroundId }),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  hydrateSharedTape: (tape) => set(hydrateTape(tape)),
  restoreDraft: (draft) => {
    if (!isRecord(draft) || typeof draft.spotifyUrl !== "string" || draft.spotifyUrl.length > 2048 ||
      typeof draft.message !== "string" || draft.message.length > 180 || !isBackgroundId(draft.backgroundId) ||
      (draft.tapeShellId !== undefined && !isTapeShellId(draft.tapeShellId)) ||
      (draft.backgroundColor !== undefined && draft.backgroundColor !== null && !isBackgroundColor(draft.backgroundColor)) ||
      !isDesignId(draft.designId) || !isTextColorId(draft.textColorId) ||
      (draft.pageBackgroundId !== undefined && !isPageBackgroundId(draft.pageBackgroundId)) ||
      typeof draft.editorOpen !== "boolean" || typeof draft.sharedMode !== "boolean") return;
    set({ spotifyUrl: draft.spotifyUrl, message: draft.message,
      tapeShellId: isTapeShellId(draft.tapeShellId) ? draft.tapeShellId : DEFAULT_TAPE_SHELL_ID,
      backgroundId: draft.backgroundId,
      backgroundColor: isBackgroundColor(draft.backgroundColor) ? draft.backgroundColor.toLowerCase() : null,
      designId: draft.designId, textColorId: draft.textColorId,
      pageBackgroundId: isPageBackgroundId(draft.pageBackgroundId) ? draft.pageBackgroundId : DEFAULT_PAGE_BACKGROUND_ID,
      editorOpen: draft.editorOpen, sharedMode: draft.sharedMode });
  },
}));
