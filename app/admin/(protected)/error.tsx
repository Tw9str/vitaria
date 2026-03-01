"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10">
        <svg
          className="h-6 w-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-text">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-[40ch] text-sm text-muted">
        An unexpected error occurred. Your data has not been changed.
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-full overflow-auto rounded-xl border border-border bg-surface px-4 py-3 text-left font-mono text-xs text-red-400">
          {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
      )}

      <button
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:brightness-110 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
