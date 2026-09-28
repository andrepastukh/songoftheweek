import type { BackgroundId, DesignId, TapeShellId, TextColorId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  tapeShellId: TapeShellId;
  backgroundId: BackgroundId;
  backgroundColor: string | null;
  designId: DesignId;
  textColorId: TextColorId;
  pageBackgroundColor: string;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 5;
};
