import { disconnectSpotify, getAccessToken } from "./spotifyAuth";
import { isRecord } from "../utils/tapeData";

export class SpotifyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function spotifyRequest(path: string, init: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();
  const send = () => fetch(`https://api.spotify.com/v1${path}`, {
    ...init, headers: { ...init.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    signal: init.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
  });
  let response: Response;
  try {
    response = await send();
    if (response.status === 401) { token = await getAccessToken(true); response = await send(); }
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error("Spotify ist nicht erreichbar oder die Anmeldung ist abgelaufen. Bitte erneut versuchen oder Spotify neu verbinden.");
  }
  if (!response.ok) {
    if (response.status === 401) disconnectSpotify();
    const messages: Record<number, string> = {
      401: "Die Spotify-Anmeldung ist abgelaufen. Bitte erneut verbinden.",
      403: "Spotify erlaubt diesen Zugriff nicht. Prüfe Premium, App-Freigabe.",
      404: path.startsWith("/tracks/") ? "Dieser Song wurde bei Spotify nicht gefunden." : "Der Spotify-Player ist noch nicht verfügbar. Bitte Player erneut verbinden.",
      429: "Das Spotify-Anfragelimit ist erreicht. Bitte später erneut versuchen.",
    };
    throw new SpotifyError(response.status, messages[response.status] ?? "Spotify konnte diese Aktion nicht ausführen. Bitte erneut versuchen.");
  }
  return response;
}

export type SpotifyTrack = { id: string; title: string; artist: string; cover: string | null; playable: boolean };
export async function getSpotifyTrack(id: string, signal?: AbortSignal): Promise<SpotifyTrack> {
  const response = await spotifyRequest(`/tracks/${encodeURIComponent(id)}`, { signal });
  const data: unknown = await response.json();
  if (!isRecord(data) || typeof data.name !== "string" || !Array.isArray(data.artists)) throw new Error("Die Songinformationen sind momentan nicht verfügbar.");
  const images = isRecord(data.album) && Array.isArray(data.album.images) ? data.album.images : [];
  const cover: unknown = isRecord(images[0]) ? images[0].url : null;
  return {
    id, title: data.name, artist: data.artists.filter(isRecord).map(artist => artist.name).filter(name => typeof name === "string").join(", "),
    cover: typeof cover === "string" && cover.startsWith("https://") ? cover : null,
    playable: data.is_playable !== false && !isRecord(data.restrictions),
  };
}
