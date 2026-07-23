import { cn } from "@/lib/utils";
import type { EnquiryStatus } from "@/lib/admin";

/** Admin page header: title, optional subtitle, optional right-side actions. */
export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-h3 text-brand-green">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  responded: "bg-sky-100 text-sky-800",
  closed: "bg-slate-200 text-slate-600",
};

const STATUS_LABEL: Record<EnquiryStatus, string> = {
  open: "Open",
  responded: "Responded",
  closed: "Closed",
};

/** Status chip: state encoded in color + label so it reads at a glance. */
export function StatusPill({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Simple empty state for tables. */
export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-dashed border-border py-16 text-center text-ink-muted">
      {message}
    </div>
  );
}
