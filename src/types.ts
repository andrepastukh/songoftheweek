import type { BackgroundId, DesignId, TextColorId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  backgroundId: BackgroundId;
  designId: DesignId;
  textColorId: TextColorId;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 1;
};
