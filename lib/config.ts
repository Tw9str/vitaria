import { env } from "./env";

export const config = {
  databaseUrl: env("DATABASE_URL"),

  auth: {
    authSecret: env("AUTH_SECRET"),
    authUrl: env("AUTH_URL"),
  },

  r2: {
    accountId: env("R2_ACCOUNT_ID"),
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    bucket: env("R2_BUCKET"),
  },

  turnstile: {
    turnstileSiteKey: env("TURNSTILE_SITE_KEY"),
    turnstileSecretKey: env("TURNSTILE_SECRET_KEY"),
  },

  resend: {
    resendApiKey: env("RESEND_API_KEY"),
    fromEmail: env("RESEND_FROM_EMAIL"),
    leadsToEmail: env("LEADS_TO_EMAIL"),
  },
};
