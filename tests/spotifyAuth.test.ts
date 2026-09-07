import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const origin = "https://example.github.io";
let values: Map<string, string>;
let location: { origin: string; pathname: string; hash: string; search: string; assign: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_SPOTIFY_CLIENT_ID", "test-client");
  vi.stubEnv("VITE_SPOTIFY_REDIRECT_URI", `${origin}/side-a/`);
  values = new Map();
  location = { origin, pathname: "/side-a/", hash: "#/t/original", search: "", assign: vi.fn() };
  vi.stubGlobal("window", { location, history: { replaceState: vi.fn() }, sessionStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Spotify PKCE", () => {
  it.each(["http://localhost:5173", "http://127.0.0.1:4175", "http://127.0.0.1:5174"])("carries the complete tape from %s to the configured local entry before OAuth", async currentOrigin => {
    location.origin = currentOrigin;
    vi.stubEnv("VITE_SPOTIFY_REDIRECT_URI", "http://127.0.0.1:5173/");
    const draft = { spotifyUrl: "https://open.spotify.com/track/7JvyTnuwm1n1BryNAOVZZU", message: "Für dich 💚", backgroundId: "cyan", designId: "herbs", textColorId: "white", accessToken: "must-not-travel" };
    const auth = await import("../src/services/spotifyAuth");
    await auth.loginSpotify(draft);
    const url = new URL(location.assign.mock.calls[0][0]);
    expect(url.origin).toBe("http://127.0.0.1:5173");
    expect(url.pathname).toBe("/");
    const { tapeFromHash } = await import("../src/utils/shareState");
    expect(tapeFromHash(url.hash).tape).toEqual({ spotifyTrackId: "7JvyTnuwm1n1BryNAOVZZU", message: "Für dich 💚", backgroundId: "cyan", designId: "herbs", textColorId: "white", schemaVersion: 1 });
    expect(values.has("side-a.spotify.pending")).toBe(false);
  });
  it("does not transfer a draft between unrelated origins", async () => {
    vi.stubEnv("VITE_SPOTIFY_REDIRECT_URI", "https://other.example/side-a/");
    const auth = await import("../src/services/spotifyAuth");
    await expect(auth.loginSpotify({ message: "private draft" })).rejects.toThrow("passen nicht zusammen");
    expect(location.assign).not.toHaveBeenCalled();
  });
  it("rejects invalid redirect configuration with a readable error", async () => {
    vi.stubEnv("VITE_SPOTIFY_REDIRECT_URI", "http://localhost:5173/");
    const auth = await import("../src/services/spotifyAuth");
    expect(() => auth.spotifyRedirectUri()).toThrow("127.0.0.1");
  });
  it("matches the RFC 7636 S256 test vector", async () => {
    const auth = await import("../src/services/spotifyAuth");
    expect(await auth.pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
  it("uses random state, PKCE and preserves a Pages route with an unsaved draft", async () => {
    const auth = await import("../src/services/spotifyAuth");
    await auth.loginSpotify({ message: "unshared" });
    const url = new URL(location.assign.mock.calls[0][0]);
    const pending = JSON.parse(values.get("side-a.spotify.pending")!);
    expect(url.searchParams.get("state")).toBe(pending.state);
    expect(url.searchParams.get("code_challenge")).toBe(await auth.pkceChallenge(pending.verifier));
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.has("client_secret")).toBe(false);
    expect(pending.returnTo).toBe("/side-a/#/t/original");
    expect(pending.draft).toEqual({ message: "unshared" });
  });
  it("rejects mismatched state without exchanging the code", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    values.set("side-a.spotify.pending", JSON.stringify({ state: "expected", verifier: "verifier", createdAt: Date.now() }));
    location.search = "?code=secret&state=attacker";
    const auth = await import("../src/services/spotifyAuth");
    expect((await auth.finishSpotifyLogin()).error).toContain("ungültig");
    expect(fetch).not.toHaveBeenCalled();
    expect(values.has("side-a.spotify.pending")).toBe(false);
  });
  it("restores the original route and draft when OAuth is cancelled", async () => {
    const auth = await import("../src/services/spotifyAuth");
    await auth.loginSpotify({ message: "not lost" });
    const pending = JSON.parse(values.get("side-a.spotify.pending")!);
    location.search = `?error=access_denied&state=${pending.state}`;
    expect(await auth.finishSpotifyLogin()).toMatchObject({ returnTo: "/side-a/#/t/original", draft: { message: "not lost" }, error: expect.stringContaining("abgebrochen") });
  });
  it("exchanges a callback only once and keeps access tokens out of storage", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: "access", refresh_token: "refresh", expires_in: 3600 })));
    vi.stubGlobal("fetch", fetch);
    const auth = await import("../src/services/spotifyAuth");
    await auth.loginSpotify({});
    const pending = JSON.parse(values.get("side-a.spotify.pending")!);
    location.search = `?code=code&state=${pending.state}`;
    await Promise.all([auth.finishSpotifyLogin(), auth.finishSpotifyLogin()]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await auth.getAccessToken()).toBe("access");
    expect([...values.values()]).toEqual(["refresh"]);
  });
  it("coalesces refreshes, rotates tokens and preserves omitted refresh tokens", async () => {
    values.set("side-a.spotify.refresh", "old");
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "a", refresh_token: "rotated", expires_in: 3600 })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "b", expires_in: 3600 })));
    vi.stubGlobal("fetch", fetch);
    const auth = await import("../src/services/spotifyAuth");
    expect(await Promise.all([auth.getAccessToken(), auth.getAccessToken()])).toEqual(["a", "a"]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(values.get("side-a.spotify.refresh")).toBe("rotated");
    expect(await auth.getAccessToken(true)).toBe("b");
    expect(values.get("side-a.spotify.refresh")).toBe("rotated");
    auth.disconnectSpotify();
    expect(auth.hasSpotifySession()).toBe(false);
  });
  it("clears a rejected refresh token and asks to reconnect", async () => {
    values.set("side-a.spotify.refresh", "revoked");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 400 })));
    const auth = await import("../src/services/spotifyAuth");
    await expect(auth.getAccessToken()).rejects.toThrow("erneut verbinden");
    expect(auth.hasSpotifySession()).toBe(false);
  });
  it("prevents cross-origin return redirects", async () => {
    const auth = await import("../src/services/spotifyAuth");
    expect(auth.safeReturnTo("https://evil.test/")).toBe("/");
    expect(auth.safeReturnTo("//evil.test/")).toBe("/");
    expect(auth.safeReturnTo("/side-a/?code=secret#/t/snapshot")).toBe("/side-a/#/t/snapshot");
  });
});
