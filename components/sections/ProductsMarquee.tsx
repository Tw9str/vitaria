"use client";

import Carousel from "@/components/shared/Carousel";
import ProductCard, {
  type MarqueeCard,
} from "@/components/products/ProductCard";

export type { MarqueeCard };

export default function ProductsCarousel({ cards }: { cards: MarqueeCard[] }) {
  return (
    <Carousel
      items={cards}
      getKey={(c) => c.slug}
      className="mx-auto max-w-290 px-5"
    >
      {(card, { isClone, wasDragging }) => (
        <ProductCard card={card} isClone={isClone} wasDragging={wasDragging} />
      )}
    </Carousel>
  );
}
