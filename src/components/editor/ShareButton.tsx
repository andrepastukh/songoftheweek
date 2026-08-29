import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { encodeTape } from "../../utils/shareState";

export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const track = useTapeStore((state) => state.track);
  const senderName = useTapeStore((state) => state.senderName);
  const message = useTapeStore((state) => state.message);

  const share = async () => {
    const encoded = encodeTape({
      spotifyTrackId: track.id,
      title: track.title,
      artist: track.artist,
      durationMs: track.durationMs,
      senderName: senderName.trim() || "Jemand",
      message: message.trim() || "Ein Song für dich.",
      createdAt: new Date().toISOString(),
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
      <button className="share-button" type="button" onClick={share}>
        <span>{status === "copied" ? "Tape kopiert" : "Tape teilen"}</span>
        {status === "copied" ? <Check size={17} /> : <Link2 size={17} />}
      </button>
      {status === "error" && <p className="field-help">Link steht jetzt in der Adresszeile.</p>}
    </div>
  );
}
