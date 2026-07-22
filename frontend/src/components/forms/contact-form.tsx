"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { postJson } from "@/lib/api";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };
    const res = await postJson("/contact", body);
    setSubmitting(false);
    if (res.ok) setDone(true);
    else
      setError(
        res.status === 429
          ? "Too many submissions just now. Please wait a minute and try again."
          : "Something went wrong. Please try again, or reach us directly.",
      );
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="size-12 text-brand-green" strokeWidth={1.5} />
        <h3 className="text-h4">Message sent</h3>
        <p className="text-base text-ink-muted">Thank you for reaching out. We will get back to you soon.</p>
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
        <Field label="Subject" htmlFor="subject" hint="Optional">
          <Input id="subject" name="subject" maxLength={200} />
        </Field>
      </div>
      <Field label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" required maxLength={5000} />
      </Field>

      {error && (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send message"}
        </Button>
      </div>
    </form>
  );
}
