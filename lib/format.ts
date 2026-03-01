/**
 * Shared formatting utilities used across the application.
 */

/**
 * Returns a human-readable relative timestamp (e.g. "3 minutes ago").
 */
export function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "just now";

  if (diff < 3_600) {
    const m = Math.floor(diff / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }

  if (diff < 86_400) {
    const h = Math.floor(diff / 3_600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }

  const d = Math.floor(diff / 86_400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
