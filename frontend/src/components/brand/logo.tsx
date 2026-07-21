import { cn } from "@/lib/utils";

/**
 * SITEO wordmark, recreated as SVG from the source mark (five equal color
 * blocks, white letters). SVG so it scales crisply and can render monochrome
 * for dense UI while full color is reserved for hero moments.
 *
 * Shared block data also drives the Preloader.
 */
export const LOGO_BLOCKS = [
  { letter: "S", colorVar: "var(--logo-s)" },
  { letter: "I", colorVar: "var(--logo-i)" },
  { letter: "T", colorVar: "var(--logo-t)" },
  { letter: "E", colorVar: "var(--logo-e)" },
  { letter: "O", colorVar: "var(--logo-o)" },
] as const;

const BLOCK = 100; // logical unit per block in the viewBox
const LETTER_STYLE = {
  fontFamily: "var(--font-inter), Arial, sans-serif",
  fontWeight: 800,
  fontSize: 64,
} as const;

type Props = {
  variant?: "color" | "mono";
  /** mono only: which single color to use. */
  tone?: "green" | "white";
  className?: string;
};

export function SiteoLogo({ variant = "color", tone = "green", className }: Props) {
  const width = BLOCK * LOGO_BLOCKS.length;
  const monoColor = tone === "white" ? "var(--surface)" : "var(--brand-green)";

  return (
    <svg
      viewBox={`0 0 ${width} ${BLOCK}`}
      role="img"
      aria-label="SITEO"
      className={cn("block h-auto", className)}
    >
      <title>SITEO</title>
      {LOGO_BLOCKS.map((b, i) => {
        const x = i * BLOCK;
        const cx = x + BLOCK / 2;
        if (variant === "color") {
          return (
            <g key={b.letter}>
              <rect x={x} y={0} width={BLOCK} height={BLOCK} fill={b.colorVar} />
              <text
                x={cx}
                y={BLOCK / 2}
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="central"
                style={LETTER_STYLE}
              >
                {b.letter}
              </text>
            </g>
          );
        }
        return (
          <text
            key={b.letter}
            x={cx}
            y={BLOCK / 2}
            fill={monoColor}
            textAnchor="middle"
            dominantBaseline="central"
            style={LETTER_STYLE}
          >
            {b.letter}
          </text>
        );
      })}
    </svg>
  );
}
