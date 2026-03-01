import type { ReactNode } from "react";

type Variant = "error" | "success" | "warning" | "info";

const styles: Record<Variant, { wrap: string; text: string; icon: ReactNode }> =
  {
    error: {
      wrap: "border-red-500/25 bg-red-500/8",
      text: "text-red-700 dark:text-red-300",
      icon: (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    success: {
      wrap: "border-green-500/25 bg-green-500/8",
      text: "text-green-900 dark:text-green-300",
      icon: (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-green-800 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      ),
    },
    warning: {
      wrap: "border-yellow-500/25 bg-yellow-500/8",
      text: "text-yellow-700 dark:text-yellow-300",
      icon: (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    info: {
      wrap: "border-blue-500/25 bg-blue-500/8",
      text: "text-blue-700 dark:text-blue-300",
      icon: (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      ),
    },
  };

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable inline alert banner.
 *
 * @example
 * <Alert variant="error">Something went wrong.</Alert>
 * <Alert variant="success">Your message was sent!</Alert>
 */
export default function Alert({
  variant = "error",
  children,
  className = "",
}: AlertProps) {
  const s = styles[variant];
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 ${s.wrap} ${className}`}
    >
      {s.icon}
      <p className={`text-sm ${s.text}`}>{children}</p>
    </div>
  );
}
