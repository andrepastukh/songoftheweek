import { Check, Disc3, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";

const DEMO_LIBRARY = [
  { title: "Nightcall", artist: "Kavinsky", durationMs: 258_000 },
  { title: "Sweet Disposition", artist: "The Temper Trap", durationMs: 231_000 },
  { title: "Fade Into You", artist: "Mazzy Star", durationMs: 296_000 },
];

export function SpotifyInput() {
  const track = useTapeStore((state) => state.track);
  const setTrack = useTapeStore((state) => state.setTrack);
  const [value, setValue] = useState(track.spotifyUrl ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const handleChange = (next: string) => {
    setValue(next);
    setStatus("idle");
    if (timer.current) window.clearTimeout(timer.current);
    if (!next.trim()) return;

    const id = parseSpotifyTrackId(next);
    if (!id) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    timer.current = window.setTimeout(() => {
      const metadata = DEMO_LIBRARY[id.charCodeAt(0) % DEMO_LIBRARY.length];
      setTrack({ id, ...metadata, spotifyUrl: next });
      setStatus("success");
    }, 650);
  };

  return (
    <div>
      <div className={`input-shell ${status === "error" ? "has-error" : ""}`}>
        <Disc3 size={16} strokeWidth={1.5} aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="open.spotify.com/track/…"
          aria-label="Spotify Track URL"
          aria-describedby="spotify-help"
          spellCheck={false}
        />
        {status === "loading" && <LoaderCircle className="spin" size={15} aria-label="Track wird geladen" />}
        {status === "success" && <Check size={15} aria-label="Track erkannt" />}
      </div>
      <p id="spotify-help" className={status === "error" ? "field-help field-help--error" : "field-help"}>
        {status === "error" ? "Bitte einen gültigen Spotify-Track-Link einfügen." : status === "success" ? `Demo-Metadaten geladen · ${track.artist}` : "Im Prototyp läuft die Wiedergabe im Demo-Modus."}
      </p>
    </div>
  );
}
