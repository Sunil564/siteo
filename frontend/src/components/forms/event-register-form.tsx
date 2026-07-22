"use client";

import { useState } from "react";
import { CheckCircle2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";
import { postJson, type CustomFieldSpec } from "@/lib/api";

type Result = {
  ref_id: string;
  status: string;
  event_title: string;
  confirmation_message: string | null;
  join_link: string | null;
  whatsapp_sent: boolean;
};

export function EventRegisterForm({
  slug,
  customFields,
}: {
  slug: string;
  customFields: CustomFieldSpec[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const answers: Record<string, string> = {};
    for (const spec of customFields) {
      const v = String(form.get(spec.label) ?? "").trim();
      if (v) answers[spec.label] = v;
    }
    const body = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      custom_field_answers: answers,
    };

    const res = await postJson<Result>(`/events/${encodeURIComponent(slug)}/register`, body);
    setSubmitting(false);
    if (res.ok) {
      setDone(res.data);
      return;
    }
    if (res.status === 409) {
      setError("Registration is closed or this event is full.");
    } else if (res.status === 422) {
      setError("Please check your answers and try again.");
    } else {
      setError("Something went wrong. Please try again in a moment.");
    }
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-8 text-brand-green" strokeWidth={1.75} />
          <h3 className="text-h4">You are registered</h3>
        </div>
        <p className="text-base text-ink-muted">
          Reference: <span className="font-semibold text-brand-green">{done.ref_id}</span>
        </p>
        {done.confirmation_message && (
          <p className="text-base text-ink-muted">{done.confirmation_message}</p>
        )}
        {done.join_link && (
          <a
            href={done.join_link}
            className="inline-flex w-fit items-center gap-2 rounded-card bg-brand-green px-4 py-3 text-base font-medium text-surface hover:bg-brand-green-light"
          >
            <Video className="size-4" /> Join link
          </a>
        )}
        {done.whatsapp_sent && (
          <p className="text-sm text-ink-muted">A confirmation has been sent to your WhatsApp.</p>
        )}
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Full name" htmlFor="name" required>
        <Input id="name" name="name" required maxLength={150} autoComplete="name" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" required hint="Your WhatsApp number">
          <Input id="phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" />
        </Field>
        <Field label="Email" htmlFor="email" hint="Optional">
          <Input id="email" name="email" type="email" maxLength={255} autoComplete="email" />
        </Field>
      </div>

      {customFields.map((spec, i) => {
        const id = `cf_${i}`;
        if (spec.type === "select") {
          return (
            <Field key={spec.label} label={spec.label} htmlFor={id} required={spec.required}>
              <Select id={id} name={spec.label} required={spec.required} defaultValue="">
                <option value="" disabled>
                  Select...
                </option>
                {(spec.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>
          );
        }
        const type = spec.type === "email" ? "email" : spec.type === "tel" ? "tel" : "text";
        return (
          <Field key={spec.label} label={spec.label} htmlFor={id} required={spec.required}>
            <Input id={id} name={spec.label} type={type} required={spec.required} maxLength={1000} />
          </Field>
        );
      })}

      {error && (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </Button>
      </div>
    </form>
  );
}
