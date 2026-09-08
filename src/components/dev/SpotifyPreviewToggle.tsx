import { useSpotifyStore } from "../../state/spotifyStore";

export function SpotifyPreviewToggle() {
  const enabled = useSpotifyStore((state) => state.isDemoMode);
  if (!import.meta.env.DEV) return null;

  const toggle = () => {
    useSpotifyStore.setState({
      isDemoMode: !enabled,
      isPreviewPlaying: false,
      error: "",
      notice: "",
    });
  };

  return <div className="dev-preview">
    <div>
      <strong>Spotify UI testen</strong>
      <span>Nur lokal sichtbar · ohne Login und Spotify-Audio</span>
    </div>
    <button type="button" className={enabled ? "is-active" : ""} onClick={toggle} aria-pressed={enabled}>
      {enabled ? "Simulation aus" : "Verbindung simulieren"}
    </button>
  </div>;
}
