"use client";

import Image from "next/image";
import Link from "next/link";

export type MarqueeCard = {
  slug: string;
  title: string;
  summary: string;
  highlight: string | null;
  imgUrl: string;
  firstSpec: { label: string; value: string } | null;
};

export default function ProductCard({
  card,
  isClone = false,
  wasDragging,
}: {
  card: MarqueeCard;
  isClone?: boolean;
  wasDragging?: React.RefObject<boolean>;
}) {
  return (
    <article
      aria-hidden={isClone}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-text/20 hover:bg-text/5"
    >
      <Link
        href={`/products/${card.slug}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
        draggable={false}
        tabIndex={isClone ? -1 : 0}
        onClick={(e) => {
          if (wasDragging?.current) {
            wasDragging.current = false;
            e.preventDefault();
          }
        }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden border-b border-border">
          {card.imgUrl ? (
            <Image
              src={card.imgUrl}
              alt={card.title}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/10">
              <span className="text-xs text-subtle">No image</span>
            </div>
          )}
          {card.highlight && (
            <span className="absolute bottom-3 left-3 rounded-full border border-white/14 bg-black/35 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              {card.highlight}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex min-w-0 flex-1 flex-col p-4 pb-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-text">
            {card.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-subtle">
            {card.summary}
          </p>

          {/* Footer — pinned to bottom */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            {card.firstSpec ? (
              <p className="min-w-0 truncate text-[11px] text-subtle">
                <span className="text-subtle/60">{card.firstSpec.label}: </span>
                {card.firstSpec.value}
              </p>
            ) : (
              <span />
            )}
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-subtle transition-colors group-hover:text-text">
              View
              <svg
                className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
