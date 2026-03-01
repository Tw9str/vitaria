"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── types & data ─────────────────────────────────────────────────────────────

type Slide = {
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/hero/slide-1.jpg",
    title: "Premium Wholesale Products",
    subtitle: "Designed for retailers. Built for repeat customers.",
    ctaText: "Request Wholesale Catalog",
    ctaHref: "#contact",
  },
  {
    image: "/images/hero/slide-2.jpg",
    title: "Retail-Ready Collections",
    subtitle: "High-margin product lines for modern stores.",
    ctaText: "View Products",
    ctaHref: "#products",
  },
  {
    image: "/images/hero/slide-3.jpg",
    title: "Trusted Wholesale Partner",
    subtitle: "Reliable supply, consistent quality, strong branding.",
    ctaText: "Wholesale Details",
    ctaHref: "#wholesale",
  },
];

const SLIDE_COUNT = SLIDES.length;

// ─── component ────────────────────────────────────────────────────────────────

type HeroSliderProps = {
  interval?: number;
  swipeThreshold?: number;
};

export default function HeroSlider({
  interval = 5000,
  swipeThreshold = 40,
}: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState("");

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  // ── timer ────────────────────────────────────────────────────────────────────

  function clearTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTick() {
    clearTick();
    if (!pausedRef.current) {
      tickRef.current = setInterval(
        () => setActive((v) => (v + 1) % SLIDE_COUNT),
        interval,
      );
    }
  }

  function goTo(i: number) {
    setActive(((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    startTick();
  }

  // ── effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    startTick();
    const onVisibilityChange = () =>
      document.hidden ? clearTick() : startTick();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearTick();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAnnounce(`${SLIDES[active].title}: ${SLIDES[active].subtitle}`);
  }, [active]);

  // ── handlers ─────────────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (startX == null || endX == null) return;
    const delta = endX - startX;
    if (delta > swipeThreshold) goTo(active - 1);
    else if (delta < -swipeThreshold) goTo(active + 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      goTo(active - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      goTo(active + 1);
      e.preventDefault();
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured wholesale highlights"
      className="relative h-[78vh] min-h-130 w-full overflow-hidden"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        pausedRef.current = true;
        clearTick();
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        startTick();
      }}
      onFocusCapture={(e) => {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "A" || e.target.tagName === "BUTTON")
        ) {
          pausedRef.current = true;
          clearTick();
        }
      }}
      onBlurCapture={(e) => {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "A" || e.target.tagName === "BUTTON")
        ) {
          pausedRef.current = false;
          startTick();
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      {SLIDES.map((slide, i) => {
        const isActive = i === active;
        const preload =
          i === active ||
          i === (active + 1) % SLIDE_COUNT ||
          i === (active - 1 + SLIDE_COUNT) % SLIDE_COUNT;
        return (
          <div
            key={slide.image}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: 1 }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={preload}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/20" />
            <div className="relative z-10 mx-auto flex h-full max-w-290 items-center px-6">
              <div className="max-w-170">
                <h1 className="text-[clamp(28px,4vw,64px)] leading-[1.05] tracking-[-0.02em] text-white/95">
                  {slide.title}
                </h1>
                <p className="mt-3 text-lg text-white/75">{slide.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={slide.ctaHref}
                    tabIndex={isActive ? undefined : -1}
                    className="inline-flex items-center justify-center rounded-full border border-gold/60 bg-linear-to-br from-gold/95 to-gold/65 px-6 py-3 font-semibold text-black transition hover:brightness-110"
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    href="#products"
                    tabIndex={isActive ? undefined : -1}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    View product lines
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 transition hover:bg-black/60"
      >
        <ChevronIcon d="M15 18l-6-6 6-6" />
      </button>

      <button
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 transition hover:bg-black/60"
      >
        <ChevronIcon d="M9 18l6-6-6-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            aria-current={i === active ? "true" : undefined}
            className={[
              "h-3 w-3 cursor-pointer rounded-full border transition",
              i === active
                ? "border-gold/80 bg-gold"
                : "border-white/35 bg-white/25 hover:bg-white/40",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function ChevronIcon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
