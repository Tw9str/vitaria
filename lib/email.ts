import { Resend } from "resend";
import { config } from "./config";
import { SITE } from "./site";

// ---------------------------------------------------------------------------
// Singleton Resend client
// ---------------------------------------------------------------------------

let _client: Resend | null = null;

function getClient(): Resend {
  if (!_client) _client = new Resend(config.resend.resendApiKey);
  return _client;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmailPayload = {
  /** One or more recipient addresses. */
  to: string | string[];
  subject: string;
  html: string;
  /** Defaults to "{SITE.name} <noreply@{domain}>". */
  from?: string;
  /** Reply-to address shown to the recipient. */
  replyTo?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultFrom(): string {
  // try {
  //   const domain = new URL(SITE.url).hostname.replace(/^www\./, "");
  //   return `${SITE.name} <noreply@${domain}>`;
  // } catch {
  //   return `${SITE.name} <noreply@vitaria.com>`;
  // }
  return config.resend.fromEmail;
}

// ---------------------------------------------------------------------------
// sendEmail — throws on Resend error
// ---------------------------------------------------------------------------

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { error } = await getClient().emails.send({
    from: payload.from ?? defaultFrom(),
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
  });

  if (error) {
    throw new Error(`[email] ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// sendEmailSafe — never throws; logs and returns false on failure.
// Use for fire-and-forget cases where email failure must not break the flow.
// ---------------------------------------------------------------------------

export async function sendEmailSafe(payload: EmailPayload): Promise<boolean> {
  try {
    await sendEmail(payload);
    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return false;
  }
}
