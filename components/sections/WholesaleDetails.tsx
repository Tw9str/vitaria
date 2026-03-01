import Link from "next/link";

export default function WholesaleDetails() {
  return (
    <section id="wholesale" className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] tracking-[-0.01em]">
              Wholesale details
            </h2>
            <p className="mt-2 max-w-[70ch] text-muted">
              Clear policies speed up approvals and increase conversion from
              serious buyers.
            </p>
          </div>
          <Link
            href="#contact"
            className="rounded-full border border-border bg-surface px-4 py-2.5 font-semibold text-text hover:bg-text/10 hover:border-text/25"
          >
            Start an application
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-white/12 bg-surface p-5">
            <h3 className="text-base font-semibold">Ordering & logistics</h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <dt className="text-sm text-subtle">Minimum order</dt>
              <dd className="text-sm text-muted">
                Example: $500 opening, $250 reorders
              </dd>
              <dt className="text-sm text-subtle">Case packs</dt>
              <dd className="text-sm text-muted">
                Example: 6 / 12 units per SKU
              </dd>
              <dt className="text-sm text-subtle">Lead time</dt>
              <dd className="text-sm text-muted">
                Example: 3–5 business days in-stock; 2–4 weeks made-to-order
              </dd>
              <dt className="text-sm text-subtle">Shipping</dt>
              <dd className="text-sm text-muted">
                Example: FOB warehouse; carrier options available
              </dd>
            </dl>
          </div>

          <div className="rounded-[18px] border border-white/12 bg-surface p-5">
            <h3 className="text-base font-semibold">Terms & support</h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <dt className="text-sm text-subtle">Payment terms</dt>
              <dd className="text-sm text-muted">
                Example: Net 30 for approved accounts; prepay for new accounts
              </dd>
              <dt className="text-sm text-subtle">Returns</dt>
              <dd className="text-sm text-muted">
                Example: Defects reported within 7 days; case-by-case resolution
              </dd>
              <dt className="text-sm text-subtle">MAP policy</dt>
              <dd className="text-sm text-muted">
                Example: Available upon request
              </dd>
              <dt className="text-sm text-subtle">Marketing</dt>
              <dd className="text-sm text-muted">
                Example: Product images, line sheet, merchandising kit included
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
