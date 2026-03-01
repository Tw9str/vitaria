import { getLogs, type LogEntry } from "@/lib/db/logs";
import LogsListClient from "@/components/admin/logs/LogsListClient";

export const metadata = { title: "Activity Logs · Admin" };

export default async function LogsPage() {
  let initialLogs: LogEntry[] = [];
  let initialHasMore = false;

  try {
    const result = await getLogs({ skip: 0 });
    initialLogs = result.logs;
    initialHasMore = result.hasMore;
  } catch (err) {
    console.error("[LogsPage] failed to load:", err);
  }

  async function fetchMore(
    entity: string,
    severity: string,
    skip: number,
  ): Promise<{ logs: LogEntry[]; hasMore: boolean }> {
    "use server";
    return getLogs({ entity, severity, skip });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Activity Logs</h1>
        <p className="mt-0.5 text-sm text-muted">
          A full history of all actions performed in the admin panel.
        </p>
      </div>

      <LogsListClient
        initialLogs={initialLogs}
        initialHasMore={initialHasMore}
        onLoadMore={fetchMore}
      />
    </div>
  );
}
