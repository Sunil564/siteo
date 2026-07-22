import { cn } from "@/lib/utils";

/** Centered content column - 1200px max with 1fr gutters (§5). */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[var(--container-content)] px-6 md:px-8", className)}>
      {children}
    </div>
  );
}
