import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "extra-virgin-olive-oil-500ml",
    title: "Extra Virgin Olive Oil 500ml",
    summary:
      "Cold-pressed from hand-picked olives harvested at peak ripeness. Rich, fruity flavour with a peppery finish.",
    highlight: "Best Seller",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "500 ml" },
      { label: "Acidity", value: "≤ 0.3%" },
      { label: "Origin", value: "Crete, Greece" },
      { label: "Certifications", value: "PDO, Organic" },
    ],
    sections: [
      {
        heading: "Tasting Notes",
        items: ["Fruity aroma", "Peppery finish", "Low bitterness"],
      },
      {
        heading: "Packaging",
        items: [
          "Dark glass bottle",
          "12 units per case",
          "Shelf life 24 months",
        ],
      },
    ],
  },
  {
    slug: "extra-virgin-olive-oil-1l",
    title: "Extra Virgin Olive Oil 1 L",
    summary:
      "Same premium cold-press quality in a larger format, ideal for restaurants and food-service accounts.",
    highlight: "Food Service",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "1 L" },
      { label: "Acidity", value: "≤ 0.3%" },
      { label: "Origin", value: "Crete, Greece" },
    ],
    sections: [
      {
        heading: "Packaging",
        items: ["Dark glass bottle", "6 units per case"],
      },
    ],
  },
  {
    slug: "organic-olive-oil-tin-3l",
    title: "Organic Olive Oil Tin 3 L",
    summary:
      "Certified organic, packed in a traditional tin for extended freshness. Perfect for wholesale and retail display.",
    highlight: "Organic",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "3 L" },
      { label: "Acidity", value: "≤ 0.5%" },
      { label: "Certifications", value: "EU Organic, BRC" },
    ],
    sections: [
      {
        heading: "Storage",
        items: ["Keep in a cool, dark place", "Do not refrigerate"],
      },
    ],
  },
  {
    slug: "kalamata-olives-pitted-250g",
    title: "Kalamata Olives Pitted 250 g",
    summary:
      "Firm, meaty Kalamata olives cured in red wine vinegar and sea salt. Ready-to-use for salads and antipasti.",
    highlight: "PDO",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "250 g" },
      { label: "Brine", value: "Red wine vinegar" },
      { label: "Origin", value: "Kalamata, Greece" },
      { label: "Shelf Life", value: "18 months" },
    ],
    sections: [
      {
        heading: "Serving Suggestions",
        items: ["Greek salad", "Antipasti platters", "Pizza topping"],
      },
    ],
  },
  {
    slug: "kalamata-olives-whole-500g",
    title: "Kalamata Olives Whole 500 g",
    summary:
      "Whole Kalamata olives in traditional brine. Distinctive almond shape and deep purple skin.",
    highlight: null,
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "500 g" },
      { label: "Brine", value: "Sea salt & water" },
      { label: "Origin", value: "Kalamata, Greece" },
    ],
    sections: [],
  },
  {
    slug: "olive-tapenade-dark-190g",
    title: "Dark Olive Tapenade 190 g",
    summary:
      "Finely blended Kalamata olives with capers, anchovies and lemon zest. A crowd-pleasing spread or condiment.",
    highlight: "New",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "190 g" },
      { label: "Format", value: "Glass jar" },
      { label: "Shelf Life", value: "12 months" },
    ],
    sections: [
      {
        heading: "Ingredients",
        items: ["Kalamata olives", "Capers", "Anchovies", "Lemon zest", "EVOO"],
      },
    ],
  },
  {
    slug: "herb-infused-olive-oil-250ml",
    title: "Herb-Infused Olive Oil 250 ml",
    summary:
      "Extra virgin olive oil infused with rosemary, thyme and garlic. Ready for drizzling on bread, fish or vegetables.",
    highlight: "Specialty",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "250 ml" },
      { label: "Base Oil", value: "Extra Virgin" },
      { label: "Infusion", value: "Rosemary, Thyme, Garlic" },
    ],
    sections: [],
  },
  {
    slug: "chilli-infused-olive-oil-250ml",
    title: "Chilli-Infused Olive Oil 250 ml",
    summary:
      "A gently spiced EVOO with sun-dried chillies. Adds warmth to pasta, pizza and marinades without overpowering.",
    highlight: "Specialty",
    image: "",
    gallery: [],
    published: false,
    specs: [
      { label: "Volume", value: "250 ml" },
      { label: "Heat Level", value: "Medium" },
      { label: "Base Oil", value: "Extra Virgin" },
    ],
    sections: [],
  },
  {
    slug: "olive-oil-soap-bar",
    title: "Pure Olive Oil Soap Bar",
    summary:
      "Handmade cold-process soap with 72 % pure olive oil. Deeply moisturising, suitable for sensitive skin.",
    highlight: "Natural",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Weight", value: "125 g" },
      { label: "Olive Oil Content", value: "72%" },
      { label: "Skin Type", value: "All / Sensitive" },
    ],
    sections: [
      {
        heading: "Ingredients",
        items: ["Olive oil", "Water", "Sodium hydroxide", "Sea salt"],
      },
    ],
  },
  {
    slug: "premium-gift-box-assortment",
    title: "Premium Gift Box Assortment",
    summary:
      "Curated gift set featuring a 500 ml EVOO, 190 g tapenade and 250 g pitted Kalamata olives. Ideal for retail gifting.",
    highlight: "Gift Set",
    image: "",
    gallery: [],
    published: false,
    specs: [
      { label: "Contents", value: "3 items" },
      { label: "Box Size", value: "28 × 18 × 10 cm" },
      { label: "MOQ", value: "12 units" },
    ],
    sections: [
      {
        heading: "Box Contents",
        items: [
          "500 ml Extra Virgin Olive Oil",
          "190 g Dark Olive Tapenade",
          "250 g Pitted Kalamata Olives",
        ],
      },
    ],
  },
];

async function main() {
  console.log("Seeding 10 products…");

  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      });
      console.log(`  ✓ ${p.title}`);
    } catch (e) {
      console.log(`  ✗ ${p.title}: ${e}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
