import Link from "next/link";
import AdminNav from "./AdminNav";
import AdminActions from "./AdminActions";
import { ToastProvider } from "@/components/shared/Toaster";

export type ShellUser = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  role: string;
};

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-screen-2xl px-5 py-6 grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl bg-surface border border-default flex flex-col h-fit lg:sticky lg:top-6">
          {/* User header */}
          <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-5 border-b border-border text-center">
            <Link
              href="/admin/profile"
              className="group relative shrink-0"
              title="Edit profile"
            >
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.name ?? user.email}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-border transition group-hover:ring-gold/60"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-brand-ink text-white text-lg font-semibold flex items-center justify-center ring-2 ring-border transition group-hover:ring-gold/60">
                  {initials(user.name, user.email)}
                </div>
              )}
              {/* Overlay hint */}
              <span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
            </Link>
            <div className="min-w-0 w-full">
              <p className="font-semibold text-text truncate">
                {user.name ?? user.email}
              </p>
              {user.name && (
                <p className="text-xs text-subtle truncate mt-0.5">
                  {user.email}
                </p>
              )}
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-gold/15 text-gold"
                    : "bg-black/10 text-subtle"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Nav */}
          <div className="p-3 flex-1">
            <AdminNav role={user.role} />
          </div>

          {/* Theme + sign out */}
          <div className="px-3 pb-3">
            <AdminActions />
          </div>
        </aside>

        <main className="rounded-xl bg-surface border border-default p-6 min-w-0">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
