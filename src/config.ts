const configuredDelay = Number(import.meta.env.VITE_SPOTIFY_PLAYBACK_DELAY_MS ?? 900);
export const SPOTIFY_PLAYBACK_DELAY_MS = Number.isFinite(configuredDelay)
  ? Math.min(5000, Math.max(0, configuredDelay)) : 900;
export const CASSETTE_START_SOUND_URL = import.meta.env.VITE_CASSETTE_START_SOUND_URL?.trim() || "";
export const SPOTIFY_SCOPES = ["streaming", "user-read-email", "user-read-private", "user-read-playback-state", "user-modify-playback-state"];
