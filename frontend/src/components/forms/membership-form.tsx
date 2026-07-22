"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { postJson } from "@/lib/api";

type Result = { ok: boolean; whatsapp_sent: boolean };

export function MembershipForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      category: String(form.get("category") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };
    const res = await postJson<Result>("/membership", body);
    setSubmitting(false);
    if (res.ok) setDone(res.data);
    else
      setError(
        res.status === 429
          ? "Too many submissions just now. Please wait a minute and try again."
          : "Something went wrong. Please try again, or contact us directly.",
      );
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="size-12 text-brand-green" strokeWidth={1.5} />
        <h3 className="text-h4">Thank you for your interest</h3>
        <p className="text-base text-ink-muted">
          We have received your details and will be in touch soon.
        </p>
        {done.whatsapp_sent && (
          <p className="text-sm text-ink-muted">A confirmation has been sent to your WhatsApp.</p>
        )}
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" required maxLength={150} autoComplete="name" />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" hint="Optional">
          <Input id="email" name="email" type="email" maxLength={255} autoComplete="email" />
        </Field>
        <Field label="City" htmlFor="city" hint="Optional">
          <Input id="city" name="city" maxLength={120} autoComplete="address-level2" />
        </Field>
      </div>
      <Field label="Area of interest" htmlFor="category" hint="Optional (e.g. business, education, welfare)">
        <Input id="category" name="category" maxLength={80} />
      </Field>
      <Field label="Message" htmlFor="message" hint="Optional">
        <Textarea id="message" name="message" maxLength={5000} />
      </Field>

      {error && (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Register interest"}
        </Button>
      </div>
    </form>
  );
}
