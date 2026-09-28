export const BACKGROUND_OPTIONS = [
  { id: "white", label: "Weiß", color: "#f6f1ec", src: "/assets/tape/background_color/background_color_weiss.png" },
  { id: "beige", label: "Beige", color: "#f6ead3", src: "/assets/tape/background_color/background_color_beige.png" },
  { id: "gray", label: "Grau", color: "#777e85", src: "/assets/tape/background_color/background_color_grau.png" },
  { id: "dark-gray", label: "Dunkelgrau", color: "#35393c", src: "/assets/tape/background_color/background_color_dunkel_grau.png" },
  { id: "cyan", label: "Cyan", color: "#3da197", src: "/assets/tape/background_color/background_color_cyan.png" },
  { id: "light-blue", label: "Hellblau", color: "#72a0bd", src: "/assets/tape/background_color/background_color_hellblau.png" },
  { id: "dark-blue", label: "Dunkelblau", color: "#184258", src: "/assets/tape/background_color/background_color_dunkelblau.png" },
  { id: "green", label: "Grün", color: "#759e5d", src: "/assets/tape/background_color/background_color_grun.png" },
  { id: "light-purple", label: "Helllila", color: "#646cad", src: "/assets/tape/background_color/background_color_helllila.png" },
  { id: "light-red", label: "Hellrot", color: "#c12833", src: "/assets/tape/background_color/background_color_hellrot.png" },
  { id: "light-red-2", label: "Hellrot 2", color: "#bf5b5b", src: "/assets/tape/background_color/background_color_hellrot2.png" },
  { id: "dark-red", label: "Dunkelrot", color: "#811818", src: "/assets/tape/background_color/background_color_dunkelrot.png" },
  { id: "orange", label: "Orange", color: "#e07029", src: "/assets/tape/background_color/background_color_orange.png" },
  { id: "orange-2", label: "Orange 2", color: "#b86441", src: "/assets/tape/background_color/background_color_orange2.png" },
] as const;

export const TAPE_SHELL_OPTIONS = [
  { id: "standard", label: "Standard" },
  { id: "white", label: "Weiß" },
] as const;

export const DESIGN_OPTIONS = [
  { id: "none", label: "Kein Design", src: null },
  { id: "lines", label: "Linien", src: "/assets/tape/design/LinienDesign.png" },
  { id: "lines-3", label: "Linien 3", src: "/assets/tape/design/LinienDesign3.png" },
  { id: "lines-4", label: "Linien 4", src: "/assets/tape/design/LinienDesign4.png" },
  { id: "lines-gray", label: "Linien Grau", src: "/assets/tape/design/LinienDesignGrau.png" },
  { id: "lines-green", label: "Linien Grün", src: "/assets/tape/design/LinienDesignGreen.png" },
  { id: "lines-orange", label: "Linien Orange", src: "/assets/tape/design/LinienDesignOrangev2.png" },
  { id: "pattern", label: "Pattern", src: "/assets/tape/design/PatternDesign.png" },
  { id: "herbs", label: "Herbst", src: "/assets/tape/design/HerbsDesign.png" },
  { id: "herbs-dark", label: "Herbst dunkel", src: "/assets/tape/design/HerbsDarkDesign.png" },
  { id: "art", label: "Art", src: "/assets/tape/design/ArtDesign.png" },
  { id: "art-2", label: "Art 2", src: "/assets/tape/design/ArtDesign2.png" },
  { id: "art-3", label: "Art 3", src: "/assets/tape/design/ArtDesign3.png" },
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
  {
    id: "paper", label: "Papier", color: "#ece7dc", halftone: "#3e4038",
    ink: "#20231f", muted: "#74756c", panel: "rgba(242, 238, 228, .88)", control: "rgba(255, 255, 255, .32)", brandFilter: "none",
  },
  {
    id: "grey", label: "Grau", color: "#6c757d", halftone: "#aeb6bd",
    ink: "#fffaf0", muted: "#fffaf0", panel: "rgba(76, 84, 91, .9)", control: "rgba(255, 255, 255, .1)", brandFilter: "invert(1)",
  },
  {
    id: "green", label: "Grün", color: "#84a98c", halftone: "#46634e",
    ink: "#17231a", muted: "#344c39", panel: "rgba(151, 181, 157, .9)", control: "rgba(255, 255, 255, .2)", brandFilter: "none",
  },
  {
    id: "dusty-pink", label: "Altrosa", color: "#d9b8af", halftone: "#70463e",
    ink: "#2b1d1a", muted: "#654941", panel: "rgba(226, 199, 191, .9)", control: "rgba(255, 255, 255, .22)", brandFilter: "none",
  },
] as const;

export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number]["id"];
export type TapeShellId = (typeof TAPE_SHELL_OPTIONS)[number]["id"];
export type DesignId = (typeof DESIGN_OPTIONS)[number]["id"];
export type TextColorId = (typeof TEXT_COLOR_OPTIONS)[number]["id"];
export type PageBackgroundId = (typeof PAGE_BACKGROUND_OPTIONS)[number]["id"];

export const DEFAULT_BACKGROUND_ID: BackgroundId = "white";
export const DEFAULT_TAPE_SHELL_ID: TapeShellId = "standard";
export const DEFAULT_DESIGN_ID: DesignId = "lines-3";
export const DEFAULT_TEXT_COLOR_ID: TextColorId = "black";
export const DEFAULT_PAGE_BACKGROUND_ID: PageBackgroundId = "paper";
export const DEFAULT_PAGE_BACKGROUND_COLOR = PAGE_BACKGROUND_OPTIONS.find(
  (option) => option.id === DEFAULT_PAGE_BACKGROUND_ID,
)?.color ?? "#ece7dc";

export function isBackgroundId(value: unknown): value is BackgroundId {
  return BACKGROUND_OPTIONS.some((option) => option.id === value);
}

export function isTapeShellId(value: unknown): value is TapeShellId {
  return TAPE_SHELL_OPTIONS.some((option) => option.id === value);
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
