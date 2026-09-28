import type { BackgroundId, DesignId, PageBackgroundId, TextColorId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  backgroundId: BackgroundId;
  backgroundColor: string | null;
  designId: DesignId;
  textColorId: TextColorId;
  pageBackgroundId: PageBackgroundId;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 3;
};
