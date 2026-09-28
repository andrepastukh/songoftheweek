import type { TapeDesign } from "../types";
import { DEFAULT_PAGE_BACKGROUND_COLOR, DEFAULT_TAPE_SHELL_ID, DEFAULT_TEXT_FONT_ID, isBackgroundId, isDesignId, isPageBackgroundId, isTapeShellId, isTextColorId, isTextFontId, PAGE_BACKGROUND_OPTIONS } from "../tapeOptions";
import { isSpotifyTrackId, parseSpotifyTrackId } from "./spotifyUrl";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBackgroundColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function parseTapeDesign(value: unknown): TapeDesign {
  if (!isRecord(value) || typeof value.spotifyTrackId !== "string" ||
    !isSpotifyTrackId(value.spotifyTrackId) || typeof value.message !== "string" ||
    value.message.length > 180 || !isBackgroundId(value.backgroundId) ||
    (value.tapeShellId !== undefined && !isTapeShellId(value.tapeShellId)) ||
    (value.backgroundColor !== undefined && value.backgroundColor !== null && !isBackgroundColor(value.backgroundColor)) ||
    !isDesignId(value.designId) || !isTextColorId(value.textColorId) ||
    (value.textFontId !== undefined && !isTextFontId(value.textFontId)) ||
    (value.pageBackgroundColor !== undefined && !isBackgroundColor(value.pageBackgroundColor)) ||
    (value.pageBackgroundColor === undefined && value.pageBackgroundId !== undefined && !isPageBackgroundId(value.pageBackgroundId))) {
    throw new Error("Bitte Song, Nachricht und Kassettendesign überprüfen.");
  }
  return {
    spotifyTrackId: value.spotifyTrackId, message: value.message,
    tapeShellId: isTapeShellId(value.tapeShellId) ? value.tapeShellId : DEFAULT_TAPE_SHELL_ID,
    backgroundId: value.backgroundId,
    backgroundColor: isBackgroundColor(value.backgroundColor) ? value.backgroundColor.toLowerCase() : null,
    designId: value.designId, textColorId: value.textColorId,
    textFontId: isTextFontId(value.textFontId) ? value.textFontId : DEFAULT_TEXT_FONT_ID,
    pageBackgroundColor: isBackgroundColor(value.pageBackgroundColor)
      ? value.pageBackgroundColor.toLowerCase()
      : PAGE_BACKGROUND_OPTIONS.find((option) => option.id === value.pageBackgroundId)?.color ?? DEFAULT_PAGE_BACKGROUND_COLOR,
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
