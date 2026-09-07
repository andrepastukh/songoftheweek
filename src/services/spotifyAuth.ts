import { SPOTIFY_SCOPES } from "../config";
import { isRecord, parseTapeDesign } from "../utils/tapeData";
import { parseSpotifyTrackId } from "../utils/spotifyUrl";
import { createShareUrl } from "../utils/shareState";

const PENDING_KEY = "side-a.spotify.pending";
const REFRESH_KEY = "side-a.spotify.refresh";
type Token = { accessToken: string; expiresAt: number };
type Pending = { state: string; verifier: string; returnTo: string; draft: unknown; createdAt: number };
let token: Token | null = null;
let refreshRequest: Promise<string> | null = null;
let callbackRequest: Promise<OAuthResult> | null = null;
let generation = 0;
export type OAuthResult = { returnTo: string; draft?: unknown; error?: string };

function storage() {
  try { return window.sessionStorage; }
  catch { throw new Error("Bitte Tab-Speicher im Browser erlauben, um Spotify zu verbinden."); }
}

export function spotifyConfigured() { return Boolean(import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim()); }

function configuredRedirect(): URL {
  const configured = import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim();
  let url: URL;
  try { url = new URL(configured || window.location.pathname, window.location.origin); }
  catch { throw new Error("Die Spotify-Rücksprungadresse in der App-Konfiguration ist ungültig."); }
  if (url.hash || url.search || url.username || url.password ||
    (url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "[::1]"].includes(url.hostname)))) {
    throw new Error("Die Spotify-Rücksprungadresse muss HTTPS verwenden, lokal ist HTTP mit 127.0.0.1 erlaubt. Sie darf keine Query oder # enthalten.");
  }
  return url;
}

export function spotifyRedirectUri(): string {
  const url = configuredRedirect();
  if (url.origin !== window.location.origin) {
    throw new Error(`Die geöffnete App und die Spotify-Rücksprungadresse passen nicht zusammen. Konfiguriert ist ${url.href}.`);
  }
  return url.href;
}

export function localSpotifyEntryUrl(draft: unknown): string | null {
  const target = configuredRedirect();
  const current = new URL(window.location.origin);
  if (target.origin === current.origin) return null;
  // Move only between local HTTP origins. Never send a draft to another website.
  if (current.protocol !== "http:" || target.protocol !== "http:" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(current.hostname) ||
    !["127.0.0.1", "[::1]"].includes(target.hostname)) return null;
  if (!isRecord(draft) || typeof draft.spotifyUrl !== "string") {
    throw new Error("Bitte einen gültigen Song-Link einfügen, bevor du Spotify verbindest.");
  }
  const tape = parseTapeDesign({ ...draft, spotifyTrackId: parseSpotifyTrackId(draft.spotifyUrl) });
  return createShareUrl(tape, target.href);
}

export function safeReturnTo(input: unknown, origin = window.location.origin): string {
  if (typeof input !== "string") return "/";
  try {
    const url = new URL(input, origin);
    if (url.origin !== origin) return "/";
    return url.pathname + url.hash;
  } catch { return "/"; }
}

