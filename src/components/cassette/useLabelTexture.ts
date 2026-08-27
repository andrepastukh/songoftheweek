import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

type LabelTextureInput = {
  title: string;
  artist: string;
  senderName: string;
  message: string;
};

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, min: number, family: string, weight = 600) {
  let size = start;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export function useLabelTexture({ title, artist, senderName, message }: LabelTextureInput) {
  const [fontRevision, setFontRevision] = useState(0);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontRevision((value) => value + 1)).catch(() => undefined);
  }, []);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 410;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#eee6cf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < 2600; index += 1) {
      const x = (index * 73) % canvas.width;
      const y = (index * 151) % canvas.height;
      const light = index % 3 === 0;
      ctx.fillStyle = light ? "rgba(255,255,255,.07)" : "rgba(73,61,35,.035)";
      ctx.fillRect(x, y, 1 + (index % 2), 1);
    }

    ctx.strokeStyle = "rgba(71,63,43,.18)";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = "rgba(40,39,32,.62)";
    ctx.font = '600 22px "DM Sans", Arial, sans-serif';
    ctx.letterSpacing = "5px";
    ctx.fillText("SIDE A / WEEKLY TAPE", 54, 52);
    ctx.textAlign = "right";
    ctx.fillText("90", canvas.width - 54, 52);
    ctx.textAlign = "left";
    ctx.letterSpacing = "0px";

    const safeTitle = title || "Untitled";
    const titleSize = fitFont(ctx, safeTitle, 1270, 76, 42, '"DM Sans", Arial, sans-serif');
    ctx.font = `600 ${titleSize}px "DM Sans", Arial, sans-serif`;
    ctx.fillStyle = "#272821";
    ctx.fillText(safeTitle, 54, 132);

    ctx.font = '600 28px "DM Sans", Arial, sans-serif';
    ctx.fillStyle = "rgba(40,40,33,.64)";
    ctx.fillText((artist || "Unknown artist").toUpperCase(), 57, 174);

    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = "rgba(73,66,48,.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(54, 198);
    ctx.lineTo(canvas.width - 54, 198);
    ctx.stroke();
    ctx.setLineDash([]);

    const note = message || "Ein Song für dich.";
    let noteSize = 49;
    let lines: string[] = [];
    do {
      ctx.font = `500 ${noteSize}px "Caveat", "Segoe Print", cursive`;
      lines = wrapText(ctx, note, 960);
      noteSize -= 2;
    } while (lines.length > 3 && noteSize > 23);

    ctx.font = `500 ${Math.max(noteSize + 2, 23)}px "Caveat", "Segoe Print", cursive`;
    ctx.fillStyle = "#33332b";
    lines.slice(0, 3).forEach((line, index) => ctx.fillText(line, 58, 258 + index * 48));

    ctx.textAlign = "right";
    const sender = `from ${senderName || "jemandem"}`;
    const senderSize = fitFont(ctx, sender, 300, 38, 25, '"Caveat", "Segoe Print", cursive', 500);
    ctx.font = `500 ${senderSize}px "Caveat", "Segoe Print", cursive`;
    ctx.fillText(sender, canvas.width - 58, 356);

    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.minFilter = LinearFilter;
    result.magFilter = LinearFilter;
    result.anisotropy = 8;
    result.needsUpdate = true;
    return result;
  }, [artist, fontRevision, message, senderName, title]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}
