import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { useTapeStore } from "../../state/tapeStore";
import { createShareUrl } from "../../utils/shareState";
import { parseSpotifyTrackId } from "../../utils/spotifyUrl";
import { serializeTape } from "../../utils/tapeData";

export function ShareButton() {
  const state = useTapeStore();
  const [result, setResult] = useState<{ url: string; snapshot: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "creating" | "copied" | "shared">("idle");
  const [error, setError] = useState("");
  const valid = parseSpotifyTrackId(state.spotifyUrl) !== null;
  const snapshot = valid ? JSON.stringify(serializeTape(state)) : "";
  const changed = result !== null && result.snapshot !== snapshot;

  const create = async () => {
    setStatus("creating"); setError("");
    try {
      const tape = serializeTape(useTapeStore.getState());
      const url = createShareUrl(tape, window.location.href);
      setResult({ url, snapshot: JSON.stringify(tape) });
    } catch { setError("Der Link konnte nicht erstellt werden. Bitte Song und Design überprüfen."); }
    finally { setStatus("idle"); }
  };

  const copy = async () => {
    if (!result) return;
    setError("");
    try { await navigator.clipboard.writeText(result.url); setStatus("copied"); }
    catch { setError("Kopieren ist hier nicht verfügbar. Du kannst den Link im Feld markieren und kopieren."); }
  };

  const share = async () => {
    if (!result) return;
    if (!navigator.share) return copy();
    setError("");
    try { await navigator.share({ title: "Side A – eine Kassette für dich", url: result.url }); setStatus("shared"); }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  };

  return <div className="share-area">
    <button className="share-button" type="button" onClick={create} disabled={!valid || status === "creating"}>
      <span>{status === "creating" ? "Link wird erstellt …" : changed ? "Neuen Share-Link erstellen" : "Share-Link erstellen"}</span>
      <Link2 size={17} />
    </button>
    {result && <div className="share-result">
      <label htmlFor="share-url">{changed ? "Bisheriger Link – enthält deine neuen Änderungen noch nicht" : "Deine Kassette ist bereit"}</label>
      <input id="share-url" value={result.url} readOnly onFocus={event => event.currentTarget.select()} />
      <div className="action-row">
        <button className="text-button" type="button" onClick={copy}>{status === "copied" ? <Check size={14} /> : <Copy size={14} />} Kopieren</button>
        {typeof navigator.share === "function" && <button className="text-button" type="button" onClick={share}><Share2 size={14} /> Teilen</button>}
        <a href={result.url} target="_blank" rel="noopener noreferrer">Öffnen</a>
      </div>
      <p className="field-help" role="status">{status === "copied" ? "Link kopiert." : status === "shared" ? "Link geteilt." : "Dieser Link behält genau diesen Stand deiner Kassette."}</p>
    </div>}
    {error && <p className="field-help field-help--error" role="alert">{error}</p>}
  </div>;
}
