import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-card border bg-surface-card px-4 text-base text-ink transition-colors " +
  "placeholder:text-ink-muted/60 outline-none focus-visible:border-brand-gold";

function borderFor(invalid?: boolean) {
  // #b42318 is a functional error color (semantic, separate from the accent).
  return invalid ? "border-[#b42318]" : "border-border";
}

/** Labeled field wrapper with hint + error message. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-[#b42318]" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-ink-muted">{hint}</p>}
      {error && (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(controlBase, borderFor(invalid), "h-12", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(controlBase, borderFor(invalid), "min-h-32 resize-y py-3", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(controlBase, borderFor(invalid), "h-12 appearance-none pr-10", className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}
