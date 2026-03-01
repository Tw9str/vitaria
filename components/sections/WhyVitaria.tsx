export default function WhyVitaria() {
  return (
    <section id="about" className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <div>
          <h2 className="text-[22px] tracking-[-0.01em]">
            Why partners choose VITARIA
          </h2>
          <p className="mt-2 max-w-[70ch] text-muted">
            A wholesale program built for long-term partnerships: strong
            presentation, reliable fulfillment, and repeatable reorders.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            {
              t: "Wholesale-friendly margins",
              d: "Clear tiers, case packs, and programs designed for repeat purchase behavior.",
            },
            {
              t: "Reliable fulfillment",
              d: "Consistent standards and packaging to reduce friction for receiving teams.",
            },
            {
              t: "Retail + marketing support",
              d: "Product images, copy snippets, merchandising guidance, and launch assets.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-[18px] border border-white/12 bg-surface p-4"
            >
              <h3 className="text-[15px] font-semibold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
