import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-290 items-center justify-between gap-3 px-5 py-3.5">
        <Link
          className="flex items-center gap-3"
          href="/"
          aria-label="VITARIA home"
        >
          <Image
            src="/logo.svg"
            alt="VITARIA"
            width={160}
            height={40}
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-5 text-sm text-muted md:flex"
          aria-label="Primary"
        >
          <Link className="hover:text-text" href="/products">
            Products
          </Link>
          <Link className="hover:text-text" href="/#wholesale">
            Wholesale
          </Link>
          <Link className="hover:text-text" href="/#about">
            Why VITARIA
          </Link>
          <Link className="hover:text-text" href="/#contact">
            Request pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/#contact"
            className="hidden rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text hover:brightness-110 sm:inline-flex"
          >
            Get details
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full border border-gold/60
              bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-gold)_95%,transparent),color-mix(in_oklab,var(--color-gold)_65%,transparent))]
              px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Request pricing
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
