import type { ReactNode } from "react";
import Link from "next/link";

type Action = {
  label: string;
  href: string;
};

type Props = {
  /** Short headline. */
  title: string;
  /** Supporting sentence below the title. */
  message?: string;
  /** Optional CTA link rendered as a button below the message. */
  action?: Action;
  /** Override the default icon. */
  icon?: ReactNode;
  className?: string;
};

/** Default inbox / box icon. */
function DefaultIcon() {
  return (
    <svg
      className="h-7 w-7 text-subtle"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

export default function EmptyState({
  title,
  message,
  action,
  icon,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[18px] border border-border bg-surface/50 px-6 py-16 text-center ${className}`}
    >
      {/* Icon bubble */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
        {icon ?? <DefaultIcon />}
      </div>

      <p className="mt-4 text-sm font-semibold text-text">{title}</p>

      {message && (
        <p className="mt-1.5 max-w-[36ch] text-sm text-subtle">{message}</p>
      )}

      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:brightness-110"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
