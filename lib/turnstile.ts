import { config } from "./config";

export type TurnstileResult =
  | { success: true }
  | { success: false; errorCodes: string[] };

export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<TurnstileResult> {
  // Reject empty tokens immediately — no need to hit Cloudflare.
  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const secret = config.turnstile.turnstileSecretKey;

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );

    if (!res.ok) {
      return { success: false, errorCodes: [`http-${res.status}`] };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (data.success) return { success: true };
    return { success: false, errorCodes: data["error-codes"] ?? [] };
  } catch {
    return { success: false, errorCodes: ["network-error"] };
  }
}
