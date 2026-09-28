const MAX_TEXT_SIZE_CQW = 4.35;
const MIN_TEXT_SIZE_CQW = 1.65;
const FULL_SIZE_LENGTH = 24;
const SHRINK_PER_CHARACTER = .017;
const LINE_BREAK_PENALTY = 24;

export function getTapeTextSize(message: string, sizeScale = 1): string {
  const trimmed = message.trim();
  const lineBreaks = Math.max(0, trimmed.split("\n").length - 1);
  const effectiveLength = trimmed.length + lineBreaks * LINE_BREAK_PENALTY;
  const shrinkLength = Math.max(0, effectiveLength - FULL_SIZE_LENGTH);
  const size = Math.max(
    MIN_TEXT_SIZE_CQW,
    Math.min(MAX_TEXT_SIZE_CQW, MAX_TEXT_SIZE_CQW - shrinkLength * SHRINK_PER_CHARACTER),
  );

  return `${(size * sizeScale).toFixed(2)}cqw`;
}
