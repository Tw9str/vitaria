import Link from "next/link";
import { connection } from "next/server";
import { getPublishedProducts } from "@/lib/db/products";
import { presignViewUrls, buildViewUrlMap } from "@/lib/storage";
import EmptyState from "@/components/shared/EmptyState";
import ProductsCarousel, {
  type MarqueeCard,
} from "@/components/sections/ProductsMarquee";

export default async function Products() {
  await connection();

  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  let viewMap: Record<string, string> = {};

  try {
    products = await getPublishedProducts({ take: 9 });
    const imageKeys = products.map((p) => p.image).filter(Boolean);
    const signed = await presignViewUrls(imageKeys);
    viewMap = buildViewUrlMap(signed);
  } catch (err) {
    console.error("[Products] failed to load:", err);
    return (
      <section id="products" className="py-16">
        <div className="mx-auto max-w-290 px-5">
          <EmptyState
            title="Couldn't load products"
            message="Please refresh the page or check back later."
          />
        </div>
      </section>
    );
  }

  const cards: MarqueeCard[] = products.map((p) => {
    const rawSpecs = p.specs as { label: string; value: string }[] | null;
    return {
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      highlight: p.highlight,
      imgUrl: p.image ? (viewMap[p.image] ?? "") : "",
      firstSpec: rawSpecs?.[0] ?? null,
    };
  });

  return (
    <section id="products" className="py-16">
      {/* Section header */}
      <div className="mx-auto mb-8 flex max-w-290 items-end justify-between px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">
            Catalog
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-text">
            Our Products
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:brightness-110"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Marquee or empty state */}
      {products.length === 0 ? (
        <div className="mx-auto max-w-290 px-5">
          <EmptyState
            title="No products yet"
            message="Our catalog is being curated. Check back soon."
          />
        </div>
      ) : (
        <ProductsCarousel cards={cards} />
      )}
    </section>
  );
}
