import { Check, Disc3 } from "lucide-react";
import { useTapeStore } from "../../state/tapeStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";

export function SpotifyInput() {
  const spotifyUrl = useTapeStore((state) => state.spotifyUrl);
  const setSpotifyUrl = useTapeStore((state) => state.setSpotifyUrl);
  const hasValue = spotifyUrl.trim().length > 0;
  const isValid = parseSpotifyTrackId(spotifyUrl) !== null;
  const hasError = hasValue && !isValid;

  return (
    <div>
      <div className={`input-shell ${hasError ? "has-error" : ""}`}>
        <Disc3 size={16} strokeWidth={1.5} aria-hidden="true" />
        <input
          value={spotifyUrl}
          onChange={(event) => setSpotifyUrl(event.target.value)}
          placeholder="open.spotify.com/track/…"
          aria-label="Spotify Track URL"
          aria-describedby="spotify-help"
          spellCheck={false}
        />
        {isValid && <Check size={15} aria-label="Track erkannt" />}
      </div>
      <p id="spotify-help" className={hasError ? "field-help field-help--error" : "field-help"}>
        {hasError
          ? "Bitte einen gültigen Spotify-Track-Link einfügen."
          : isValid
            ? "Spotify-Track erkannt."
            : "Füge einen Spotify-Track-Link ein."}
      </p>
    </div>
  );
}
