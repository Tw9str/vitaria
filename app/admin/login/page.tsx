"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Alert from "@/components/shared/Alert";
import Spinner from "@/components/shared/Spinner";
import { loginSchema } from "@/lib/validators";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Verification:
    "This sign-in link has expired or already been used. Please request a new one.",
  AccessDenied: "You don't have permission to access the admin panel.",
  Configuration:
    "There is a server configuration error. Please contact support.",
  Default: "Something went wrong. Please try again.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const authErrorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default)
    : null;
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(authErrorMessage);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);
    setError(null);

    // Client-side Zod validation
    const parsed = loginSchema.safeParse({ email: email.trim().toLowerCase() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email.");
      return;
    }

    start(async () => {
      const res = await signIn("resend", {
        email: parsed.data.email,
        callbackUrl: "/admin",
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setSent(false);
        return;
      }

      setSent(true);
    });
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-soft">
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-500/25 bg-green-500/10">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-text">
              Check your inbox
            </h2>
            <p className="mt-2 max-w-[36ch] text-sm text-muted">
              A sign-in link was sent to <strong>{email}</strong>. Click it to
              access the admin panel.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              className="mt-5 text-sm text-subtle underline-offset-2 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h1 className="text-2xl font-semibold">Admin sign in</h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email to receive a magic link.
            </p>

            <div className="mt-5">
              <input
                className="w-full rounded-2xl border border-border bg-black/10 px-4 py-3 outline-none focus:border-brand-ink/60 focus:ring-4 focus:ring-brand-ink/15"
                type="email"
                name="email"
                value={email}
                placeholder="admin@vitaria.com"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
              />
            </div>

            {error && (
              <Alert variant="error" className="mt-3">
                {error}
              </Alert>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-ink px-5 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-70 cursor-pointer"
            >
              {pending && <Spinner className="h-4 w-4" />}
              {pending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
export default function AdminLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
