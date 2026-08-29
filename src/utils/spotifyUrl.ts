const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function isSpotifyTrackId(value: string): boolean {
  return TRACK_ID_PATTERN.test(value);
}

export function parseSpotifyTrackId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("spotify:track:")) {
    const id = trimmed.split(":").at(-1) ?? "";
    return isSpotifyTrackId(id) ? id : null;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== "open.spotify.com") return null;
    const [, kind, id] = url.pathname.split("/");
    return kind === "track" && isSpotifyTrackId(id ?? "") ? id : null;
  } catch {
    return null;
  }
}
