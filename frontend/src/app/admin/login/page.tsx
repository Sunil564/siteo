"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { login } from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"creds" | "totp">("creds");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await login(username, password, step === "totp" ? code : undefined);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.status === 401 ? "Invalid credentials. Please try again." : "Sign in failed. Please try again.");
      return;
    }
    if (res.data.totp_required) {
      setStep("totp");
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/siteo-logo.jpg" alt="SITEO" width={1600} height={400} priority className="h-9 w-auto" />
        </div>
        <div className="rounded-card border border-border bg-surface-card p-8">
          <h1 className="text-h4 text-brand-green">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {step === "creds" ? "Enter your admin credentials." : "Enter the 6-digit code from your authenticator."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
            {step === "creds" ? (
              <>
                <Field label="Username" htmlFor="username" required>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </Field>
                <Field label="Password" htmlFor="password" required>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Field>
              </>
            ) : (
              <Field label="Authentication code" htmlFor="code" required>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </Field>
            )}

            {error && (
              <p className="text-sm text-[#b42318]" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : step === "creds" ? "Continue" : "Verify"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
