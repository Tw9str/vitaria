import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { RecentLead } from "@/lib/db/overview";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  read: "bg-black/10 text-muted",
  contacted: "bg-green-500/15 text-green-600 dark:text-green-400",
  closed: "bg-red-500/10 text-red-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_CLASSES[status] ?? STATUS_CLASSES.read}`}
    >
      {status}
    </span>
  );
}

type Props = { leads: RecentLead[] };

export default function RecentLeads({ leads }: Props) {
  return (
    <div className="rounded-[18px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold">Recent leads</h2>
        <Link
          href="/admin/leads"
          className="text-xs text-muted transition hover:text-text"
        >
          View all →
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-subtle">
          No leads yet.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {lead.company}
                </p>
                <p className="truncate text-xs text-muted">
                  {lead.name} &middot; {lead.type}
                </p>
              </div>
              <StatusBadge status={lead.status} />
              <span className="shrink-0 text-xs text-subtle">
                {relativeTime(lead.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
