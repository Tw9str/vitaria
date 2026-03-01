import type { LeadInput } from "@/lib/validators";
import { SITE } from "@/lib/site";

// ─── Tokens ──────────────────────────────────────────────────────────────────

const PAGE_BG = "#0d1f16"; // deep forest green outer wrap
const HEADER_BG = "#07140d"; // near-black green header band
const CARD_BG = "#ffffff"; // white body card
const PANEL_BG = "#f5f8f6"; // very lightly tinted table panels
const BORDER = "#d8e6dd"; // soft sage border
const TEXT = "#0d1f16"; // near-black body text
const MUTED = "#3b5446"; // mid-tone for secondary text
const SUBTLE = "#6b8878"; // lighter labels/captions
const GOLD = "#c9a35a"; // antique gold accent
const GOLD_DARK = "#9f7b37"; // darker gold for button border
const BRAND = "#145238"; // primary brand green

// ─── Safety helpers ──────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? escapeHtml(trimmed) : null;
}

function safeUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return escapeHtml(trimmed);
  } catch {
    return null;
  }
}

function formatDate(date?: Date): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// ─── Layout primitives ───────────────────────────────────────────────────────

function row(label: string, value: string | null): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:11px 14px 11px 0;vertical-align:top;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:11px 0;vertical-align:top;font-size:14px;line-height:1.65;color:${TEXT};">${value}</td>
  </tr>`;
}

function divider(): string {
  return `<tr><td colspan="2" style="border-top:1px solid ${BORDER};font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>`;
}

function pill(label: string, accent = false): string {
  const bg = accent ? GOLD : "#eef4f1";
  const fg = accent ? "#1a0e00" : BRAND;
  const border = accent ? GOLD_DARK : "#c5d9ce";
  return `<span style="display:inline-block;padding:5px 12px;border:1px solid ${border};border-radius:999px;background:${bg};font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${fg};">${escapeHtml(label)}</span>`;
}

function btn(href: string, label: string, primary = true): string {
  if (primary) {
    return `<a href="${href}" style="display:inline-block;padding:12px 22px;border:1px solid ${GOLD_DARK};border-radius:10px;background:${GOLD};color:#1a0e00;font-size:13px;font-weight:800;text-decoration:none;line-height:1;white-space:nowrap;">${escapeHtml(label)}</a>`;
  }
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;border:1px solid ${BORDER};border-radius:10px;background:transparent;color:${MUTED};font-size:13px;font-weight:700;text-decoration:none;line-height:1;white-space:nowrap;">${escapeHtml(label)}</a>`;
}

// ─── Shell ───────────────────────────────────────────────────────────────────

function shell(body: string): string {
  const logoUrl = `${SITE.url}/logo.svg`;
  const siteUrl = escapeHtml(SITE.url);
  const siteName = escapeHtml(SITE.name);
  const legal = escapeHtml(SITE.legalName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${siteName}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT};">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
  <tr>
    <td align="center" style="padding:40px 16px 52px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- ── LOGO HEADER ── -->
        <tr>
          <td style="background:${HEADER_BG};border-radius:14px 14px 0 0;padding:20px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="${logoUrl}" alt="${siteName}" width="120"
                    style="display:block;width:120px;height:auto;border:0;" />
                </td>
                <td align="right" style="vertical-align:middle;">
                  <a href="${siteUrl}" style="font-size:11px;color:rgba(255,255,255,0.4);text-decoration:none;">${siteUrl}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── GOLD RULE ── -->
        <tr>
          <td style="background:${GOLD};height:3px;font-size:0;line-height:0;"></td>
        </tr>

        <!-- ── CONTENT CARD ── -->
        <tr>
          <td style="background:${CARD_BG};border:1px solid ${BORDER};border-top:none;border-radius:0 0 14px 14px;padding:32px 32px 28px;">
            ${body}
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;">
              ${legal}&nbsp;&middot;&nbsp;<a href="${siteUrl}" style="color:rgba(255,255,255,0.35);text-decoration:none;">${siteUrl}</a>
            </p>
            <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.22);line-height:1.7;">
              You are receiving this because you contacted ${siteName}.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type LeadEmailData = LeadInput & {
  id?: string;
  createdAt?: Date;
};

// ─── Admin notification ───────────────────────────────────────────────────────

