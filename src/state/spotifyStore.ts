import { create } from "zustand";

type SpotifyState = {
  isConnected: boolean;
  isReady: boolean;
  isConnecting: boolean;
  isPlaying: boolean;
  isStarting: boolean;
  isPreviewPlaying: boolean;
  isDemoMode: boolean;
  error: string;
  notice: string;
};

export const useSpotifyStore = create<SpotifyState>(() => ({
  isConnected: false, isReady: false, isConnecting: false,
  isPlaying: false, isStarting: false, isPreviewPlaying: false, isDemoMode: false, error: "", notice: "",
}));
