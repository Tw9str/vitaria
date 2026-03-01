import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold/80">
        404
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text">
        Page not found
      </h1>

      <p className="mt-3 max-w-[40ch] text-muted">
        This page doesn't exist or has been moved. Head back to browse our
        wholesale catalog.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-gold/60
            bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-gold)_95%,transparent),color-mix(in_oklab,var(--color-gold)_65%,transparent))]
            px-5 py-3 font-semibold text-black hover:brightness-110"
        >
          Back to home
        </Link>

        <Link
          href="/#products"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 font-semibold text-text hover:brightness-110"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
