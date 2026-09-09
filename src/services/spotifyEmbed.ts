import { useSpotifyStore } from "../state/spotifyStore";

type PlaybackUpdate = {
  data?: { isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number };
};

interface EmbedController {
  addListener(event: "ready" | "playback_started" | "playback_update", callback: (event: PlaybackUpdate) => void): void;
  play(): void;
  pause(): void;
  destroy(): void;
}

interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: EmbedController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let apiRequest: Promise<SpotifyIframeApi> | null = null;
let activeController: EmbedController | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (apiRequest) return apiRequest;
  apiRequest = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      script.remove();
      apiRequest = null;
      reject(new Error("Der Spotify-Player konnte nicht geladen werden."));
    }, 15_000);
    window.onSpotifyIframeApiReady = api => {
      window.clearTimeout(timer);
      resolve(api);
    };
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      apiRequest = null;
      reject(new Error("Der Spotify-Player konnte nicht geladen werden. Bitte Verbindung oder Inhaltsblocker prüfen."));
    };
    document.body.appendChild(script);
  });
  return apiRequest;
}

export async function mountSpotifyEmbed(element: HTMLElement, trackId: string): Promise<() => void> {
  useSpotifyStore.setState({ isConnecting: true, isConnected: false, isReady: false, isPlaying: false, error: "" });
  const api = await loadSpotifyIframeApi();
  let disposed = false;
  let mounted: EmbedController | null = null;

  api.createController(element, {
    uri: `spotify:track:${trackId}`,
    width: "100%",
    height: 80,
  }, controller => {
    if (disposed) {
      controller.destroy();
      return;
    }
    mounted = controller;
    activeController?.destroy();
    activeController = controller;
    controller.addListener("ready", () => {
      if (controller === activeController) {
        useSpotifyStore.setState({ isConnecting: false, isConnected: true, isReady: true, error: "" });
      }
    });
    controller.addListener("playback_started", () => {
      if (controller === activeController) useSpotifyStore.setState({ isPlaying: true, error: "" });
    });
    controller.addListener("playback_update", event => {
      if (controller !== activeController || !event.data) return;
      const ended = typeof event.data.duration === "number" && event.data.duration > 0 && event.data.position === event.data.duration;
      useSpotifyStore.setState({ isPlaying: !event.data.isPaused && !event.data.isBuffering && !ended });
    });
  });

  return () => {
    disposed = true;
    if (mounted === activeController) activeController = null;
    mounted?.destroy();
    useSpotifyStore.setState({ isConnecting: false, isConnected: false, isReady: false, isPlaying: false });
  };
}

export function playSpotifyEmbed() {
  if (!activeController) {
    useSpotifyStore.setState({ error: "Spotify wird noch geladen. Bitte gleich noch einmal klicken." });
    return;
  }
  activeController.play();
}

export function pauseSpotifyEmbed() {
  activeController?.pause();
  useSpotifyStore.setState({ isPlaying: false });
}
