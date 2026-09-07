import { describe, expect, it } from "vitest";
import { parseSpotifyTrackId } from "../src/utils/spotifyUrl";
import { createShareUrl, decodeTape, encodeTape, tapeFromHash } from "../src/utils/shareState";
import { hydrateTape, parseTapeDesign, serializeTape } from "../src/utils/tapeData";
import { useTapeStore } from "../src/state/tapeStore";
import type { TapeDesign } from "../src/types";

const id = "4uLU6hMCjMI75M1A2tKUQC";
const tape: TapeDesign = { spotifyTrackId: id, message: "  Für dich 💚\nSeite A  ", backgroundId: "cyan", designId: "herbs", textColorId: "white" };

describe("Spotify links", () => {
  it.each([`https://open.spotify.com/track/${id}`, ` https://open.spotify.com/intl-de/track/${id}?si=foo `, `spotify:track:${id}`])("accepts %s", url => expect(parseSpotifyTrackId(url)).toBe(id));
  it.each(["", `http://open.spotify.com/track/${id}`, `https://open.spotify.com.evil.test/track/${id}`, `https://user@open.spotify.com/track/${id}`, `https://open.spotify.com/album/${id}`, `https://open.spotify.com/track/${id}/other`, `spotify:track:other:${id}`, "https://open.spotify.com/track/abc", "https://spotify.link/abc"])("rejects %s", url => expect(parseSpotifyTrackId(url)).toBeNull());
});

describe("tape snapshots", () => {
  it("preserves artwork, whitespace and unicode", () => {
    expect(decodeTape(encodeTape(tape))).toEqual({ ...tape, schemaVersion: 1 });
  });
  it("projects only editable stable values", () => {
    const state = { ...tape, spotifyUrl: `spotify:track:${id}`, editorOpen: true, accessToken: "secret" };
    expect(serializeTape(state)).toEqual(tape);
  });
  it("hydrates atomically with editor closed and no playback credentials", () => {
    useTapeStore.setState({ editorOpen: true, message: "previous" });
    useTapeStore.getState().hydrateSharedTape(tape);
    expect(useTapeStore.getState()).toMatchObject(hydrateTape(tape));
    expect(useTapeStore.getState()).not.toHaveProperty("accessToken");
  });
  it("creates another snapshot after edits without changing the original", () => {
    const original = createShareUrl(tape, "https://example.github.io/side-a/");
    useTapeStore.getState().hydrateSharedTape(tape);
    useTapeStore.getState().setMessage("Neuer Text");
    const next = createShareUrl(serializeTape(useTapeStore.getState()), original);
    expect(next).not.toBe(original);
    expect(tapeFromHash(new URL(original).hash).tape).toEqual({ ...tape, schemaVersion: 1 });
    expect(tapeFromHash(new URL(next).hash).tape?.message).toBe("Neuer Text");
  });
  it("keeps the Pages subpath and removes OAuth parameters", () => {
    expect(createShareUrl(tape, "https://example.github.io/side-a/?code=secret&state=foo")).toMatch(/^https:\/\/example.github.io\/side-a\/#\/t\//);
  });
  it("reads legacy hash links", () => {
    const legacy = btoa(JSON.stringify({ spotifyTrackId: id, message: "Hi" })).replaceAll("=", "");
    expect(tapeFromHash(`#/tape/${legacy}`).tape?.backgroundId).toBe("white");
  });
  it.each(["null", "[]", '[2,"id"]', '{"message":4}'])("rejects malformed payload %s", value => expect(decodeTape(btoa(value))).toBeNull());
  it("rejects unknown IDs, oversize messages and routes", () => {
    expect(() => parseTapeDesign({ ...tape, designId: "unknown" })).toThrow();
    expect(() => parseTapeDesign({ ...tape, message: "x".repeat(181) })).toThrow();
    expect(tapeFromHash("#/t/missing").corrupted).toBe(true);
    expect(decodeTape("a".repeat(5000))).toBeNull();
  });
});
