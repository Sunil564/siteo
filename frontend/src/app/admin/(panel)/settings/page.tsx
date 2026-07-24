"use client";

import { useEffect, useState } from "react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { getSettings, updateSettings, type Settings } from "@/lib/admin";
import { cn } from "@/lib/utils";

type ToggleKey = keyof Settings;

const ITEMS: { key: ToggleKey; title: string; body: string }[] = [
  {
    key: "registration_open_global",
    title: "Registration open",
    body: "Master switch for event registration across the whole site. Turn off to pause all sign-ups at once.",
  },
  {
    key: "whatsapp_enabled",
    title: "WhatsApp confirmations",
    body: "Send transactional WhatsApp messages (event and enquiry confirmations). Requires approved templates and Cloud API credentials; while off, sends are skipped cleanly.",
  },
  {
    key: "payments_enabled",
    title: "Paid registration (Razorpay)",
    body: "Enable the paid-event checkout path. Requires Razorpay keys configured on the server. Off for now.",
  },
];

function Switch({ on, disabled, onClick }: { on: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        on ? "bg-brand-green" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null | "loading">("loading");
  const [busy, setBusy] = useState<ToggleKey | null>(null);

  useEffect(() => {
    getSettings().then((s) => setSettings(s));
  }, []);

  async function toggle(key: ToggleKey) {
    if (settings === "loading" || settings === null) return;
    setBusy(key);
    const next = !settings[key];
    const updated = await updateSettings({ [key]: next });
    setBusy(null);
    if (updated) setSettings(updated);
  }

  return (
    <>
      <AdminHeader title="Settings" subtitle="Feature toggles and kill switches." />
      {settings === "loading" ? (
        <AdminEmpty message="Loading..." />
      ) : settings === null ? (
        <AdminEmpty message="Could not load settings." />
      ) : (
        <div className="flex flex-col gap-4">
          {ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-6 rounded-card border border-border bg-surface-card p-5"
            >
              <div>
                <h2 className="text-base font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 max-w-xl text-sm text-ink-muted">{item.body}</p>
              </div>
              <Switch on={settings[item.key]} disabled={busy === item.key} onClick={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
