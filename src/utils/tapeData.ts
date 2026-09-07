import type { TapeDesign } from "../types";
import { isBackgroundId, isDesignId, isTextColorId } from "../tapeOptions";
import { isSpotifyTrackId, parseSpotifyTrackId } from "./spotifyUrl";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseTapeDesign(value: unknown): TapeDesign {
  if (!isRecord(value) || typeof value.spotifyTrackId !== "string" ||
    !isSpotifyTrackId(value.spotifyTrackId) || typeof value.message !== "string" ||
    value.message.length > 180 || !isBackgroundId(value.backgroundId) ||
    !isDesignId(value.designId) || !isTextColorId(value.textColorId)) {
    throw new Error("Bitte Song, Nachricht und Kassettendesign überprüfen.");
  }
  return {
    spotifyTrackId: value.spotifyTrackId, message: value.message,
    backgroundId: value.backgroundId, designId: value.designId, textColorId: value.textColorId,
  };
}

// Explicit projection: UI flags, IDs of previous shares and tokens never leave the editor.
export function serializeTape(value: Omit<TapeDesign, "spotifyTrackId"> & { spotifyUrl: string }): TapeDesign {
  return parseTapeDesign({ ...value, spotifyTrackId: parseSpotifyTrackId(value.spotifyUrl) });
}

export function hydrateTape(tape: TapeDesign) {
  const { spotifyTrackId, ...design } = parseTapeDesign(tape);
  return {
    ...design, spotifyUrl: `https://open.spotify.com/track/${spotifyTrackId}`,
    sharedMode: true, editorOpen: false,
  };
}