export function buildAdminLeadNotification(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const subject = `New wholesale inquiry — ${lead.company}`;
  const name = safeText(lead.name);
  const email = safeText(lead.email);
  const company = safeText(lead.company) ?? "New inquiry";
  const type = safeText(lead.type);
  const region = safeText(lead.region);
  const website = safeUrl(lead.website);
  const message = safeText(lead.message);
  const date = formatDate(lead.createdAt);

  const html = shell(`

    <!-- HEADING ROW -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
      <tr>
        <td style="vertical-align:top;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${SUBTLE};">Wholesale inquiry</p>
          <h1 style="margin:0;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.01em;color:${TEXT};">${company}</h1>
          ${date ? `<p style="margin:8px 0 0;font-size:12px;color:${SUBTLE};">${escapeHtml(date)}</p>` : ""}
        </td>
        <td style="text-align:right;vertical-align:top;padding-left:12px;">${pill("New", true)}</td>
      </tr>
    </table>

    <!-- CONTACT DETAILS -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="background:${PANEL_BG};padding:2px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${divider()}
            ${row("Name", name)}
            ${row("Email", email ? `<a href="mailto:${email}" style="color:${BRAND};text-decoration:none;font-weight:700;">${email}</a>` : null)}
            ${row("Type", type)}
            ${row("Region", region)}
            ${row("Website", website ? `<a href="${website}" style="color:${BRAND};text-decoration:none;font-weight:700;">${website}</a>` : null)}
            ${divider()}
          </table>
        </td>
      </tr>
    </table>

    <!-- MESSAGE -->
    ${
      message
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin:0 0 22px;">
      <tr><td style="background:${GOLD};height:3px;font-size:0;line-height:0;"></td></tr>
      <tr>
        <td style="background:${PANEL_BG};padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};">Message</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:${TEXT};white-space:pre-wrap;">${message}</p>
        </td>
      </tr>
    </table>`
        : ""
    }

    <!-- ACTIONS -->
    ${
      lead.id && email
        ? `
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:10px;">${btn(`${escapeHtml(SITE.url)}/admin/leads`, "Open admin", true)}</td>
        <td>${btn(`mailto:${email}`, "Reply", false)}</td>
      </tr>
    </table>`
        : ""
    }

  `);

  return { subject, html };
}

// ─── Lead confirmation ────────────────────────────────────────────────────────

export function buildLeadConfirmation(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const subject = `We received your inquiry — ${SITE.name}`;
  const name = safeText(lead.name) ?? "there";
  const firstName = escapeHtml(
    (lead.name?.trim().split(/\s+/)[0] || "there").trim(),
  );
  const company = safeText(lead.company);
  const type = safeText(lead.type);
  const region = safeText(lead.region);
  const email = safeText(lead.email);
  const siteEmail = escapeHtml(SITE.email);

  const html = shell(`

    <!-- STATUS PILL -->
    <p style="margin:0 0 14px;">${pill("Inquiry received")}</p>

    <!-- HEADING -->
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.01em;color:${TEXT};">
      Thank you, ${firstName}.
    </h1>

    <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:${MUTED};">
      We received your wholesale inquiry${company ? ` for <strong style="color:${TEXT};">${company}</strong>` : ""}.
      Our team will review your details and send catalog, pricing and next steps within one business day.
    </p>

    <!-- SUMMARY -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin:0 0 22px;">
      <tr>
        <td style="background:${PANEL_BG};padding:14px 18px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};">Summary</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${divider()}
            ${row("Name", name)}
            ${row("Company", company)}
            ${row("Type", type)}
            ${row("Region", region)}
            ${row("Email", email)}
            ${divider()}
          </table>
        </td>
      </tr>
    </table>

    <!-- ACTIONS -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
      <tr>
        <td style="padding-right:10px;">${btn(`mailto:${siteEmail}`, "Email us", true)}</td>
        <td>${btn(`${escapeHtml(SITE.url)}`, "Visit website", false)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;line-height:1.7;color:${MUTED};">
      — The ${escapeHtml(SITE.name)} wholesale team<br />
      <a href="mailto:${siteEmail}" style="color:${BRAND};text-decoration:none;font-weight:700;">${siteEmail}</a>
    </p>

  `);

  return { subject, html };
}
