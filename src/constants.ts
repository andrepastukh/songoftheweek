import type { TapeColorId, TrackMetadata } from "./types";

export const DEMO_TRACK: TrackMetadata = {
  id: "demo-midnight-drive",
  title: "Midnight Drive",
  artist: "The Weekenders",
  durationMs: 228_000,
};

export const TAPE_COLORS: Array<{
  id: TapeColorId;
  label: string;
  shell: string;
  shadow: string;
  ink: "light" | "dark";
}> = [
  { id: "butter", label: "Warm cream", shell: "#d8c795", shadow: "#9e8c5e", ink: "dark" },
  { id: "tangerine", label: "Dusty orange", shell: "#d66c3f", shadow: "#8d3d25", ink: "dark" },
  { id: "brick", label: "Muted red", shell: "#a94a43", shadow: "#71312d", ink: "light" },
  { id: "moss", label: "Forest green", shell: "#3f6150", shadow: "#273b31", ink: "light" },
  { id: "ocean", label: "Faded blue", shell: "#517083", shadow: "#334957", ink: "light" },
  { id: "lilac", label: "Lavender", shell: "#9c8eaa", shadow: "#655a70", ink: "dark" },
  { id: "graphite", label: "Charcoal", shell: "#1a1a1a", shadow: "#101111", ink: "light" },
];
