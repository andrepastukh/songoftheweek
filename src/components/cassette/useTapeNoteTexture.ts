import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

type TapeNoteTextureInput = {
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

export function useTapeNoteTexture({ title, artist, senderName, message }: TapeNoteTextureInput) {
  const [fontRevision, setFontRevision] = useState(0);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontRevision((value) => value + 1)).catch(() => undefined);
  }, []);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1392;
    canvas.height = 845;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#dedcc8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < 7200; index += 1) {
      const x = (index * 73) % canvas.width;
      const y = (index * 151) % canvas.height;
      ctx.fillStyle = index % 4 === 0 ? "rgba(255,255,255,.10)" : "rgba(63,56,38,.045)";
      ctx.fillRect(x, y, 1 + (index % 2), 1);
    }

    ctx.fillStyle = "#d94825";
    ctx.fillRect(0, 384, canvas.width, 22);

    ctx.fillStyle = "rgba(35,35,30,.72)";
    ctx.font = '600 24px "DM Sans", Arial, sans-serif';
    ctx.letterSpacing = "6px";
    ctx.fillText("SIDE A / WEEKLY TAPE", 250, 92);
    ctx.textAlign = "right";
    ctx.fillText("90", canvas.width - 160, 92);
    ctx.textAlign = "left";
    ctx.letterSpacing = "0px";

    const safeTitle = title || "Untitled";
    const titleSize = fitFont(ctx, safeTitle, 860, 66, 40, '"DM Sans", Arial, sans-serif');
    ctx.font = `600 ${titleSize}px "DM Sans", Arial, sans-serif`;
    ctx.fillStyle = "#292a24";
    ctx.fillText(safeTitle, 250, 174);

    ctx.font = '600 29px "DM Sans", Arial, sans-serif';
    ctx.fillStyle = "rgba(39,40,34,.62)";
    ctx.fillText((artist || "Unknown artist").toUpperCase(), 253, 218);

    ctx.strokeStyle = "rgba(56,55,45,.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.lineTo(canvas.width - 160, 250);
    ctx.stroke();

    const note = message || "Ein Song für dich.";
    let noteSize = 52;
    let lines: string[] = [];
    do {
      ctx.font = `500 ${noteSize}px "Caveat", "Segoe Print", cursive`;
      lines = wrapText(ctx, note, 900);
      noteSize -= 2;
    } while (lines.length > 3 && noteSize > 34);

    ctx.font = `500 ${Math.max(noteSize + 2, 34)}px "Caveat", "Segoe Print", cursive`;
    ctx.fillStyle = "#303129";
    lines.slice(0, 3).forEach((line, index) => ctx.fillText(line, 250, 520 + index * 64));

    ctx.textAlign = "right";
    ctx.font = '500 34px "Caveat", "Segoe Print", cursive';
    ctx.fillStyle = "rgba(47,47,40,.76)";
    ctx.fillText(senderName ? `from ${senderName}` : "for you", canvas.width - 160, 650);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }, [artist, fontRevision, message, senderName, title]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}
