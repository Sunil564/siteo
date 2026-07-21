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
}: {
  slot: ImageSlot;
  caption?: string;
  className?: string;
  rounded?: boolean;
  priority?: boolean;
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

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-3 border border-border bg-brand-green/[0.04]",
        shape,
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at center, color-mix(in srgb, var(--brand-green) 8%, transparent) 1px, transparent 1.4px)",
        backgroundSize: "16px 16px",
      }}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-green/10 text-brand-gold">
        <Icon className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      {caption && (
        <span className="max-w-[80%] text-center text-sm text-ink-muted">{caption}</span>
      )}
    </div>
  );
}
