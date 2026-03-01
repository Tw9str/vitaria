import { auth } from "@/lib/auth";
import { getOverviewData } from "@/lib/db/overview";
import type { OverviewData } from "@/lib/db/overview";
import { getNotes, type NoteItem } from "@/lib/db/notes";
import { getRecentLogs, type LogEntry } from "@/lib/db/logs";
import StatCards from "@/components/admin/overview/StatCards";
import RecentLeads from "@/components/admin/overview/RecentLeads";
import LeadsSparkline from "@/components/admin/overview/LeadsSparkline";
import DraftProducts from "@/components/admin/overview/DraftProducts";
import NotesWidget from "@/components/admin/overview/NotesWidget";
import ActivityWidget from "@/components/admin/overview/ActivityWidget";

export default async function AdminOverview() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  let data: OverviewData | null = null;
  let notes: NoteItem[] = [];
  let recentLogs: LogEntry[] = [];
  try {
    [data, notes, recentLogs] = await Promise.all([
      getOverviewData(email),
      getNotes(),
      getRecentLogs(8),
    ]);
  } catch (err) {
    console.error("[AdminOverview] failed to load:", err);
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center gap-2">
        <p className="text-sm font-semibold text-text">
          Couldn&apos;t load dashboard
        </p>
        <p className="text-xs text-muted">
          Check your database connection and refresh.
        </p>
      </div>
    );
  }

  const { stats, recentLeads, draftProducts, sparkCounts, firstName } = data;

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Hi, {firstName}</h1>
        <p className="mt-0.5 text-sm text-muted">Welcome back.</p>
      </div>

      {/* Stats */}
      <div className="mt-5">
        <StatCards stats={stats} />
      </div>

      {/* Main grid: leads table + sidebar */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_340px] 2xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-4">
          <RecentLeads leads={recentLeads} />
          <ActivityWidget logs={recentLogs} />
        </div>

        <div className="flex flex-col gap-4">
          <LeadsSparkline
            weekCount={stats.weekLeadsCount}
            sparkCounts={sparkCounts}
          />
          <DraftProducts
            products={draftProducts}
            draftCount={stats.draftCount}
          />
          <NotesWidget notes={notes} />
        </div>
      </div>
    </div>
  );
}
