import type { BackgroundId, DesignId, PageBackgroundId, TapeShellId, TextColorId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  tapeShellId: TapeShellId;
  backgroundId: BackgroundId;
  backgroundColor: string | null;
  designId: DesignId;
  textColorId: TextColorId;
  pageBackgroundId: PageBackgroundId;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 4;
};
