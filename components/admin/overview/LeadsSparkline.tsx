const VIEWBOX_W = 160;
const VIEWBOX_H = 40;

function Sparkline({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);

  const points = counts
    .map((c, i) => {
      const x = (i / (counts.length - 1)) * VIEWBOX_W;
      const y = VIEWBOX_H - (c / max) * (VIEWBOX_H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const lastCount = counts[counts.length - 1];
  const dotX = VIEWBOX_W;
  const dotY = VIEWBOX_H - (lastCount / max) * (VIEWBOX_H - 6) - 3;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="w-full overflow-visible"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={dotX} cy={dotY} r="3" fill="currentColor" />
    </svg>
  );
}

type Props = {
  weekCount: number;
  sparkCounts: number[];
};

export default function LeadsSparkline({ weekCount, sparkCounts }: Props) {
  return (
    <div className="rounded-[18px] border border-border bg-surface p-4">
      <p className="text-xs text-subtle">Leads — last 7 days</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-text">
        {weekCount}
      </p>
      <div className="mt-3 text-brand-leaf">
        <Sparkline counts={sparkCounts} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-subtle">
        <span>7d ago</span>
        <span>today</span>
      </div>
    </div>
  );
}
