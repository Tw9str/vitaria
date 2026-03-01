import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedProductBySlug } from "@/lib/db/products";
import { presignViewUrls, buildViewUrlMap } from "@/lib/storage";
import { connection } from "next/server";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ProductSectionTabs from "@/components/products/ProductSectionTabs";

type PageProps = { params: Promise<{ slug: string }> };

function toAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, SITE.url).toString();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(decodeURIComponent(slug));

  if (!product) {
    return buildMetadata({
      title: "Product",
      description: "Product details",
      path: "/products",
    });
  }

  return buildMetadata({
    title: product.title,
    description: product.summary,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

export default async function ProductPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;

  const product = await getPublishedProductBySlug(decodeURIComponent(slug));
  if (!product) notFound();

  const allKeys = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const viewMap = buildViewUrlMap(await presignViewUrls(allKeys));

  const heroSrc = product.image ? (viewMap[product.image] ?? "") : "";
  const gallerySrcs = (product.gallery ?? [])
    .map((k) => viewMap[k])
    .filter(Boolean);

  const canonical = toAbsoluteUrl(`/products/${product.slug}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE.name} ${product.title}`,
    description: product.summary,
    image: [toAbsoluteUrl(heroSrc)],
    brand: { "@type": "Brand", name: SITE.name },
    url: canonical,
  } as const;

  const specs = (product.specs ?? []) as { label: string; value: string }[];
  const sections = (product.sections ?? []) as {
    heading: string;
    items: string[];
  }[];

  return (
    <>
      <JsonLd id="jsonld-product" data={productJsonLd} />

      <main className="pb-24 pt-10">
        <div className="mx-auto max-w-290 px-5">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.title },
            ]}
          />
        </div>

        {/* ── Hero ── */}
        <div className="mx-auto max-w-290 px-5">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            {/* Left: image */}
            <HeroImage title={product.title} src={heroSrc} />

            {/* Right: info — floats on page background, no card wrapper */}
            <div className="flex min-w-0 flex-col lg:sticky lg:top-8">
              {/* Category */}
              {product.highlight && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-leaf/25 bg-brand-leaf/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand-leaf">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-leaf"
                    aria-hidden
                  />
                  {product.highlight}
                </span>
              )}

              {/* Title */}
              <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-text wrap-break-word lg:text-5xl">
                {product.title}
              </h1>

              {/* Summary */}
              <p className="mt-4 text-base leading-relaxed text-muted">
                {product.summary}
              </p>

              {/* Specs */}
              {specs.length > 0 && (
                <dl className="mt-7 divide-y divide-border">
                  {specs.map((row) => (
                    <SpecRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </dl>
              )}

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-ink py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Request pricing
                </Link>
                <Link
                  href="/#wholesale"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-surface py-3.5 font-semibold text-text transition hover:border-text/20 hover:brightness-110 active:scale-[0.98]"
                >
                  Wholesale terms
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        {sections.length > 0 && (
          <div className="mx-auto mt-20 max-w-290 px-5">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-brand-leaf">
              Product details
            </p>
            <div className="rounded-[18px] border border-border bg-surface p-6">
              <ProductSectionTabs sections={sections} />
            </div>
          </div>
        )}

        {/* ── Gallery ── */}
        {gallerySrcs.length > 0 && (
          <div className="mx-auto mt-20 max-w-290 px-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">
              Gallery
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {gallerySrcs.map((src, idx) => (
                <div
                  key={src}
                  className="group overflow-hidden rounded-[18px] border border-border"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={src}
                      alt={`${product.title} — image ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mx-auto mt-20 max-w-290 px-5">
          <div className="overflow-hidden rounded-[24px] bg-brand-ink px-8 py-12 text-center shadow-(--shadow-soft)">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Wholesale inquiry
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Interested in {product.title}?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Contact us for bulk pricing, minimum order quantities, and
              shipping terms.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 font-semibold text-brand-ink transition hover:brightness-95 active:scale-[0.98]"
              >
                Get in touch
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                <span aria-hidden>←</span> Browse catalog
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Sub-components ── */

function HeroImage({ title, src }: { title: string; src: string }) {
  if (!src) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[24px] border border-border bg-surface">
        <span className="text-sm text-subtle">No image</span>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-(--shadow-soft)">
      <div className="relative aspect-square w-full">
        <Image
          src={src}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-subtle">{label}</dt>
      <dd className="min-w-0 break-all text-sm font-semibold text-text">
        {value}
      </dd>
    </div>
  );
}
