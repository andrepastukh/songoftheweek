import { create } from "zustand";
import {
  DEFAULT_BACKGROUND_ID,
  DEFAULT_DESIGN_ID,
  DEFAULT_TEXT_COLOR_ID,
  type BackgroundId,
  type DesignId,
  type TextColorId,
} from "../tapeOptions";
import type { TapeDesign } from "../types";
import { hydrateTape, isRecord } from "../utils/tapeData";
import { isBackgroundId, isDesignId, isTextColorId } from "../tapeOptions";

type TapeState = {
  spotifyUrl: string;
  message: string;
  backgroundId: BackgroundId;
  designId: DesignId;
  textColorId: TextColorId;
  editorOpen: boolean;
  sharedMode: boolean;
  setSpotifyUrl: (value: string) => void;
  setMessage: (value: string) => void;
  setBackgroundId: (value: BackgroundId) => void;
  setDesignId: (value: DesignId) => void;
  setTextColorId: (value: TextColorId) => void;
  setEditorOpen: (value: boolean) => void;
  hydrateSharedTape: (tape: TapeDesign) => void;
  restoreDraft: (draft: unknown) => void;
};

export const useTapeStore = create<TapeState>((set) => ({
  spotifyUrl: "",
  message: "",
  backgroundId: DEFAULT_BACKGROUND_ID,
  designId: DEFAULT_DESIGN_ID,
  textColorId: DEFAULT_TEXT_COLOR_ID,
  editorOpen: true,
  sharedMode: false,
  setSpotifyUrl: (spotifyUrl) => set({ spotifyUrl: spotifyUrl.slice(0, 2048) }),
  setMessage: (message) => set({ message: message.slice(0, 180) }),
  setBackgroundId: (backgroundId) => set({ backgroundId }),
  setDesignId: (designId) => set({ designId }),
  setTextColorId: (textColorId) => set({ textColorId }),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  hydrateSharedTape: (tape) => set(hydrateTape(tape)),
  restoreDraft: (draft) => {
    if (!isRecord(draft) || typeof draft.spotifyUrl !== "string" || draft.spotifyUrl.length > 2048 ||
      typeof draft.message !== "string" || draft.message.length > 180 || !isBackgroundId(draft.backgroundId) ||
      !isDesignId(draft.designId) || !isTextColorId(draft.textColorId) ||
      typeof draft.editorOpen !== "boolean" || typeof draft.sharedMode !== "boolean") return;
    set({ spotifyUrl: draft.spotifyUrl, message: draft.message, backgroundId: draft.backgroundId,
      designId: draft.designId, textColorId: draft.textColorId, editorOpen: draft.editorOpen, sharedMode: draft.sharedMode });
  },
}));
