import type { SharedTape } from "../types";
import {
  DEFAULT_BACKGROUND_ID,
  DEFAULT_DESIGN_ID,
  DEFAULT_TEXT_COLOR_ID,
  isBackgroundId,
  isDesignId,
  isTextColorId,
} from "../tapeOptions";
import { isSpotifyTrackId } from "./spotifyUrl";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodeTape(tape: SharedTape): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(tape)));
}

export function decodeTape(value: string): SharedTape | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as Partial<SharedTape>;
    if (
      typeof parsed.message !== "string" ||
      typeof parsed.spotifyTrackId !== "string" ||
      !isSpotifyTrackId(parsed.spotifyTrackId)
    ) return null;

    return {
      spotifyTrackId: parsed.spotifyTrackId.slice(0, 64),
      message: parsed.message.slice(0, 180),
      backgroundId: isBackgroundId(parsed.backgroundId) ? parsed.backgroundId : DEFAULT_BACKGROUND_ID,
      designId: isDesignId(parsed.designId) ? parsed.designId : DEFAULT_DESIGN_ID,
      textColorId: isTextColorId(parsed.textColorId) ? parsed.textColorId : DEFAULT_TEXT_COLOR_ID,
    };
  } catch {
    return null;
  }
}

export function tapeFromHash(): { tape: SharedTape | null; corrupted: boolean } {
  const match = window.location.hash.match(/^#\/tape\/([^/]+)$/);
  if (!match) return { tape: null, corrupted: false };
  const tape = decodeTape(match[1]);
  return { tape, corrupted: tape === null };
}
