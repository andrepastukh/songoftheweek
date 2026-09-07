import { SPOTIFY_PLAYBACK_DELAY_MS } from "../config";
import { useSpotifyStore } from "../state/spotifyStore";
import { getAccessToken, hasSpotifySession, disconnectSpotify } from "./spotifyAuth";
import { getSpotifyTrack, spotifyRequest } from "./spotify";
import { startCassetteSound } from "./cassetteSound";

type PlaybackState = {
  paused: boolean; position: number; duration: number;
  track_window: { current_track: { id: string; linked_from?: { id: string } } };
};
type PlayerEvents = {
  ready: { device_id: string }; not_ready: { device_id: string };
  player_state_changed: PlaybackState | null; autoplay_failed: null;
  initialization_error: { message: string }; authentication_error: { message: string };
  account_error: { message: string }; playback_error: { message: string };
};
interface SpotifyPlayer {
  addListener<K extends keyof PlayerEvents>(event: K, callback: (payload: PlayerEvents[K]) => void): boolean;
  connect(): Promise<boolean>;
  disconnect(): void;
  activateElement(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  getCurrentState(): Promise<PlaybackState | null>;
}
declare global {
  interface Window {
    Spotify?: { Player: new (options: { name: string; getOAuthToken: (callback: (token: string) => void) => void; volume: number }) => SpotifyPlayer };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

let sdkRequest: Promise<void> | null = null;
let connection: Promise<void> | null = null;
let player: SpotifyPlayer | null = null;
let deviceId: string | null = null;
let activeTrack: string | null = null;
let operation = 0;
let lifecycle = 0;
let stopSound: (() => void) | null = null;
let transport: Promise<unknown> = Promise.resolve();
const update = useSpotifyStore.setState;

function enqueue<T>(command: () => Promise<T>): Promise<T> {
  const result = transport.then(command, command);
  transport = result.catch(() => {});
  return result;
}

const message = (error: unknown) => error instanceof Error ? error.message : "Spotify konnte die Wiedergabe nicht starten.";
function fail(error: string) { operation++; update({ error, isStarting: false, isPlaying: false }); stopSound?.(); stopSound = null; }

function loadSdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve();
  if (sdkRequest) return sdkRequest;
  sdkRequest = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => { script.remove(); reject(new Error("Der Spotify-Player konnte nicht geladen werden. Bitte Verbindung oder Inhaltsblocker prüfen.")); }, 15_000);
    window.onSpotifyWebPlaybackSDKReady = () => { window.clearTimeout(timer); resolve(); };
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => { window.clearTimeout(timer); script.remove(); reject(new Error("Der Spotify-Player konnte nicht geladen werden. Bitte erneut versuchen.")); };
    document.head.appendChild(script);
  }).catch(error => { sdkRequest = null; throw error; });
  return sdkRequest;
}

export function connectPlayer(): Promise<void> {
  if (useSpotifyStore.getState().isReady) return Promise.resolve();
  if (connection) return connection;
  const session = ++lifecycle;
  update({ isConnecting: true, isConnected: hasSpotifySession(), error: "" });
  connection = (async () => {
    await getAccessToken();
    await loadSdk();
    if (session !== lifecycle) return;
    const sdk = window.Spotify;
    if (!sdk) throw new Error("Der Spotify-Player ist nicht verfügbar.");
    player?.disconnect();
    const instance = new sdk.Player({
      name: "Side A Cassette", volume: 0.7,
      getOAuthToken: callback => { void getAccessToken().then(callback).catch(() => {
        if (session === lifecycle) { update({ isReady: false, isConnected: hasSpotifySession() }); fail("Spotify-Anmeldung abgelaufen. Bitte erneut verbinden."); }
      }); },
    });
    player = instance;
    const alive = () => session === lifecycle;
    instance.addListener("not_ready", () => {
      if (!alive()) return;
      deviceId = null; update({ isReady: false }); fail("Der Spotify-Player ist offline. Bitte erneut verbinden.");
    });
    instance.addListener("player_state_changed", state => {
      if (!alive()) return;
      const matches = state && (state.track_window.current_track.id === activeTrack || state.track_window.current_track.linked_from?.id === activeTrack);
      update({ isPlaying: Boolean(matches && !state.paused) });
      if (!state && activeTrack) update({ notice: "Wiedergabe wurde an ein anderes Gerät übergeben. Play holt diesen Song hierher zurück." });
    });
    instance.addListener("autoplay_failed", () => { if (alive()) fail("Der Browser hat Audio blockiert. Bitte noch einmal direkt auf Play klicken."); });
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("Der Spotify-Player wird nicht bereit. Bitte erneut verbinden.")), 20_000);
      instance.addListener("ready", ({ device_id }) => {
        window.clearTimeout(timer);
        if (alive()) { deviceId = device_id; update({ isReady: true, isConnected: true, isConnecting: false }); }
        resolve();
      });
      const errors = {
        initialization_error: "Dieser Browser unterstützt Spotify-Audio nicht. Bitte einen Browser mit geschützten Medien verwenden.",
        authentication_error: "Spotify hat die Anmeldung abgelehnt. Bitte Spotify erneut verbinden.",
        account_error: "Für Wiedergabe in Side A benötigst du Spotify Premium.",
        playback_error: "Spotify konnte den Song nicht abspielen. Bitte Verfügbarkeit und Verbindung prüfen.",
      } as const;
      for (const event of Object.keys(errors) as (keyof typeof errors)[]) {
        instance.addListener(event, () => {
          window.clearTimeout(timer);
          if (alive()) { update({ isReady: false }); fail(errors[event]); }
          reject(new Error(errors[event]));
        });
      }
      void instance.connect().then(ok => { if (!ok) { window.clearTimeout(timer); reject(new Error("Spotify konnte diesen Browser nicht verbinden.")); } }).catch(error => { window.clearTimeout(timer); reject(error); });
    });
  })().catch(error => {
    if (session === lifecycle) { player?.disconnect(); deviceId = null; update({ isReady: false, isConnected: hasSpotifySession() }); fail(message(error)); }
  }).finally(() => { if (session === lifecycle) { update({ isConnecting: false }); connection = null; } });
  return connection;
}

