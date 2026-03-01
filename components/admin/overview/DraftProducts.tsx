import Link from "next/link";
import type { DraftProduct } from "@/lib/db/overview";

type Props = {
  products: DraftProduct[];
  draftCount: number;
};

export default function DraftProducts({ products, draftCount }: Props) {
  return (
    <div className="rounded-[18px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold">Draft products</h2>
        {draftCount > 0 && (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold text-muted">
            {draftCount}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-subtle">
          All products published.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-border">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between gap-2 px-4 py-2.5 transition hover:bg-black/5"
            >
              <span className="truncate text-sm text-text">
                {product.title}
              </span>
              <svg
                className="h-3.5 w-3.5 shrink-0 text-subtle"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
