import Link from "next/link";
import EditButton from "@/components/admin/EditButton";
import Image from "next/image";
import { getAllProducts } from "@/lib/db/products";
import { presignViewUrls } from "@/lib/storage";
import EmptyState from "@/components/shared/EmptyState";
import ProductCardActions from "@/components/admin/ProductCardActions";

export default async function AdminProducts() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  let urlMap: Record<string, string> = {};

  try {
    products = await getAllProducts();
    const heroKeys = products.map((p) => p.image).filter(Boolean) as string[];
    const signed = await presignViewUrls(heroKeys).catch(() => []);
    urlMap = Object.fromEntries(signed.map((s) => [s.key, s.viewUrl]));
  } catch (err) {
    console.error("[AdminProducts] failed to load:", err);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-xs text-muted mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <EditButton
          href="/admin/products/new"
          label="New product"
          icon={
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white bg-brand-ink hover:brightness-110 transition cursor-pointer disabled:opacity-60 disabled:cursor-default"
        />
      </div>

      {/* List */}
      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Create your first product to get started."
            action={{ label: "New product", href: "/admin/products/new" }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => {
              const thumbUrl = p.image ? urlMap[p.image] : null;
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-surface flex flex-col transition hover:border-text/20"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full bg-black/6 overflow-hidden shrink-0">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted/30">
                        <svg
                          className="h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16l5-5 4 4 3-3 6 6"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-sm">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted truncate">/{p.slug}</p>
                      </div>
                      <EditButton href={`/admin/products/${p.id}`} />
                    </div>

                    {/* Publish toggle + delete */}
                    <div className="flex items-center justify-between gap-2">
                      <ProductCardActions id={p.id} published={p.published} />
                      {p.published && (
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-muted hover:text-text transition"
                          aria-label="Preview on site"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 3h6v6"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 14L21 3"
                            />
                          </svg>
                          Preview
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
