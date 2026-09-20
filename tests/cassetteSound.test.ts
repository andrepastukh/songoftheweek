import { afterEach, describe, expect, it, vi } from "vitest";

describe("cassette start sound", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the bundled tape recorder effect", async () => {
    const play = vi.fn(() => Promise.resolve());
    const pause = vi.fn();
    let source = "";
    let currentTime = -1;

    class AudioMock {
      volume = 1;
      play = play;
      pause = pause;
      constructor(url: string) { source = url; }
      get currentTime() { return currentTime; }
      set currentTime(value: number) { currentTime = value; }
    }

    vi.stubGlobal("Audio", AudioMock);
    vi.stubGlobal("document", { baseURI: "https://example.test/side-a/" });

    const { startCassetteSound } = await import("../src/services/cassetteSound");
    const sound = startCassetteSound();
    await sound.ready;

    expect(source).toBe("https://example.test/side-a/assets/tape/Tape%20Recorder%20SFX.mp3");
    expect(play).toHaveBeenCalledOnce();

    sound.stop();
    expect(pause).toHaveBeenCalledOnce();
    expect(currentTime).toBe(0);
  });
});
