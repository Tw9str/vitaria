import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SITE } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { getPublishedProducts } from "@/lib/db/products";
import { presignViewUrls, buildViewUrlMap } from "@/lib/storage";
import ProductFilterBar from "@/components/products/ProductFilterBar";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description: `Browse the full ${SITE.name} wholesale product catalog. Filter by category and find the right products for your store.`,
  path: "/products",
});

type SearchParams = Promise<{
  highlight?: string;
  sort?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();

  const { highlight, sort } = await searchParams;

  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  let viewMap: Record<string, string> = {};

  try {
    products = await getPublishedProducts();
    const imageKeys = products.map((p) => p.image).filter(Boolean);
    viewMap = buildViewUrlMap(await presignViewUrls(imageKeys));
  } catch (err) {
    console.error("[ProductsPage] failed to load:", err);
    return (
      <main className="py-16">
        <div className="mx-auto max-w-290 px-5">
          <EmptyState
            title="Couldn't load products"
            message="Please refresh the page or check back later."
          />
        </div>
      </main>
    );
  }

  // Unique highlights for filter chips (preserve insertion/frequency order)
  const highlights = Array.from(
    new Set(products.map((p) => p.highlight).filter((h): h is string => !!h)),
  );

  // Filter
  const filtered = highlight
    ? products.filter((p) => p.highlight === highlight)
    : products;

  // Sort (default = "newest" which is already the DB order)
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "a-z") return a.title.localeCompare(b.title);
    if (sort === "z-a") return b.title.localeCompare(a.title);
    // newest: preserve existing DB order (createdAt desc)
    return 0;
  });

  return (
    <main className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Products" }]}
        />

        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">
            Full Catalog
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-text">
            Our Products
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Premium wholesale products curated for modern retailers. Browse our
            full collection below.
          </p>
        </div>

        {/* Filter bar — wrapped in Suspense because it uses useSearchParams */}
        <Suspense fallback={<FilterBarSkeleton />}>
          <ProductFilterBar
            highlights={highlights}
            activeHighlight={highlight}
            activeSort={sort}
            total={products.length}
            filtered={sorted.length}
          />
        </Suspense>

        {/* Grid */}
        {sorted.length === 0 ? (
          <EmptyState
            title="No products found"
            message={
              highlight
                ? `No products match "${highlight}". Try removing the filter.`
                : "No products are available yet."
            }
            action={
              highlight
                ? { label: "Clear filter", href: "/products" }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => {
              const imgUrl = p.image ? (viewMap[p.image] ?? "") : "";
              const rawSpecs = p.specs as
                | { label: string; value: string }[]
                | null;
              const firstSpec = rawSpecs?.[0] ?? null;

              return (
                <article
                  key={p.slug}
                  className="group overflow-hidden rounded-[18px] border border-border bg-surface transition hover:-translate-y-0.5 hover:border-text/20 hover:bg-text/7"
                >
                  <Link href={`/products/${p.slug}`} className="block">
                    {/* Image */}
                    <div className="relative h-48 border-b border-white/10">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition group-hover:scale-[1.02]"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-black/10">
                          <span className="text-xs text-subtle">No image</span>
                        </div>
                      )}
                      {p.highlight && (
                        <span className="absolute bottom-3 left-3 rounded-full border border-white/14 bg-black/30 px-3 py-1.5 text-xs text-white/85">
                          {p.highlight}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="min-w-0 p-4">
                      <h2 className="line-clamp-1 text-base font-semibold text-text">
                        {p.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {p.summary}
                      </p>
                      {firstSpec && (
                        <p className="mt-3 text-xs text-subtle">
                          {firstSpec.label}: {firstSpec.value}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-leaf opacity-0 transition group-hover:opacity-100">
                        View details <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold text-text">
            Looking for something specific?
          </h2>
          <p className="mt-2 text-muted">
            Contact us to discuss custom orders, bulk pricing, or products not
            listed here.
          </p>
          <Link
            href="/#contact"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--color-brand-ink)_35%,transparent)]
              bg-brand-ink px-6 py-3 font-semibold text-white hover:brightness-110"
          >
            Request wholesale pricing
          </Link>
        </div>
      </div>
    </main>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="mb-8 space-y-4 animate-pulse">
      <div className="flex flex-wrap gap-2">
        {[80, 100, 90, 110].map((w) => (
          <div
            key={w}
            className="h-8 rounded-full bg-surface"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="h-4 w-32 rounded-full bg-surface" />
    </div>
  );
}
