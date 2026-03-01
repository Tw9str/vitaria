export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-290 px-5 py-12">
      {/* Back link */}
      <div className="h-4 w-24 animate-pulse rounded-full bg-white/5" />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Hero image */}
        <div className="animate-pulse rounded-[18px] bg-white/5 aspect-[4/3]" />

        {/* Content */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded-full bg-white/5" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/5" />

          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-full animate-pulse rounded-full bg-white/5"
              />
            ))}
          </div>

          <div className="mt-6 h-12 w-40 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
    </main>
  );
}
