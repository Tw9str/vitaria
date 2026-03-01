export type ProductLine = {
  slug: string;
  title: string;
  description: string;
  highlight: string;
  image: string;        // hero image
  gallery?: string[];   // optional gallery images
  moqHint: string;
  leadTime?: string;
  casePack?: string;
  shipping?: string;
  idealFor?: string[];
  features?: string[];
  ctaText: string;
  ctaHref: string;
};

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: "signature",
    title: "Signature Line",
    description: "Core best-sellers • Case packs available • Year-round demand",
    highlight: "Best sellers",
    image: "/images/products/p3.jpg",
    gallery: ["/images/hero/slide-1.jpg", "/images/hero/slide-2.jpg", "/images/hero/slide-3.jpg"],
    moqHint: "MOQ: 1–2 cases (example)",
    leadTime: "3–5 business days (in-stock)",
    casePack: "6 / 12 units per SKU",
    shipping: "Domestic + international (example)",
    idealFor: ["Retail", "E-commerce", "Hospitality"],
    features: ["Retail-ready packaging", "Consistent supply", "Marketing assets available"],
    ctaText: "Request pricing",
    ctaHref: "#contact",
  },
  {
    slug: "seasonal",
    title: "Seasonal / Limited",
    description: "Newness driver • Perfect for drops & displays",
    highlight: "Limited",
    image: "/images/products/p2.jpg",
    moqHint: "Lead time: 2–4 weeks (example)",
    ctaText: "Get pricing",
    ctaHref: "#contact",
  },
  {
    slug: "gift-sets",
    title: "Gift Sets",
    description: "Higher AOV • Great for holidays & bundles",
    highlight: "Bundles",
    image: "/images/products/p3.jpg",
    moqHint: "Case pack: 6 / 12 (example)",
    ctaText: "Get pricing",
    ctaHref: "#contact",
  },
  {
    slug: "private-label",
    title: "Private Label",
    description: "Your brand • Custom packaging • Scalable production",
    highlight: "Custom",
    image: "/images/products/p1.jpg",
    moqHint: "MOQ: project-based",
    ctaText: "Inquire",
    ctaHref: "#contact",
  },
  {
    slug: "hospitality",
    title: "Hospitality Program",
    description: "Bulk options • Consistent specs • Reliable supply",
    highlight: "Bulk",
    image: "/images/products/p3.jpg",
    moqHint: "Shipping: domestic/international (example)",
    ctaText: "Inquire",
    ctaHref: "#contact",
  },
  {
    slug: "accessories",
    title: "Accessories",
    description: "Add-on items • Impulse-friendly • Merchandising support",
    highlight: "Add-ons",
    image: "/images/products/p2.jpg",
    moqHint: "Low MOQ options",
    ctaText: "Get pricing",
    ctaHref: "#contact",
  },
];
