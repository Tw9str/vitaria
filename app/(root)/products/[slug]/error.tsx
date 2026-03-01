"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[product detail]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold/80">
        Error
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text">
        Something went wrong
      </h2>

      <p className="mt-3 max-w-[44ch] text-muted">
        We couldn&apos;t load this product. Please try again or browse our
        catalog.
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="mt-3 max-w-[60ch] rounded-xl border border-border bg-surface px-4 py-2 text-left font-mono text-xs text-red-400 whitespace-pre-wrap">
          {error.message}
        </pre>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full border border-gold/60
            bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-gold)_95%,transparent),color-mix(in_oklab,var(--color-gold)_65%,transparent))]
            px-5 py-3 font-semibold text-black hover:brightness-110 cursor-pointer"
        >
          Try again
        </button>

        <Link
          href="/#products"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 font-semibold text-text hover:brightness-110"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
