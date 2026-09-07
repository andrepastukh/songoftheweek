const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function isSpotifyTrackId(value: string): boolean {
  return TRACK_ID_PATTERN.test(value);
}

export function parseSpotifyTrackId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("spotify:track:")) {
    const id = trimmed.slice("spotify:track:".length);
    return isSpotifyTrackId(id) ? id : null;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || url.port || url.username || url.password) return null;
    const match = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})\/?$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
