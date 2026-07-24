"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import type { AdminEvent, CustomField, EventInput, EventMode } from "@/lib/admin";

// datetime-local <-> ISO, treating the input as Asia/Kolkata wall-clock time.
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}
const localInputToIso = (v: string) => `${v}:00+05:30`;

type FieldRow = { label: string; type: CustomField["type"]; required: boolean; options: string };

export function EventForm({
  initial,
  submitting,
  error,
  submitLabel,
  onSubmit,
}: {
  initial?: AdminEvent;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (input: EventInput) => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    banner_image: initial?.banner_image ?? "",
    starts_at: initial ? isoToLocalInput(initial.starts_at) : "",
    ends_at: initial?.ends_at ? isoToLocalInput(initial.ends_at) : "",
    mode: (initial?.mode ?? "virtual") as EventMode,
    location: initial?.location ?? "",
    join_link: initial?.join_link ?? "",
    capacity: initial?.capacity != null ? String(initial.capacity) : "",
    registration_open: initial?.registration_open ?? true,
    is_published: initial?.is_published ?? false,
    is_paid: initial?.is_paid ?? false,
    price: initial?.price != null ? String(initial.price) : "",
    confirmation_message: initial?.confirmation_message ?? "",
  });
  const [fields, setFields] = useState<FieldRow[]>(
    (initial?.custom_fields ?? []).map((f) => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: (f.options ?? []).join(", "),
    })),
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const custom_fields: CustomField[] = fields
      .filter((f) => f.label.trim())
      .map((f) => ({
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        options:
          f.type === "select"
            ? f.options.split(",").map((o) => o.trim()).filter(Boolean)
            : null,
      }));
    onSubmit({
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || null,
      banner_image: form.banner_image.trim() || null,
      starts_at: localInputToIso(form.starts_at),
      ends_at: form.ends_at ? localInputToIso(form.ends_at) : null,
      mode: form.mode,
      location: form.location.trim() || null,
      join_link: form.join_link.trim() || null,
      capacity: form.capacity ? Number(form.capacity) : null,
      registration_open: form.registration_open,
      is_published: form.is_published,
      is_paid: form.is_paid,
      price: form.is_paid && form.price ? Number(form.price) : null,
      custom_fields,
      confirmation_message: form.confirmation_message.trim() || null,
    });
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Title" htmlFor="title" required>
        <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={200} />
      </Field>
      <Field label="Slug" htmlFor="slug" hint="Leave blank to generate from the title">
        <Input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Field label="Banner image URL" htmlFor="banner" hint="Paste a URL for now; uploads come later">
        <Input id="banner" value={form.banner_image} onChange={(e) => set("banner_image", e.target.value)} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts (IST)" htmlFor="starts" required>
          <Input id="starts" type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} required />
        </Field>
        <Field label="Ends (IST)" htmlFor="ends" hint="Optional">
          <Input id="ends" type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Mode" htmlFor="mode">
          <Select id="mode" value={form.mode} onChange={(e) => set("mode", e.target.value as EventMode)}>
            <option value="virtual">Virtual</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </Field>
        <Field label="Capacity" htmlFor="capacity" hint="Blank = unlimited">
          <Input id="capacity" type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </Field>
      </div>

      {form.mode !== "virtual" && (
        <Field label="Location" htmlFor="location">
          <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
      )}
      {form.mode !== "in_person" && (
        <Field label="Join link" htmlFor="join" hint="Revealed to registrants on confirmation">
          <Input id="join" value={form.join_link} onChange={(e) => set("join_link", e.target.value)} />
        </Field>
      )}

      {/* Custom fields builder */}
      <div className="rounded-card border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Registration questions</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setFields((f) => [...f, { label: "", type: "text", required: false, options: "" }])}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No extra questions. Name, phone, and email are always collected.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {fields.map((f, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-card bg-surface p-3">
                <input
                  aria-label="Question label"
                  placeholder="Question"
                  value={f.label}
                  onChange={(e) => setFields((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  className="h-10 flex-1 rounded-card border border-border bg-surface-card px-3 text-sm"
                />
                <select
                  aria-label="Type"
                  value={f.type}
                  onChange={(e) => setFields((arr) => arr.map((x, j) => (j === i ? { ...x, type: e.target.value as CustomField["type"] } : x)))}
                  className="h-10 rounded-card border border-border bg-surface-card px-2 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="select">Choice</option>
                  <option value="tel">Phone</option>
                  <option value="email">Email</option>
                </select>
                {f.type === "select" && (
                  <input
                    aria-label="Options"
                    placeholder="Options, comma-separated"
                    value={f.options}
                    onChange={(e) => setFields((arr) => arr.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))}
                    className="h-10 flex-1 rounded-card border border-border bg-surface-card px-3 text-sm"
                  />
                )}
                <label className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => setFields((arr) => arr.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))}
                  />
                  Required
                </label>
                <button type="button" aria-label="Remove question" onClick={() => setFields((arr) => arr.filter((_, j) => j !== i))} className="text-ink-muted hover:text-[#b42318]">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Field label="Confirmation message" htmlFor="confirm" hint="Shown on the confirmation page and in the WhatsApp message">
        <Textarea id="confirm" value={form.confirmation_message} onChange={(e) => set("confirmation_message", e.target.value)} />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.registration_open} onChange={(e) => set("registration_open", e.target.checked)} />
          Registration open
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} />
          Published (visible on the site)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.is_paid} onChange={(e) => set("is_paid", e.target.checked)} />
          Paid event
        </label>
      </div>
      {form.is_paid && (
        <Field label="Price (in paise)" htmlFor="price" hint="100 paise = 1 rupee. Paid checkout is dormant until payments are enabled.">
          <Input id="price" type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
      )}

      {error && <p className="text-sm text-[#b42318]" role="alert">{error}</p>}
      <div>
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
