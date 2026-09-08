import type { BackgroundId, DesignId, PageBackgroundId, TextColorId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  backgroundId: BackgroundId;
  designId: DesignId;
  textColorId: TextColorId;
  pageBackgroundId: PageBackgroundId;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 2;
};
