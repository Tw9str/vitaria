"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/shared/Spinner";
import Whatsapp from "../icons/Whatsapp";
import Facebook from "../icons/Facebook";
import Mail from "../icons/Mail";
import Alert from "@/components/shared/Alert";
import TurnstileWidget from "@/components/shared/Turnstile";
import { leadSchema } from "@/lib/validators";
import type { LeadInput } from "@/lib/validators";

type Status = "idle" | "sending" | "sent" | "error";
type FieldErrors = Partial<Record<keyof LeadInput, string>>;

export default function Contact({
  turnstileSiteKey,
}: {
  turnstileSiteKey: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const resetTurnstile = useRef<(() => void) | null>(null);

  const handleTurnstileReady = useCallback((reset: () => void) => {
    resetTurnstile.current = reset;
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors(null);
    setError("");

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    // Client-side Zod validation
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors | undefined;
        if (field && !(field in errs)) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        // Reset the widget so the user can try again
        resetTurnstile.current?.();
        setTurnstileToken(null);
        throw new Error(
          payload?.message ?? "Unable to submit. Please try again.",
        );
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <div>
          <h2 className="text-[22px] tracking-[-0.01em]">
            Request wholesale pricing
          </h2>
          <p className="mt-2 max-w-[70ch] text-muted">
            We’ll send the catalog, pricing, and next steps after a quick
            verification.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[18px] border border-border bg-surface shadow-soft">
            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
                {/* checkmark */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/25 bg-green-500/10">
                  <svg
                    className="h-7 w-7 text-green-400"
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

                <h3 className="mt-5 text-lg font-semibold text-text">
                  Inquiry received!
                </h3>
                <p className="mt-2 max-w-[38ch] text-sm text-muted">
                  We'll review your details and send the catalog, pricing, and
                  next steps within one business day.
                </p>

                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:brightness-110"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    name="name"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    error={fieldErrors?.name}
                  />
                  <Input
                    label="Work email"
                    name="email"
                    type="email"
                    placeholder="jane@shop.com"
                    autoComplete="email"
                    error={fieldErrors?.email}
                  />
                  <Input
                    label="Company"
                    name="company"
                    placeholder="Retail Store Co."
                    autoComplete="organization"
                    error={fieldErrors?.company}
                  />
                  <Input
                    label="Website / Marketplace"
                    name="website"
                    placeholder="https://yourstore.com"
                    error={fieldErrors?.website}
                  />

                  <div className="sm:col-span-1">
                    <label
                      className="mb-1.5 block text-xs text-subtle"
                      htmlFor="type"
                    >
                      Business type
                    </label>
                    <select
                      id="type"
                      name="type"
                      defaultValue=""
                      className="w-full rounded-2xl border border-border bg-bg px-3 py-3 text-muted outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15"
                    >
                      <option value="" disabled>
                        Select one
                      </option>
                      <option>Retail store</option>
                      <option>E-commerce</option>
                      <option>Distributor</option>
                      <option>Hospitality</option>
                      <option>Other</option>
                    </select>
                    {fieldErrors?.type && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.type}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Country / Region"
                    name="region"
                    placeholder="United States"
                    error={fieldErrors?.region}
                  />
                </div>

                <div className="mt-3">
                  <label
                    className="mb-1.5 block text-xs text-subtle"
                    htmlFor="message"
                  >
                    What are you interested in?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="min-h-30 w-full resize-y rounded-2xl border border-border bg-bg px-3 py-3 text-muted outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15"
                    placeholder="Tell us the product lines you want, estimated order volume, and any timeline."
                  />
                  {fieldErrors?.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Honeypot */}
                <div className="absolute -left-2499.75 h-px w-px overflow-hidden">
                  <label htmlFor="company_site">Company site</label>
                  <input
                    id="company_site"
                    name="company_site"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Cloudflare Turnstile — invisible, auto-executes on mount */}
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onToken={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  onReady={handleTurnstileReady}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 bg-linear-to-br from-gold/95 to-gold/65 px-5 py-3 font-semibold text-black transition hover:brightness-110 disabled:opacity-70 cursor-pointer"
                  >
                    {status === "sending" && <Spinner className="h-4 w-4" />}
                    {status === "sending" ? "Sending…" : "Send inquiry"}
                  </button>

                  <Link
                    href="#"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 font-semibold text-muted hover:bg-text/10 hover:border-text/25"
                  >
                    WhatsApp
                  </Link>
                </div>

                {status === "error" && (
                  <Alert variant="error" className="mt-4">
                    {error}
                  </Alert>
                )}

                <p className="mt-3 text-xs text-subtle">
                  By submitting, you agree we may contact you about wholesale
                  onboarding.
                </p>
              </form>
            )}
          </div>

          <aside className="rounded-[18px] border border-border bg-white/6 shadow-soft p-5">
            <h3 className="text-base font-semibold">Contact</h3>
            <p className="mt-2 text-sm text-muted">
              Prefer email? Send your store info (and resale certificate if
              applicable).
            </p>

            <InfoRow
              href="mailto:wholesale@vitaria.com"
              icon={<Mail />}
              label="email"
              value="wholesale@vitaria.com"
            />
            <InfoRow
              href="https://wa.me/905357331290"
              icon={<Whatsapp />}
              label="Whatsapp"
              value="+90 ..."
            />
            <InfoRow
              href="#"
              icon={<Facebook />}
              label="Facebook"
              value="@account"
            />

            <div className="mt-4 flex flex-wrap gap-2.5">
              {["Barcoded", "Case packs", "Samples", "Marketing assets"].map(
                (b) => (
                  <span
                    key={b}
                    className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs text-muted"
                  >
                    {b}
                  </span>
                ),
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Input(props: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  const {
    label,
    name,
    required,
    type = "text",
    placeholder,
    autoComplete,
    error,
  } = props;
  return (
    <div>
      <label className="mb-1.5 block text-xs text-subtle" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-border bg-bg px-3 py-3 text-muted outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="mt-3 flex items-center gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
    >
      <div className="flex h-8.5 w-8.5 items-center justify-center rounded-2xl bg-surface border border-border">
        {icon}
      </div>
      <div>
        <div className="text-xs text-subtle">{label}</div>
        <div className="text-sm text-muted">{value}</div>
      </div>
    </Link>
  );
}
