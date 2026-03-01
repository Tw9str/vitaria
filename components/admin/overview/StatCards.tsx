import type { OverviewStats } from "@/lib/db/overview";

type StatCard = {
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
};

function buildCards(stats: OverviewStats): StatCard[] {
  return [
    {
      label: "Products",
      value: stats.totalProducts,
      sub: `${stats.publishedCount} published · ${stats.draftCount} draft`,
    },
    {
      label: "Total leads",
      value: stats.totalLeads,
      sub: "all time",
    },
    {
      label: "New leads",
      value: stats.newLeadsCount,
      sub: "awaiting review",
      highlight: stats.newLeadsCount > 0,
    },
    {
      label: "This week",
      value: stats.weekLeadsCount,
      sub: "last 7 days",
    },
  ];
}

type Props = { stats: OverviewStats };

export default function StatCards({ stats }: Props) {
  const cards = buildCards(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-[18px] border p-4 ${
            card.highlight
              ? "border-gold/40 bg-gold/5"
              : "border-border bg-surface"
          }`}
        >
          <p className="text-xs text-subtle">{card.label}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-text">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
