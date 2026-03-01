import { prisma } from "@/lib/prismaClient";

// ---------------------------------------------------------------------------
// Selects
// ---------------------------------------------------------------------------

/** Columns used on the public product listing. */
const PRODUCT_CARD_SELECT = {
  slug: true,
  title: true,
  summary: true,
  highlight: true,
  image: true,
  specs: true,
  createdAt: true,
} as const;

/** Columns used on the public product detail page. */
const PRODUCT_DETAIL_SELECT = {
  slug: true,
  title: true,
  summary: true,
  highlight: true,
  image: true,
  sections: true,
  specs: true,
  gallery: true,
} as const;

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

/** All published products for the storefront listing. */
export async function getPublishedProducts({ take }: { take?: number } = {}) {
  try {
    return await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: PRODUCT_CARD_SELECT,
      ...(take !== undefined && { take }),
    });
  } catch (cause) {
    throw new Error("Failed to load products. Please try again later.", {
      cause,
    });
  }
}

/** Single product by slug (published only) for the public detail page. */
export async function getPublishedProductBySlug(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { slug, published: true },
      select: PRODUCT_DETAIL_SELECT,
    });
  } catch (cause) {
    throw new Error(`Failed to load product "${slug}".`, { cause });
  }
}

/** All published slugs for static-param generation. */
export async function getAllPublishedSlugs() {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch (cause) {
    throw new Error("Failed to load product slugs.", { cause });
  }
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

/** All products (any state) for the admin list. */
export async function getAllProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
    });
  } catch (cause) {
    throw new Error("Failed to load product list.", { cause });
  }
}

/** Single product by id for the admin editor. */
export async function getProductById(id: string) {
  try {
    return await prisma.product.findUnique({ where: { id } });
  } catch (cause) {
    throw new Error(`Failed to load product with id "${id}".`, { cause });
  }
}
