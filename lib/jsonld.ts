import { SITE } from "./site";

const SCHEMA_CONTEXT = "https://schema.org" as const;

type WithContext<T> = T & { "@context": typeof SCHEMA_CONTEXT };

type PostalAddress = {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};

export type OrganizationJsonLd = WithContext<{
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  email?: string;
  telephone?: string;
  sameAs?: string[];
  address?: PostalAddress;
}>;

export type WebsiteJsonLd = WithContext<{
  "@type": "WebSite";
  name: string;
  url: string;
}>;

export type BreadcrumbListJsonLd = WithContext<{
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}>;

// Compute once per module load (SITE.url should be stable)
const BASE_URL = new URL(SITE.url);

function isHttpUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function toAbsUrl(pathOrUrl: string): string | undefined {
  const raw = pathOrUrl.trim();
  if (!raw) return undefined;

  try {
    const u = new URL(raw, BASE_URL);
    return isHttpUrl(u) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function pickStrings<T extends Record<string, unknown>>(
  obj: T,
  keys: Array<keyof T>,
) {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) out[String(k)] = v.trim();
  }
  return out;
}

function cleanSameAs(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const urls = input
    .filter((v): v is string => typeof v === "string")
    .map((v) => toAbsUrl(v))
    .filter((v): v is string => Boolean(v));

  // De-dupe while preserving order
  const uniq = Array.from(new Set(urls));
  return uniq.length ? uniq : undefined;
}

function maybeAddress(): PostalAddress | undefined {
  // If you can type SITE.address in ./site, do it there. This keeps us safe here.
  const src = SITE.address as Partial<Omit<PostalAddress, "@type">> | undefined;
  if (!src) return undefined;

  const fields = pickStrings(src, [
    "streetAddress",
    "addressLocality",
    "addressRegion",
    "postalCode",
    "addressCountry",
  ]);

  if (!Object.keys(fields).length) return undefined;

  return { "@type": "PostalAddress", ...fields };
}

export function organizationJsonLd(): OrganizationJsonLd {
  const url = toAbsUrl("/") ?? BASE_URL.toString();
  const logo = toAbsUrl("/vitaria-logo.png");

  const org: OrganizationJsonLd = {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    name: SITE.legalName || SITE.name,
    url,
    ...(logo ? { logo } : {}),
  };

  if (SITE.email) org.email = SITE.email;
  if (SITE.phone) org.telephone = SITE.phone;

  const sameAs = cleanSameAs(SITE.social);
  if (sameAs) org.sameAs = sameAs;

  const address = maybeAddress();
  if (address) org.address = address;

  return org;
}

export function websiteJsonLd(): WebsiteJsonLd {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: SITE.name,
    url: toAbsUrl("/") ?? BASE_URL.toString(),
  };
}

export function breadcrumbsJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
): BreadcrumbListJsonLd {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: toAbsUrl(it.path) ?? toAbsUrl("/") ?? BASE_URL.toString(),
    })),
  };
}
