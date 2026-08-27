import type { SharedTape, TapeColorId } from "../types";
import { TAPE_COLORS } from "../constants";

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
    const validColor = TAPE_COLORS.some(({ id }) => id === parsed.tapeColor);
    if (
      typeof parsed.title !== "string" ||
      typeof parsed.artist !== "string" ||
      typeof parsed.senderName !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.spotifyTrackId !== "string" ||
      typeof parsed.durationMs !== "number" ||
      !validColor
    ) return null;

    return {
      spotifyTrackId: parsed.spotifyTrackId.slice(0, 64),
      title: parsed.title.slice(0, 120),
      artist: parsed.artist.slice(0, 100),
      senderName: parsed.senderName.slice(0, 30),
      message: parsed.message.slice(0, 180),
      tapeColor: parsed.tapeColor as TapeColorId,
      durationMs: Math.max(1, Math.min(parsed.durationMs, 7_200_000)),
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : undefined,
    };
  } catch {
    return null;
  }
}

export function tapeFromHash(): { tape: SharedTape | null; shared: boolean; corrupted: boolean } {
  const match = window.location.hash.match(/^#\/tape\/([^/]+)$/);
  if (!match) return { tape: null, shared: false, corrupted: false };
  const tape = decodeTape(match[1]);
  return { tape, shared: true, corrupted: tape === null };
}
