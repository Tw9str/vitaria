import { getRecentLeads } from "@/lib/db/leads";
import EmptyState from "@/components/shared/EmptyState";
import LeadsListClient from "@/components/admin/LeadsListClient";
import type { LeadRow } from "@/app/actions/lead";

const PAGE_SIZE = 50;

export default async function AdminLeads() {
  // fetch one extra to know if more exist
  const raw = await getRecentLeads(PAGE_SIZE + 1);
  const hasMore = raw.length > PAGE_SIZE;
  const leads = raw.slice(0, PAGE_SIZE) as LeadRow[];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Leads</h1>
        {leads.length > 0 && (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
            {leads.length}{hasMore ? "+" : ""}
          </span>
        )}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          className="mt-5"
          title="No leads yet"
          message="Wholesale inquiries will appear here once submitted."
        />
      ) : (
        <LeadsListClient initialLeads={leads} initialHasMore={hasMore} />
      )}
    </div>
  );
}
