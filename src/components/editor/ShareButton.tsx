import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { encodeTape } from "../../utils/shareState";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";

export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const spotifyUrl = useTapeStore((state) => state.spotifyUrl);
  const message = useTapeStore((state) => state.message);
  const backgroundId = useTapeStore((state) => state.backgroundId);
  const designId = useTapeStore((state) => state.designId);
  const textColorId = useTapeStore((state) => state.textColorId);
  const trackId = parseSpotifyTrackId(spotifyUrl);

  const share = async () => {
    if (!trackId) return;

    const encoded = encodeTape({
      spotifyTrackId: trackId,
      message: message.trim(),
      backgroundId,
      designId,
      textColorId,
    });
    const url = `${window.location.origin}${window.location.pathname}#/tape/${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      window.history.replaceState(null, "", `#/tape/${encoded}`);
      setStatus("error");
    }
  };

  return (
    <div className="share-area">
      <button className="share-button" type="button" onClick={share} disabled={!trackId}>
        <span>{status === "copied" ? "Tape kopiert" : "Tape teilen"}</span>
        {status === "copied" ? <Check size={17} /> : <Link2 size={17} />}
      </button>
      {status === "error" && <p className="field-help">Link steht jetzt in der Adresszeile.</p>}
    </div>
  );
}
