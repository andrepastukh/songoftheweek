export const BACKGROUND_OPTIONS = [
  { id: "white", label: "Weiß", src: "/assets/tape/background_color/background_color_weiss.png" },
  { id: "beige", label: "Beige", src: "/assets/tape/background_color/background_color_beige.png" },
  { id: "gray", label: "Grau", src: "/assets/tape/background_color/background_color_grau.png" },
  { id: "dark-gray", label: "Dunkelgrau", src: "/assets/tape/background_color/background_color_dunkel_grau.png" },
  { id: "cyan", label: "Cyan", src: "/assets/tape/background_color/background_color_cyan.png" },
  { id: "light-blue", label: "Hellblau", src: "/assets/tape/background_color/background_color_hellblau.png" },
  { id: "dark-blue", label: "Dunkelblau", src: "/assets/tape/background_color/background_color_dunkelblau.png" },
  { id: "green", label: "Grün", src: "/assets/tape/background_color/background_color_grun.png" },
  { id: "light-purple", label: "Helllila", src: "/assets/tape/background_color/background_color_helllila.png" },
  { id: "light-red", label: "Hellrot", src: "/assets/tape/background_color/background_color_hellrot.png" },
  { id: "light-red-2", label: "Hellrot 2", src: "/assets/tape/background_color/background_color_hellrot2.png" },
  { id: "dark-red", label: "Dunkelrot", src: "/assets/tape/background_color/background_color_dunkelrot.png" },
  { id: "orange", label: "Orange", src: "/assets/tape/background_color/background_color_orange.png" },
  { id: "orange-2", label: "Orange 2", src: "/assets/tape/background_color/background_color_orange2.png" },
] as const;

export const DESIGN_OPTIONS = [
  { id: "lines", label: "Linien", src: "/assets/tape/design/LinienDesign.png" },
  { id: "lines-3", label: "Linien 3", src: "/assets/tape/design/LinienDesign3.png" },
  { id: "pattern", label: "Pattern", src: "/assets/tape/design/PatternDesign.png" },
  { id: "herbs", label: "Herbst", src: "/assets/tape/design/HerbsDesign.png" },
  { id: "herbs-dark", label: "Herbst dunkel", src: "/assets/tape/design/HerbsDarkDesign.png" },
] as const;

export const TEXT_COLOR_OPTIONS = [
  {
    id: "black",
    label: "Schwarz",
    sideTextSrc: "/assets/tape/text/SideATextSchwarz.png",
    bottomTextSrc: "/assets/tape/text/UntenTextSchwarz.png",
  },
  {
    id: "white",
    label: "Weiß",
    sideTextSrc: "/assets/tape/text/SideATextWeiss.png",
    bottomTextSrc: "/assets/tape/text/UntenTextWeiss.png",
  },
] as const;

export const PAGE_BACKGROUND_OPTIONS = [
  { id: "paper", label: "Papier", color: "#ece7dc", halftone: "#3e4038" },
  { id: "butter", label: "Buttergelb", color: "#e5d69e", halftone: "#625b38" },
  { id: "powder-blue", label: "Puderblau", color: "#bfd4d5", halftone: "#385d60" },
  { id: "dusty-pink", label: "Altrosa", color: "#d9b8af", halftone: "#70463e" },
] as const;

export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number]["id"];
export type DesignId = (typeof DESIGN_OPTIONS)[number]["id"];
export type TextColorId = (typeof TEXT_COLOR_OPTIONS)[number]["id"];
export type PageBackgroundId = (typeof PAGE_BACKGROUND_OPTIONS)[number]["id"];

export const DEFAULT_BACKGROUND_ID: BackgroundId = "white";
export const DEFAULT_DESIGN_ID: DesignId = "lines-3";
export const DEFAULT_TEXT_COLOR_ID: TextColorId = "black";
export const DEFAULT_PAGE_BACKGROUND_ID: PageBackgroundId = "paper";

export function isBackgroundId(value: unknown): value is BackgroundId {
  return BACKGROUND_OPTIONS.some((option) => option.id === value);
}

export function isDesignId(value: unknown): value is DesignId {
  return DESIGN_OPTIONS.some((option) => option.id === value);
}

export function isTextColorId(value: unknown): value is TextColorId {
  return TEXT_COLOR_OPTIONS.some((option) => option.id === value);
}

export function isPageBackgroundId(value: unknown): value is PageBackgroundId {
  return PAGE_BACKGROUND_OPTIONS.some((option) => option.id === value);
}