export function disconnectPlayer() {
  lifecycle++; operation++;
  connection = null;
  stopSound?.(); stopSound = null;
  player?.disconnect(); player = null; deviceId = null; activeTrack = null;
  disconnectSpotify();
  update({ isConnected: false, isReady: false, isConnecting: false, isPlaying: false, isStarting: false, isPreviewPlaying: false, error: "", notice: "" });
}

export async function pauseTape() {
  const instance = player;
  const shouldPause = useSpotifyStore.getState().isPlaying || useSpotifyStore.getState().isStarting;
  operation++; stopSound?.(); stopSound = null;
  update({ isStarting: false, isPreviewPlaying: false });
  try { if (instance && shouldPause) await enqueue(() => instance.pause()); update({ isPlaying: false }); }
  catch { fail("Pausieren war nicht möglich. Bitte die Spotify-Verbindung prüfen."); }
}

export function resetPlayback() {
  activeTrack = null;
  void pauseTape();
}

export async function playTape(trackId: string) {
  if (!player || !deviceId || !useSpotifyStore.getState().isReady) {
    fail("Der Spotify-Player ist noch nicht bereit. Bitte zuerst verbinden."); return;
  }
  if (useSpotifyStore.getState().isStarting) return;
  const current = ++operation;
  const instance = player;
  const target = deviceId;
  update({ isStarting: true, isPlaying: false, error: "", notice: "" });
  try {
    // Both calls originate in the real click. Delaying activation would lose browser permission.
    const activation = instance.activateElement();
    const sound = startCassetteSound();
    stopSound = sound.stop;
    const delay = new Promise<void>(resolve => window.setTimeout(resolve, SPOTIFY_PLAYBACK_DELAY_MS));
    const metadata = getSpotifyTrack(trackId);
    const [,, , track] = await Promise.all([activation, sound.ready, delay, metadata]);
    sound.stop();
    if (current !== operation) return;
    if (!track.playable) throw new Error("Dieser Song ist für dein Spotify-Konto oder in deiner Region nicht verfügbar.");
    await enqueue(async () => {
      if (current !== operation) return;
      const state = await instance.getCurrentState();
      if (current !== operation) return;
      const canResume = activeTrack === trackId && state && state.position > 0 && state.position < state.duration &&
        (state.track_window.current_track.id === trackId || state.track_window.current_track.linked_from?.id === trackId);
      activeTrack = trackId;
      if (canResume) await instance.resume();
      else {
        // Target only this SDK device; a Play click explicitly moves playback here.
        await spotifyRequest(`/me/player/play?device_id=${encodeURIComponent(target)}`, {
          method: "PUT", body: JSON.stringify({ uris: [`spotify:track:${trackId}`], position_ms: 0 }),
        });
      }
      if (current !== operation) { await instance.pause(); return; }
      const actual = await instance.getCurrentState();
      if (current === operation) update({
        isPlaying: Boolean(actual && !actual.paused && (actual.track_window.current_track.id === trackId || actual.track_window.current_track.linked_from?.id === trackId)),
        isStarting: false,
      });
    });
  } catch (error) { if (current === operation) fail(message(error)); }
  finally { if (current === operation) { stopSound?.(); stopSound = null; update({ isStarting: false }); } }
}
