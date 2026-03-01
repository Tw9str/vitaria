import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold/80">
        404
      </p>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">
        Product not found
      </h1>

      <p className="mt-3 max-w-[40ch] text-muted">
        This product doesn&apos;t exist or is no longer available.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/#products"
          className="inline-flex items-center justify-center rounded-full border border-gold/60
            bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-gold)_95%,transparent),color-mix(in_oklab,var(--color-gold)_65%,transparent))]
            px-5 py-3 font-semibold text-black hover:brightness-110"
        >
          Browse products
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 font-semibold text-text hover:brightness-110"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
