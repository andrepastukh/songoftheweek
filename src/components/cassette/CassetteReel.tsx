type CassetteReelProps = {
  cx: number;
  cy: number;
  radius: number;
  direction?: "normal" | "reverse";
};

export function CassetteReel({ cx, cy, radius, direction = "normal" }: CassetteReelProps) {
  const slots = Array.from({ length: 8 });
  return (
    <g className={`reel reel--${direction}`} style={{ transformOrigin: `${cx}px ${cy}px` }} filter="url(#reelShadow)">
      <circle cx={cx} cy={cy} r={radius + 5} fill="#080a09" stroke="#242724" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={radius} fill="url(#reelMetalGradient)" stroke="#050606" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={radius * 0.72} fill="#151816" stroke="#343936" strokeWidth="1.5" />
      {slots.map((_, index) => (
        <rect
          key={index}
          x={cx - radius * 0.105}
          y={cy - radius * 0.68}
          width={radius * 0.21}
          height={radius * 0.34}
          rx={radius * 0.075}
          fill="#050606"
          stroke="#464b47"
          strokeWidth="1"
          transform={`rotate(${index * 45} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={radius * 0.3} fill="url(#hubGradient)" stroke="#080a09" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={radius * 0.12} fill="#080a09" stroke="#737771" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={radius - 2} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.4" strokeDasharray="34 16 8 30" />
    </g>
  );
}
