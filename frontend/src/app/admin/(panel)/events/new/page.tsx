"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { EventForm } from "@/components/admin/event-form";
import { createEvent, type EventInput } from "@/lib/admin";

export default function NewEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: EventInput) {
    setSubmitting(true);
    setError(null);
    const res = await createEvent(input);
    setSubmitting(false);
    if (res.ok) router.push("/admin/events");
    else setError(typeof res.detail === "string" ? res.detail : "Could not create the event. Please check the fields.");
  }

  return (
    <>
      <AdminHeader title="New event" subtitle="Create an event and its registration form." />
      <EventForm submitting={submitting} error={error} submitLabel="Create event" onSubmit={submit} />
    </>
  );
}
