function Bone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-border/60 ${className}`} />
  );
}

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <Bone className="h-7 w-40" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border p-4 space-y-3"
          >
            <Bone className="h-3.5 w-20" />
            <Bone className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Two-column content area */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left block */}
        <div className="rounded-2xl border border-border p-5 space-y-3">
          <Bone className="h-4 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-3 w-3 rounded-full shrink-0" />
              <Bone className="h-3 flex-1" />
              <Bone className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>

        {/* Right block */}
        <div className="rounded-2xl border border-border p-5 space-y-3">
          <Bone className="h-4 w-24" />
          <Bone className="h-24 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-3 flex-1" />
              <Bone className="h-3 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
