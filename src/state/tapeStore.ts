import { create } from "zustand";
import type { SharedTape } from "../types";

type TapeState = {
  spotifyUrl: string;
  message: string;
  isPlaying: boolean;
  editorOpen: boolean;
  sharedMode: boolean;
  setSpotifyUrl: (value: string) => void;
  setMessage: (value: string) => void;
  togglePlaying: () => void;
  setEditorOpen: (value: boolean) => void;
  hydrateSharedTape: (tape: SharedTape) => void;
};

export const useTapeStore = create<TapeState>((set) => ({
  spotifyUrl: "",
  message: "",
  isPlaying: false,
  editorOpen: true,
  sharedMode: false,
  setSpotifyUrl: (spotifyUrl) => set({ spotifyUrl, isPlaying: false }),
  setMessage: (message) => set({ message: message.slice(0, 180) }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  hydrateSharedTape: (tape) => set({
    spotifyUrl: `https://open.spotify.com/track/${tape.spotifyTrackId}`,
    message: tape.message,
    sharedMode: true,
    editorOpen: false,
    isPlaying: false,
  }),
}));
