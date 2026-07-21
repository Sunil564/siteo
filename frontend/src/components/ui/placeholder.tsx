import Image from "next/image";
import { Building2, CalendarDays, Images as GalleryIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASPECT_CLASS, type ImageSlot } from "@/lib/images";

const KIND_ICON = {
  event: CalendarDays,
  people: Users,
  building: Building2,
  gallery: GalleryIcon,
} as const;

/**
 * The single image component (§6/§10). Renders a real image when the slot has a
 * `src`, otherwise an intentional branded placeholder: green-tinted field,
 * centred gold line-icon by content type, optional caption. Aspect ratio is
 * fixed so swapping in a real photo causes zero layout shift.
 */
export function Placeholder({
  slot,
  caption,
  className,
  rounded = true,
  priority = false,
  onDark = false,
}: {
  slot: ImageSlot;
  caption?: string;
  className?: string;
  rounded?: boolean;
  priority?: boolean;
  /** Styling for placement on a green/dark surface (e.g. the hero). */
  onDark?: boolean;
}) {
  const Icon = KIND_ICON[slot.kind];
  const shape = cn(ASPECT_CLASS[slot.ratio], rounded && "rounded-card", "overflow-hidden");

  if (slot.src) {
    return (
      <div className={cn("relative w-full", shape, className)}>
        <Image src={slot.src} alt={slot.alt} fill priority={priority} className="object-cover" />
      </div>
    );
  }

  const tintColor = onDark ? "var(--surface)" : "var(--brand-green)";

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-3 border",
        onDark ? "border-surface/20 bg-surface/[0.06]" : "border-border bg-brand-green/[0.04]",
        shape,
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at center, color-mix(in srgb, ${tintColor} ${
          onDark ? "12%" : "8%"
        }, transparent) 1px, transparent 1.4px)`,
        backgroundSize: "16px 16px",
      }}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full text-brand-gold",
          onDark ? "bg-surface/10" : "bg-brand-green/10",
        )}
      >
        <Icon className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      {caption && (
        <span
          className={cn(
            "max-w-[80%] text-center text-sm",
            onDark ? "text-surface/70" : "text-ink-muted",
          )}
        >
          {caption}
        </span>
      )}
    </div>
  );
}