function randomString() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function loginSpotify(draft: unknown) {
  if (!spotifyConfigured()) throw new Error("Spotify ist noch nicht eingerichtet. Bitte die Client ID in der App-Konfiguration hinterlegen.");
  const localEntry = localSpotifyEntryUrl(draft);
  if (localEntry) {
    // Create PKCE state only after arriving: sessionStorage belongs to one origin.
    window.location.assign(localEntry);
    return;
  }
  const redirectUri = spotifyRedirectUri();
  const verifier = randomString();
  const state = randomString();
  const challenge = await pkceChallenge(verifier);
  const pending: Pending = { state, verifier, returnTo: window.location.pathname + window.location.hash, draft, createdAt: Date.now() };
  storage().setItem(PENDING_KEY, JSON.stringify(pending));
  const query = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID.trim(), response_type: "code", redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES.join(" "), state, code_challenge_method: "S256", code_challenge: challenge,
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${query}`);
}

async function exchange(parameters: URLSearchParams, previousRefresh?: string): Promise<string> {
  const currentGeneration = generation;
  let response: Response;
  try {
    response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: parameters, signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new Error("Spotify ist gerade nicht erreichbar. Bitte erneut versuchen."); }
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) disconnectSpotify();
    throw new Error(response.status === 429 ? "Spotify erhält zu viele Anfragen. Bitte später erneut versuchen." : "Die Spotify-Verbindung ist abgelaufen oder wurde abgelehnt. Bitte erneut verbinden.");
  }
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new Error("Spotify hat keine gültige Antwort geliefert. Bitte erneut verbinden."); }
  if (!isRecord(data) || typeof data.access_token !== "string" || typeof data.expires_in !== "number" || data.expires_in <= 0) {
    throw new Error("Spotify hat keine gültige Anmeldung geliefert. Bitte erneut verbinden.");
  }
  if (currentGeneration !== generation) throw new Error("Die Spotify-Verbindung wurde getrennt.");
  const refresh = typeof data.refresh_token === "string" ? data.refresh_token : previousRefresh;
  if (refresh) storage().setItem(REFRESH_KEY, refresh);
  token = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.accessToken;
}

export function hasSpotifySession(): boolean {
  try { return token !== null || storage().getItem(REFRESH_KEY) !== null; } catch { return false; }
}

export function disconnectSpotify() {
  generation++; token = null;
  try { storage().removeItem(REFRESH_KEY); storage().removeItem(PENDING_KEY); } catch { /* In-memory token is already cleared. */ }
}

export function getAccessToken(forceRefresh = false): Promise<string> {
  if (!spotifyConfigured()) return Promise.reject(new Error("Spotify ist noch nicht eingerichtet. Bitte die Client ID hinterlegen."));
  if (refreshRequest) return refreshRequest;
  if (!forceRefresh && token && token.expiresAt > Date.now() + 60_000) return Promise.resolve(token.accessToken);
  const refresh = storage().getItem(REFRESH_KEY);
  if (!refresh) return Promise.reject(new Error("Bitte zuerst Spotify verbinden."));
  refreshRequest = exchange(new URLSearchParams({
    grant_type: "refresh_token", refresh_token: refresh, client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID.trim(),
  }), refresh).finally(() => { refreshRequest = null; });
  return refreshRequest;
}

export function isSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("error");
}

// One exchange even with StrictMode; consume state and remove the authorization code from the URL immediately.
export function finishSpotifyLogin(): Promise<OAuthResult> {
  if (callbackRequest) return callbackRequest;
  callbackRequest = (async () => {
    const params = new URLSearchParams(window.location.search);
    let pending: unknown;
    try { pending = JSON.parse(storage().getItem(PENDING_KEY) ?? "null"); } catch { pending = null; }
    try { storage().removeItem(PENDING_KEY); } catch { /* Report the invalid session below. */ }
    window.history.replaceState(null, "", window.location.pathname);
    if (!isRecord(pending) || typeof pending.state !== "string" || !pending.state ||
      params.get("state") !== pending.state || typeof pending.verifier !== "string" ||
      typeof pending.createdAt !== "number") {
      return { returnTo: window.location.pathname, error: "Diese Spotify-Anmeldung ist ungültig oder abgelaufen. Bitte erneut verbinden." };
    }
    const returnTo = safeReturnTo(pending.returnTo);
    const result = { returnTo, draft: pending.draft };
    if (Date.now() - pending.createdAt > 10 * 60_000 || pending.createdAt > Date.now()) {
      return { ...result, error: "Die Spotify-Anmeldung ist abgelaufen. Deine Kassette ist weiterhin da. Bitte erneut verbinden." };
    }
    if (params.has("error")) return { ...result, error: "Spotify-Anmeldung abgebrochen. Deine Kassette ist weiterhin da." };
    const code = params.get("code");
    if (!code) return { ...result, error: "Spotify hat keinen Anmeldecode geliefert. Bitte erneut verbinden." };
    try {
      await exchange(new URLSearchParams({
        grant_type: "authorization_code", code, redirect_uri: spotifyRedirectUri(),
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID.trim(), code_verifier: pending.verifier,
      }));
      return result;
    } catch (error) {
      return { ...result, error: error instanceof Error ? error.message : "Spotify konnte nicht verbunden werden." };
    }
  })();
  return callbackRequest;
}
