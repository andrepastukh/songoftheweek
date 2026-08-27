import { create } from "zustand";
import { DEMO_TRACK } from "../constants";
import type { PlayerState, SharedTape, TapeColorId, TrackMetadata } from "../types";

type TapeState = {
  track: TrackMetadata;
  senderName: string;
  message: string;
  tapeColor: TapeColorId;
  playerState: PlayerState;
  progress: number;
  editorOpen: boolean;
  sharedMode: boolean;
  setTrack: (track: TrackMetadata) => void;
  setSenderName: (value: string) => void;
  setMessage: (value: string) => void;
  setTapeColor: (value: TapeColorId) => void;
  setPlayerState: (value: PlayerState) => void;
  setProgress: (value: number) => void;
  setEditorOpen: (value: boolean) => void;
  hydrateSharedTape: (tape: SharedTape) => void;
};

export const useTapeStore = create<TapeState>((set) => ({
  track: DEMO_TRACK,
  senderName: "André",
  message: "Für die späten Fahrten nach Hause.\nAb 01:14 wird’s richtig gut.",
  tapeColor: "tangerine",
  playerState: "idle",
  progress: 0.12,
  editorOpen: true,
  sharedMode: false,
  setTrack: (track) => set({ track, progress: 0, playerState: "idle" }),
  setSenderName: (senderName) => set({ senderName: senderName.slice(0, 30) }),
  setMessage: (message) => set({ message: message.slice(0, 180) }),
  setTapeColor: (tapeColor) => set({ tapeColor }),
  setPlayerState: (playerState) => set({ playerState }),
  setProgress: (progress) => set({ progress: Math.max(0, Math.min(progress, 1)) }),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  hydrateSharedTape: (tape) => set({
    track: {
      id: tape.spotifyTrackId,
      title: tape.title,
      artist: tape.artist,
      durationMs: tape.durationMs,
    },
    senderName: tape.senderName,
    message: tape.message,
    tapeColor: tape.tapeColor,
    sharedMode: true,
    editorOpen: false,
    progress: 0,
    playerState: "idle",
  }),
}));
