import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("public Spotify Embed", () => {
  let events: Map<string, (event: unknown) => void>;
  let options: { uri: string; width: string; height: number } | undefined;
  const play = vi.fn();
  const pause = vi.fn();
  const destroy = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    events = new Map();
    const controller = {
      addListener: (event: string, callback: (value: unknown) => void) => events.set(event, callback),
      play,
      pause,
      destroy,
    };
    const api = {
      createController: (_element: HTMLElement, value: typeof options, callback: (value: typeof controller) => void) => {
        options = value;
        callback(controller);
      },
    };
    const windowMock: Record<string, unknown> = { setTimeout, clearTimeout };
    vi.stubGlobal("window", windowMock);
    vi.stubGlobal("document", {
      createElement: () => ({ remove: vi.fn(), src: "", async: false, onerror: null }),
      body: { appendChild: () => (windowMock.onSpotifyIframeApiReady as (value: typeof api) => void)(api) },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("loads a track without OAuth or an app allowlist", async () => {
    const embed = await import("../src/services/spotifyEmbed");
    const cleanup = await embed.mountSpotifyEmbed({} as HTMLElement, "4uLU6hMCjMI75M1A2tKUQC");

    expect(options).toEqual({
      uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
      width: "100%",
      height: 80,
    });
    events.get("ready")?.({});
    embed.playSpotifyEmbed();
    expect(play).toHaveBeenCalledOnce();

    events.get("playback_update")?.({ data: { isPaused: false, isBuffering: false, position: 100, duration: 1000 } });
    const { useSpotifyStore } = await import("../src/state/spotifyStore");
    expect(useSpotifyStore.getState()).toMatchObject({ isReady: true, isPlaying: true });

    cleanup();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
