import type { SharedTape, TapeDesign } from "../types";
import { DEFAULT_BACKGROUND_ID, DEFAULT_DESIGN_ID, DEFAULT_PAGE_BACKGROUND_ID, DEFAULT_TEXT_COLOR_ID } from "../tapeOptions";
import { isRecord, parseTapeDesign } from "./tapeData";

export function encodeTape(input: TapeDesign): string {
  const tape = parseTapeDesign(input);
  const compact = [2, tape.spotifyTrackId, tape.message, tape.backgroundId, tape.designId, tape.textColorId, tape.pageBackgroundId];
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeTape(value: string): SharedTape | null {
  try {
    if (value.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
    const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (Array.isArray(parsed)) {
      if (parsed[0] === 1 && parsed.length === 6) {
        return { ...parseTapeDesign({
          spotifyTrackId: parsed[1], message: parsed[2], backgroundId: parsed[3], designId: parsed[4], textColorId: parsed[5],
          pageBackgroundId: DEFAULT_PAGE_BACKGROUND_ID,
        }), schemaVersion: 2 };
      }
      if (parsed.length !== 7 || parsed[0] !== 2) return null;
      return { ...parseTapeDesign({
        spotifyTrackId: parsed[1], message: parsed[2], backgroundId: parsed[3], designId: parsed[4], textColorId: parsed[5],
        pageBackgroundId: parsed[6],
      }), schemaVersion: 2 };
    }
    // Legacy links used an unversioned object; early ones omitted artwork IDs.
    if (!isRecord(parsed) || (parsed.schemaVersion !== undefined && parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2)) return null;
    return { ...parseTapeDesign({
      ...parsed, backgroundId: parsed.backgroundId ?? DEFAULT_BACKGROUND_ID,
      designId: parsed.designId ?? DEFAULT_DESIGN_ID, textColorId: parsed.textColorId ?? DEFAULT_TEXT_COLOR_ID,
      pageBackgroundId: parsed.pageBackgroundId ?? DEFAULT_PAGE_BACKGROUND_ID,
    }), schemaVersion: 2 };
  } catch { return null; }
}

export function tapeFromHash(hash = window.location.hash): { tape: SharedTape | null; corrupted: boolean } {
  if (!hash || hash === "#" || hash === "#/") return { tape: null, corrupted: false };
  const match = hash.match(/^#\/(?:t|tape)\/([^/]+)$/);
  const tape = match ? decodeTape(match[1]) : null;
  return { tape, corrupted: tape === null };
}

export function createShareUrl(tape: TapeDesign, pageUrl: string): string {
  const url = new URL(pageUrl);
  url.search = "";
  url.hash = `/t/${encodeTape(tape)}`;
  return url.href;
}
