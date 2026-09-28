import type { BackgroundId, DesignId, TapeShellId, TextColorId, TextFontId } from "./tapeOptions";

export type TapeDesign = {
  spotifyTrackId: string;
  message: string;
  tapeShellId: TapeShellId;
  backgroundId: BackgroundId;
  backgroundColor: string | null;
  designId: DesignId;
  textColorId: TextColorId;
  textFontId: TextFontId;
  pageBackgroundColor: string;
};

export type SharedTape = TapeDesign & {
  schemaVersion: 6;
};
