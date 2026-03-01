import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-290 flex-wrap items-center justify-between gap-4 px-5">
        <div>© {new Date().getFullYear()} VITARIA. All rights reserved.</div>
        <div className="flex flex-wrap gap-4">
          <Link className="hover:text-text" href="/#products">
            Products
          </Link>
          <Link className="hover:text-text" href="/#wholesale">
            Wholesale
          </Link>
          <Link className="hover:text-text" href="/#contact">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
