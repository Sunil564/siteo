"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { EventForm } from "@/components/admin/event-form";
import { getAdminEvent, updateEvent, type AdminEvent, type EventInput } from "@/lib/admin";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const [event, setEvent] = useState<AdminEvent | null | "loading">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminEvent(id).then((e) => setEvent(e));
  }, [id]);

  async function submit(input: EventInput) {
    setSubmitting(true);
    setError(null);
    const res = await updateEvent(id, input);
    setSubmitting(false);
    if (res.ok) router.push("/admin/events");
    else setError(typeof res.detail === "string" ? res.detail : "Could not save changes. Please check the fields.");
  }

  if (event === "loading") return <AdminEmpty message="Loading..." />;
  if (event === null) return <AdminEmpty message="Event not found." />;

  return (
    <>
      <AdminHeader
        title="Edit event"
        subtitle={event.title}
        actions={
          <Link href={`/admin/events/${id}/registrations`} className="text-sm font-medium text-brand-green hover:underline">
            Registrations ({event.registration_count ?? 0})
          </Link>
        }
      />
      <EventForm initial={event} submitting={submitting} error={error} submitLabel="Save changes" onSubmit={submit} />
    </>
  );
}
