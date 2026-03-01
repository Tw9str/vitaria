"use client";

import { useEffect, useRef, useState } from "react";

const GAP = 20;
const CLONE_COUNT = 4;

function getVisible(width: number) {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export type CarouselProps<T> = {
  items: T[];
  /**
   * Unique key for each item — used for React key and clone detection.
   * Must be stable across renders.
   */
  getKey: (item: T) => string;
  /**
   * Render a single slide.
   * `isClone` — hide clones from a11y (aria-hidden / tabIndex).
   * `wasDragging` — ref to check in onClick to cancel accidental navigations.
   */
  children: (
    item: T,
    opts: {
      isClone: boolean;
      wasDragging: React.RefObject<boolean>;
    },
  ) => React.ReactNode;
  /** Breakpoint → visible-card overrides. Defaults: xl=4, lg=3, sm=2, base=1. */
  visibleBreakpoints?: { xl?: number; lg?: number; sm?: number; base?: number };
  className?: string;
};

export default function Carousel<T>({
  items,
  getKey,
  children,
  visibleBreakpoints,
  className,
}: CarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [idx, setIdx] = useState(CLONE_COUNT);
  const [animated, setAnimated] = useState(true);

  // drag state
  const dragStart = useRef<number | null>(null);
  const isDragging = useRef(false);
  const wasDragging = useRef(false);
  const dragOffset = useRef(0);

  const n = items.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Re-enable animation one frame after an instant snap
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimated(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  if (n === 0) return null;

  const getVisibleCount = visibleBreakpoints
    ? (w: number) => {
        const { xl = 4, lg = 3, sm = 2, base = 1 } = visibleBreakpoints;
        if (w >= 1280) return xl;
        if (w >= 1024) return lg;
        if (w >= 640) return sm;
        return base;
      }
    : getVisible;

  // Tile clones so there are always exactly CLONE_COUNT on each side even when n < CLONE_COUNT
  const makePad = (side: "start" | "end"): T[] => {
    const result: T[] = [];
    while (result.length < CLONE_COUNT) {
      if (side === "end") result.push(...items);
      else result.unshift(...items);
    }
    return side === "end"
      ? result.slice(0, CLONE_COUNT)
      : result.slice(-CLONE_COUNT);
  };

  const visible = getVisibleCount(containerWidth);
  const cardWidth =
    containerWidth > 0 ? (containerWidth - GAP * (visible - 1)) / visible : 300;
  const stride = cardWidth + GAP;

  const track = [...makePad("start"), ...items, ...makePad("end")];
  const translateX = -(idx * stride) + dragOffset.current;

  const snap = (nextIdx: number) => {
    setAnimated(false);
    setIdx(nextIdx);
  };

  const goTo = (nextIdx: number) => {
    setAnimated(true);
    setIdx(nextIdx);
  };

  const onTransitionEnd = () => {
    dragOffset.current = 0;
    if (idx < CLONE_COUNT) snap(idx + n);
    else if (idx >= CLONE_COUNT + n) snap(idx - n);
  };

  // ── pointer drag ──────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragStart.current = e.clientX;
    isDragging.current = false;
    wasDragging.current = false;
    dragOffset.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    if (!isDragging.current && Math.abs(delta) > 4) isDragging.current = true;
    if (!isDragging.current) return;
    dragOffset.current = delta;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-(idx * stride) + delta}px)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;

    if (isDragging.current) {
      wasDragging.current = true;
      e.preventDefault();
      dragOffset.current = 0;
      if (Math.abs(delta) > stride * 0.2) {
        if (trackRef.current) trackRef.current.style.transform = "";
        if (delta < 0) goTo(idx + 1);
        else goTo(idx - 1);
      } else {
        if (trackRef.current) {
          trackRef.current.style.transition =
            "transform 0.3s cubic-bezier(0.4,0,0.2,1)";
          trackRef.current.style.transform = `translateX(${-(idx * stride)}px)`;
          setTimeout(() => {
            if (trackRef.current) trackRef.current.style.transition = "";
          }, 300);
        }
      }
    }
    isDragging.current = false;
  };

  const realIdx = (((idx - CLONE_COUNT) % n) + n) % n;
  const totalDots = Math.ceil(n / visible);
  const activeDot = Math.min(Math.floor(realIdx / visible), totalDots - 1);

  return (
    <div className={`select-none ${className ?? ""}`}>
      <div className="relative">
        {/* ── Left arrow ── */}
        {n > 1 && (
          <button
            onClick={() => goTo(idx - 1)}
            aria-label="Previous"
            className="absolute -left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 shadow-lg transition hover:bg-black/55 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* ── Track ── */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex cursor-grab active:cursor-grabbing"
            style={{
              gap: GAP,
              transform: `translateX(${translateX}px)`,
              transition: animated
                ? "transform 0.42s cubic-bezier(0.4,0,0.2,1)"
                : "none",
              willChange: "transform",
              touchAction: "pan-y",
            }}
            onPointerDown={n > 1 ? onPointerDown : undefined}
            onPointerMove={n > 1 ? onPointerMove : undefined}
            onPointerUp={n > 1 ? onPointerUp : undefined}
            onPointerCancel={n > 1 ? onPointerUp : undefined}
            onTransitionEnd={onTransitionEnd}
          >
            {track.map((item, i) => {
              const isClone = i < CLONE_COUNT || i >= CLONE_COUNT + n;
              return (
                <div
                  key={`${getKey(item)}-${i}`}
                  style={{ width: cardWidth, flexShrink: 0 }}
                >
                  {children(item, { isClone, wasDragging })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right arrow ── */}
        {n > 1 && (
          <button
            onClick={() => goTo(idx + 1)}
            aria-label="Next"
            className="absolute -right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 shadow-lg transition hover:bg-black/55 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Dots ── */}
      {totalDots > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => goTo(CLONE_COUNT + i * visible)}
              className={[
                "rounded-full transition-all duration-300 cursor-pointer",
                i === activeDot
                  ? "h-2.5 w-7 bg-gold"
                  : "h-2 w-2 bg-gold/20 hover:bg-gold/40",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
