import type { BackgroundId, DesignId, TextColorId } from "./tapeOptions";

export type SharedTape = {
  spotifyTrackId: string;
  message: string;
  backgroundId: BackgroundId;
  designId: DesignId;
  textColorId: TextColorId;
};
