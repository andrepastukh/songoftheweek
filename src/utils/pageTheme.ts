type Rgb = { r: number; g: number; b: number };

const DARK_INK = { r: 32, g: 35, b: 31 };
const LIGHT_INK = { r: 255, g: 250, b: 240 };

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

function luminance({ r, g, b }: Rgb): number {
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * red + .7152 * green + .0722 * blue;
}

function contrast(first: Rgb, second: Rgb): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + .05) / (darker + .05);
}

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
}

export function buildPageTheme(background: string) {
  const color = hexToRgb(background);
  const useLightInk = contrast(color, LIGHT_INK) > contrast(color, DARK_INK);
  const ink = useLightInk ? LIGHT_INK : DARK_INK;
  const panelTarget = useLightInk ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };

  return {
    color: background,
    halftone: toHex(mix(ink, color, .58)),
    ink: toHex(ink),
    muted: toHex(mix(ink, color, .38)),
    panel: rgba(mix(color, panelTarget, .14), .9),
    control: useLightInk ? "rgba(255, 255, 255, .12)" : "rgba(255, 255, 255, .3)",
    brandFilter: useLightInk ? "invert(1)" : "none",
    usesLightInk: useLightInk,
  };
}
