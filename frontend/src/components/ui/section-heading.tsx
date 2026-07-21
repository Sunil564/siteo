import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

/**
 * Standard section header: bilingual gold eyebrow, serif heading, optional lead.
 * `align` centers for feature sections; `onDark` adapts colors for green/archive.
 */
export function SectionHeading({
  eyebrow,
  eyebrowHi,
  title,
  intro,
  align = "left",
  onDark = false,
  className,
}: {
  eyebrow?: string;
  eyebrowHi?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow hi={eyebrowHi} onDark={onDark}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2 className={cn("text-h3 md:text-h2", onDark && "text-surface")}>{title}</h2>
      {intro && (
        <p
          className={cn(
            "max-w-[var(--container-readable)] text-lg",
            align === "center" && "mx-auto",
            onDark ? "text-surface/80" : "text-ink-muted",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
