import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  request: vi.fn(), metadata: vi.fn(), activate: vi.fn(), pause: vi.fn(), resume: vi.fn(), sound: vi.fn(), stopSound: vi.fn(),
}));
vi.mock("../src/services/spotifyAuth", () => ({ getAccessToken: async () => "access", hasSpotifySession: () => true, disconnectSpotify: vi.fn() }));
vi.mock("../src/services/spotify", () => ({ spotifyRequest: mocks.request, getSpotifyTrack: mocks.metadata }));
vi.mock("../src/services/cassetteSound", () => ({ startCassetteSound: mocks.sound }));
let events: Map<string, (data: unknown) => void>;

beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers(); vi.resetAllMocks();
  events = new Map();
  mocks.activate.mockResolvedValue(undefined); mocks.pause.mockResolvedValue(undefined); mocks.resume.mockResolvedValue(undefined);
  mocks.request.mockResolvedValue(new Response(null, { status: 204 }));
  mocks.metadata.mockResolvedValue({ playable: true });
  mocks.sound.mockReturnValue({ ready: Promise.resolve(), stop: mocks.stopSound });
  class Player {
    addListener(event: string, callback: (data: unknown) => void) { events.set(event, callback); return true; }
    async connect() { events.get("ready")?.({ device_id: "this-browser" }); return true; }
    disconnect() {}
    activateElement = mocks.activate;
    pause = mocks.pause;
    resume = mocks.resume;
    async getCurrentState() { return null; }
  }
  vi.stubGlobal("window", { Spotify: { Player }, setTimeout, clearTimeout });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("cassette playback", () => {
  it("activates audio on the click and waits 900ms before starting this SDK device", async () => {
    const player = await import("../src/services/spotifyPlayer");
    await player.connectPlayer();
    const playing = player.playTape("4uLU6hMCjMI75M1A2tKUQC");
    expect(mocks.activate).toHaveBeenCalledTimes(1);
    expect(mocks.sound).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(899);
    expect(mocks.request).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); await playing;
    expect(mocks.stopSound).toHaveBeenCalled();
    expect(mocks.request).toHaveBeenCalledWith("/me/player/play?device_id=this-browser", expect.objectContaining({ body: JSON.stringify({ uris: ["spotify:track:4uLU6hMCjMI75M1A2tKUQC"], position_ms: 0 }) }));
  });
  it("cancels during the delay so Spotify never starts", async () => {
    const player = await import("../src/services/spotifyPlayer");
    await player.connectPlayer();
    const playing = player.playTape("4uLU6hMCjMI75M1A2tKUQC");
    await player.pauseTape();
    await vi.advanceTimersByTimeAsync(900); await playing;
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.stopSound).toHaveBeenCalled();
  });
  it("does not start an unavailable song", async () => {
    const player = await import("../src/services/spotifyPlayer");
    const { useSpotifyStore } = await import("../src/state/spotifyStore");
    mocks.metadata.mockResolvedValue({ playable: false });
    await player.connectPlayer();
    const playing = player.playTape("4uLU6hMCjMI75M1A2tKUQC");
    await vi.advanceTimersByTimeAsync(900); await playing;
    expect(mocks.request).not.toHaveBeenCalled();
    expect(useSpotifyStore.getState().error).toContain("nicht verfügbar");
  });
  it("shows a useful autoplay error and stops the animation", async () => {
    const player = await import("../src/services/spotifyPlayer");
    const { useSpotifyStore } = await import("../src/state/spotifyStore");
    await player.connectPlayer();
    events.get("autoplay_failed")?.(null);
    expect(useSpotifyStore.getState()).toMatchObject({ isPlaying: false, isStarting: false, error: expect.stringContaining("Play klicken") });
  });
});
