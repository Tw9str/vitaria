"use server";

import { auth } from "@/lib/auth";
import { requireRole, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prismaClient";
import { productSchema, type ProductInput } from "@/lib/validators";
import { deleteProductStorage, deleteStorageKeys } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { appendLog } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a newline-delimited textarea value into a trimmed string array. */
function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getString(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

/** Generate a unique slug from a title.
 *  Keeps Arabic (and any Unicode letters/digits) as-is.
 *  Spaces become hyphens, unsafe URL characters are stripped.
 *  Appends -2, -3 … on collision, skipping the product’s own id.
 */
async function generateSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") // spaces → hyphens
      .replace(/[^\p{L}\p{N}-]/gu, "") // strip non-letter, non-digit, non-hyphen
      .replace(/-+/g, "-") // collapse duplicate hyphens
      .replace(/^-|-$/g, "") || // trim edge hyphens
    `product-${Math.random().toString(36).slice(2, 8)}`;

  let slug = base;
  let attempt = 1;
  while (attempt <= 99) {
    const hit = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!hit || hit.id === excludeId) break;
    attempt++;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type ProductFieldErrors = Partial<Record<keyof ProductInput, string[]>>;

export type ProductActionState = {
  fieldErrors?: ProductFieldErrors;
  formError?: string;
  success?: boolean;
  /** Updated slug after a successful save (may differ from the prop if title changed). */
  savedSlug?: string;
  /** Raw submitted values — returned on validation failure so the form can
   *  restore what the user typed. */
  values?: Partial<Record<string, string>>;
} | null;

export async function upsertProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await auth();
  requireAuth(session?.role);

  const isAdmin = session?.role === "admin";
  const rawId = getString(formData, "id") || undefined;

  // Editors cannot change the published state.
  // For new products they always create as draft; for existing products the
  // current published value is preserved so an admin's live product stays live.
  let publishedValue: boolean;
  if (isAdmin) {
    publishedValue = formData.get("published") === "on";
  } else if (rawId) {
    const existing = await prisma.product.findUnique({
      where: { id: rawId },
      select: { published: true },
    });
    publishedValue = existing?.published ?? false;
  } else {
    publishedValue = false;
  }

  const raw = {
    id: rawId,
    title: getString(formData, "title"),
    summary: getString(formData, "summary"),
    highlight: getString(formData, "highlight"),
    image: getString(formData, "image"),

    moq: getString(formData, "moq"),
    leadTime: getString(formData, "leadTime"),
    casePack: getString(formData, "casePack"),
    shipping: getString(formData, "shipping"),

    gallery: parseLines(formData.get("gallery")),
    sections: (() => {
      try {
        return JSON.parse(getString(formData, "sections") || "[]") as unknown[];
      } catch {
        return [];
      }
    })(),
    specs: (() => {
      try {
        return JSON.parse(getString(formData, "specs") || "[]") as unknown[];
      } catch {
        return [];
      }
    })(),

    published: publishedValue,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ProductFieldErrors = {};
    let formError: string | undefined;
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof ProductFieldErrors | undefined;
      if (field) {
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field]!.push(issue.message);
      } else {
        formError ??= issue.message;
      }
    }
    // Return submitted string values so the client can repopulate the form.
    const values: Record<string, string> = {};
    for (const key of formData.keys()) {
      const v = formData.get(key);
      if (typeof v === "string") values[key] = v;
    }
    return { fieldErrors, formError, values };
  }

  const { id, ...data } = parsed.data;

  // -------------------------------------------------------------------------
  // Slug: always derived from the current title so renaming a product keeps
  // its URL in sync. uniqueSlug excludes the current product from collision
  // checks so it won't append -2 when the slug hasn't actually changed.
  // -------------------------------------------------------------------------
  const newSlug = await generateSlug(data.title, id);
  if (id) {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { image: true, gallery: true },
    });

    if (existing) {
      const keysToDelete: string[] = [];

      // Hero replaced → delete old key
      if (existing.image && existing.image !== data.image) {
        keysToDelete.push(existing.image);
      }

      // Gallery items removed → delete the ones no longer in the incoming list
      const incomingSet = new Set(data.gallery);
      for (const key of existing.gallery) {
        if (key && !incomingSet.has(key)) keysToDelete.push(key);
      }

      if (keysToDelete.length) {
        await deleteStorageKeys(keysToDelete);
      }
    }
  }

  const saved = id
    ? await prisma.product.update({
        where: { id },
        data: { ...data, slug: newSlug },
      })
    : await prisma.product.create({ data: { ...data, slug: newSlug } });

  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };
  void appendLog({
    ...actor,
    action: id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
    entity: "product",
    entityId: saved.id,
    entityTitle: saved.title,
  });

  revalidatePath("/");
  revalidatePath(`/products/${saved.slug}`);

  return { success: true, savedSlug: saved.slug };
}

export async function deleteProductAction(formData: FormData) {
  const session = await auth();
  requireRole(session?.role, "admin");
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  const id = getString(formData, "id");
  if (!id) throw new Error("Missing product id.");

  // Fetch image keys before deleting the DB record
  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, gallery: true, title: true },
  });

  await prisma.product.delete({ where: { id } });
  void appendLog({
    ...actor,
    action: "PRODUCT_DELETED",
    entity: "product",
    entityId: id,
    entityTitle: product?.title,
    severity: "warning",
  });

  // Clean up R2 after DB delete (non-blocking — errors are logged, not thrown)
  if (product) {
    await deleteProductStorage(product.image, product.gallery);
  }

  revalidatePath("/");
  redirect("/admin/products");
}

export async function toggleProductPublishedAction(
  id: string,
  published: boolean,
): Promise<void> {
  const session = await auth();
  requireRole(session?.role, "admin");
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };
  if (!id) throw new Error("Missing product id.");
  const product = await prisma.product.update({
    where: { id },
    data: { published },
    select: { title: true },
  });
  void appendLog({
    ...actor,
    action: published ? "PRODUCT_PUBLISHED" : "PRODUCT_UNPUBLISHED",
    entity: "product",
    entityId: id,
    entityTitle: product.title,
  });
  revalidatePath("/");
}

export async function quickDeleteProductAction(id: string): Promise<void> {
  const session = await auth();
  requireRole(session?.role, "admin");
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };
  if (!id) throw new Error("Missing product id.");

  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, gallery: true, title: true },
  });

  await prisma.product.delete({ where: { id } });
  void appendLog({
    ...actor,
    action: "PRODUCT_DELETED",
    entity: "product",
    entityId: id,
    entityTitle: product?.title,
    severity: "warning",
  });

  if (product) {
    await deleteProductStorage(product.image, product.gallery);
  }
  revalidatePath("/");
}
