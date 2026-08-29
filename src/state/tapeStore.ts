import { create } from "zustand";
import {
  DEFAULT_BACKGROUND_ID,
  DEFAULT_DESIGN_ID,
  DEFAULT_TEXT_COLOR_ID,
  type BackgroundId,
  type DesignId,
  type TextColorId,
} from "../tapeOptions";
import type { SharedTape } from "../types";

type TapeState = {
  spotifyUrl: string;
  message: string;
  backgroundId: BackgroundId;
  designId: DesignId;
  textColorId: TextColorId;
  isPlaying: boolean;
  editorOpen: boolean;
  sharedMode: boolean;
  setSpotifyUrl: (value: string) => void;
  setMessage: (value: string) => void;
  setBackgroundId: (value: BackgroundId) => void;
  setDesignId: (value: DesignId) => void;
  setTextColorId: (value: TextColorId) => void;
  togglePlaying: () => void;
  setEditorOpen: (value: boolean) => void;
  hydrateSharedTape: (tape: SharedTape) => void;
};

export const useTapeStore = create<TapeState>((set) => ({
  spotifyUrl: "",
  message: "",
  backgroundId: DEFAULT_BACKGROUND_ID,
  designId: DEFAULT_DESIGN_ID,
  textColorId: DEFAULT_TEXT_COLOR_ID,
  isPlaying: false,
  editorOpen: true,
  sharedMode: false,
  setSpotifyUrl: (spotifyUrl) => set({ spotifyUrl, isPlaying: false }),
  setMessage: (message) => set({ message: message.slice(0, 180) }),
  setBackgroundId: (backgroundId) => set({ backgroundId }),
  setDesignId: (designId) => set({ designId }),
  setTextColorId: (textColorId) => set({ textColorId }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  hydrateSharedTape: (tape) => set({
    spotifyUrl: `https://open.spotify.com/track/${tape.spotifyTrackId}`,
    message: tape.message,
    backgroundId: tape.backgroundId,
    designId: tape.designId,
    textColorId: tape.textColorId,
    sharedMode: true,
    editorOpen: false,
    isPlaying: false,
  }),
}));
