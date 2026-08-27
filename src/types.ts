export type TapeColorId =
  | "butter"
  | "tangerine"
  | "brick"
  | "moss"
  | "ocean"
  | "lilac"
  | "graphite";

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
  tapeColor: TapeColorId;
  createdAt?: string;
};

export type PlayerState = "idle" | "starting" | "playing" | "pausing" | "paused" | "error";
