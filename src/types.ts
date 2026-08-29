export type TrackMetadata = {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  spotifyUrl?: string;
};

export type SharedTape = {
  spotifyTrackId: string;
  title: string;
  artist: string;
  durationMs: number;
  senderName: string;
  message: string;
  createdAt?: string;
};

export type PlayerState = "idle" | "playing" | "paused" | "error";
