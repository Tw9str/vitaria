"use client";

import { useState } from "react";

type Section = {
  heading: string;
  items: string[];
};

export default function ProductSectionTabs({
  sections,
}: {
  sections: Section[];
}) {
  const visible = sections.filter((s) => s.items.length > 0);
  const [active, setActive] = useState(0);

  if (visible.length === 0) return null;

  const panel = visible[active];

  return (
    <div>
      {/* Tab bar — only shown if more than one section */}
      {visible.length > 1 && (
        <div className="relative flex gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-none">
          {visible.map((sec, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={[
                "relative shrink-0 px-4 pb-3 pt-1 text-sm font-semibold transition-colors",
                i === active ? "text-text" : "text-subtle hover:text-muted",
              ].join(" ")}
            >
              {sec.heading || `Section ${i + 1}`}
              {/* Active indicator */}
              {i === active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand-leaf" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Panel */}
      <div key={active} className="mt-6 animate-in fade-in duration-200">
        {/* Single section shows its heading as a title instead of a tab */}
        {visible.length === 1 && panel.heading && (
          <h2 className="mb-5 text-base font-semibold text-text">
            {panel.heading}
          </h2>
        )}

        <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {panel.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted">
              <span
                className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-brand-leaf"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
