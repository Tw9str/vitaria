"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Spinner from "@/components/shared/Spinner";
import { Prisma } from "@prisma/client";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  deleteProductAction,
  upsertProductAction,
  type ProductActionState,
} from "@/app/actions/product";
import { useToast } from "@/components/shared/Toaster";
import { ACCEPTED_IMAGE_TYPES as ACCEPTED_TYPES } from "@/lib/validators";
import { Field, FieldErrors, Progress } from "./ProductFormFields";
import { useProductImageUploads } from "./useProductImageUploads";

type SectionData = { heading: string; items: string[] };
type SpecData = { label: string; value: string };

type Product = Prisma.ProductGetPayload<{}> & {
  sections?: SectionData[] | null;
  specs?: SpecData[] | null;
};

const ACCEPTED_IMAGE_TYPES = ACCEPTED_TYPES.join(",");

// ---------------------------------------------------------------------------
// Hook: controlled field values — seeded from submitted values on error,
// or from the saved product initially.
// ---------------------------------------------------------------------------
function useFieldValues(
  product: Product | undefined,
  actionState: ProductActionState,
) {
  const v = actionState?.values;
  const seed = (key: string, fallback = "") => v?.[key] ?? fallback;

  const [title, setTitle] = useState(() => seed("title", product?.title ?? ""));
  const [summary, setSummary] = useState(() =>
    seed("summary", product?.summary ?? ""),
  );
  const [highlight, setHighlight] = useState(() =>
    seed("highlight", product?.highlight ?? ""),
  );

  // sections / specs are submitted as JSON strings; on error they restore to
  // the last submitted state, on first render they seed from the saved product.
  const [sections, setSections] = useState<SectionData[]>(() => {
    if (v?.["sections"]) {
      try {
        return JSON.parse(v["sections"]) as SectionData[];
      } catch {
        /* ignore */
      }
    }
    return product?.sections ?? [];
  });

  const [specs, setSpecs] = useState<SpecData[]>(() => {
    if (v?.["specs"]) {
      try {
        return JSON.parse(v["specs"]) as SpecData[];
      } catch {
        /* ignore */
      }
    }
    return product?.specs ?? [];
  });

  const [published, setPublished] = useState(
    v ? v["published"] === "on" : (product?.published ?? false),
  );

  // Sync all fields when a new actionState with values arrives.
  const prevValuesRef = useRef(v);
  if (prevValuesRef.current !== v && v) {
    prevValuesRef.current = v;
    setTitle(v["title"] ?? "");
    setSummary(v["summary"] ?? "");
    setHighlight(v["highlight"] ?? "");
    try {
      setSections(JSON.parse(v["sections"] ?? "[]"));
    } catch {
      setSections([]);
    }
    try {
      setSpecs(JSON.parse(v["specs"] ?? "[]"));
    } catch {
      setSpecs([]);
    }
    setPublished(v["published"] === "on");
  }

  return {
    title,
    setTitle,
    summary,
    setSummary,
    highlight,
    setHighlight,
    sections,
    setSections,
    specs,
    setSpecs,
    published,
    setPublished,
  };
}

// ---------------------------------------------------------------------------
// SectionsEditor — unlimited custom sections, each with heading + item list
// ---------------------------------------------------------------------------
function ItemList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX = 300;

  const add = () => {
    const t = draft.trim();
    if (!t || t.length > MAX) return;
    onChange([...items, t]);
    setDraft("");
    inputRef.current?.focus();
  };

  const pct = draft.length / MAX;
  const countColor =
    pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-subtle";

  return (
    <div className="space-y-1.5 pl-3 border-l-2 border-border">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-xl border border-default bg-black/5 px-3 py-1.5"
        >
          <span className="flex-1 text-sm break-all">{item}</span>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-full p-1 text-muted hover:text-red-500 transition"
            aria-label="Remove item"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-0.5">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Add item…"
            maxLength={MAX}
            className="w-full rounded-xl border border-default bg-black/10 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-gold/15"
          />
          {draft.length > 0 && (
            <span
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${countColor}`}
            >
              {draft.length}/{MAX}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || draft.length > MAX}
          className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold border border-default bg-surface hover:brightness-110 disabled:opacity-40 transition cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function SectionsEditor({
  sections,
  onChange,
  errors,
}: {
  sections: SectionData[];
  onChange: (s: SectionData[]) => void;
  errors?: string[];
}) {
  const addSection = () => onChange([...sections, { heading: "", items: [] }]);

  const updateHeading = (idx: number, heading: string) =>
    onChange(sections.map((s, i) => (i === idx ? { ...s, heading } : s)));

  const updateItems = (idx: number, items: string[]) =>
    onChange(sections.map((s, i) => (i === idx ? { ...s, items } : s)));

  const remove = (idx: number) =>
    onChange(sections.filter((_, i) => i !== idx));

  const move = (from: number, to: number) => {
    const copy = [...sections];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {sections.map((sec, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-default bg-black/5 p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            {/* Heading input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={sec.heading}
                onChange={(e) => updateHeading(idx, e.target.value)}
                placeholder="Section heading…"
                maxLength={60}
                className="w-full rounded-xl border border-default bg-black/10 px-3 py-2 text-sm font-semibold outline-none focus:ring-4 focus:ring-gold/15"
              />
              {sec.heading.length > 0 && (
                <span
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                    sec.heading.length / 60 >= 1
                      ? "text-red-500"
                      : sec.heading.length / 60 >= 0.85
                        ? "text-amber-500"
                        : "text-subtle"
                  }`}
                >
                  {sec.heading.length}/60
                </span>
              )}
            </div>
            {/* Move up/down */}
            <button
              type="button"
              onClick={() => idx > 0 && move(idx, idx - 1)}
              disabled={idx === 0}
              className="rounded-full p-1.5 border border-default bg-surface text-muted hover:text-text disabled:opacity-30 transition"
              aria-label="Move section up"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => idx < sections.length - 1 && move(idx, idx + 1)}
              disabled={idx === sections.length - 1}
              className="rounded-full p-1.5 border border-default bg-surface text-muted hover:text-text disabled:opacity-30 transition"
              aria-label="Move section down"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded-full p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
              aria-label="Remove section"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ItemList
            items={sec.items}
            onChange={(items) => updateItems(idx, items)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="w-full rounded-2xl border border-dashed border-border py-2.5 text-sm text-muted hover:border-text/30 hover:text-text transition cursor-pointer"
      >
        + Add section
      </button>
      <FieldErrors errors={errors} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpecsEditor — free key-value pair rows
// ---------------------------------------------------------------------------
function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition cursor-pointer whitespace-nowrap"
    >
      {pending && <Spinner className="h-3.5 w-3.5" />}
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}

function SpecsEditor({
  specs,
  onChange,
  errors,
}: {
  specs: SpecData[];
  onChange: (s: SpecData[]) => void;
  errors?: string[];
}) {
  const add = () => onChange([...specs, { label: "", value: "" }]);

  const update = (idx: number, field: "label" | "value", val: string) =>
    onChange(specs.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));

  const remove = (idx: number) => onChange(specs.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {specs.map((spec, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="relative w-2/5">
            <input
              type="text"
              value={spec.label}
              onChange={(e) => update(idx, "label", e.target.value)}
              placeholder="Label"
              maxLength={60}
              className="w-full rounded-xl border border-default bg-black/10 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-gold/15"
            />
            {spec.label.length > 0 && (
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                  spec.label.length / 60 >= 1
                    ? "text-red-500"
                    : spec.label.length / 60 >= 0.85
                      ? "text-amber-500"
                      : "text-subtle"
                }`}
              >
                {spec.label.length}/60
              </span>
            )}
          </div>
          <span className="text-muted text-sm">:</span>
          <div className="relative flex-1">
            <input
              type="text"
              value={spec.value}
              onChange={(e) => update(idx, "value", e.target.value)}
              placeholder="Value"
              maxLength={120}
              className="w-full rounded-xl border border-default bg-black/10 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-gold/15"
            />
            {spec.value.length > 0 && (
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                  spec.value.length / 120 >= 1
                    ? "text-red-500"
                    : spec.value.length / 120 >= 0.85
                      ? "text-amber-500"
                      : "text-subtle"
                }`}
              >
                {spec.value.length}/120
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="shrink-0 rounded-full p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
            aria-label="Remove row"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-2xl border border-dashed border-border py-2.5 text-sm text-muted hover:border-text/30 hover:text-text transition cursor-pointer"
      >
        + Add row
      </button>
      <FieldErrors errors={errors} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionCard — groups related fields with a labelled header
// ---------------------------------------------------------------------------
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </p>
        {description && (
          <p className="text-xs text-subtle mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProductEditorForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: Product;
}) {
  const [actionState, formAction, isPending] = useActionState<
    ProductActionState,
    FormData
  >(upsertProductAction, null);

  const tempId = useRef<string>(crypto.randomUUID());
  const productId = product?.id ?? tempId.current;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toast = useToast();
  const router = useRouter();
  const prevStateRef = useRef<ProductActionState>(null);
  useEffect(() => {
    if (actionState === prevStateRef.current) return;
    prevStateRef.current = actionState;
    if (actionState?.success) {
      toast.success("Product saved.");
      router.push("/admin/products");
    } else if (actionState?.formError) toast.error(actionState.formError);
  }, [actionState]); // eslint-disable-line react-hooks/exhaustive-deps

  const fields = useFieldValues(product, actionState);

  const {
    heroKey,
    heroUi,
    uploadHero,
    galleryKeys,
    uploads,
    galleryError,
    viewUrlMap,
    addGalleryFiles,
    removeGalleryKey,
    reorderGallery,
    retryFailedUploads,
    removeUpload,
  } = useProductImageUploads({
    productId,
    initialHeroKey: product?.image ?? "",
    initialGalleryKeys: product?.gallery ?? [],
  });

  const dragFrom = useRef<number | null>(null);

  return (
    <div>
      <form action={formAction} noValidate className="space-y-4">
        {/* ── Sticky action bar ─────────────────────────────────── */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-surface/80 backdrop-blur-xl shadow-[0_1px_0_0_var(--color-border)] flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/products"
              className="shrink-0 flex items-center justify-center rounded-full border border-border bg-surface p-1.5 text-muted hover:text-text hover:border-text/25 transition"
              aria-label="Back to products"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold truncate">
              {mode === "create"
                ? "New product"
                : (product?.title ?? "Edit product")}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Publish status toggle */}
            <button
              type="button"
              onClick={() => fields.setPublished(!fields.published)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                fields.published
                  ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                  : "bg-amber-400/10 border-amber-400/30 text-amber-600 dark:text-amber-400 hover:bg-amber-400/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  fields.published ? "bg-green-500" : "bg-amber-400"
                }`}
              />
              {fields.published ? "Published" : "Draft"}
            </button>

            {/* Save */}
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white bg-brand-ink hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner className="h-3.5 w-3.5" />
                  Saving
                </>
              ) : (
                <>Save</>
              )}
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={product?.id ?? ""} readOnly />
        <input type="hidden" name="image" value={heroKey} readOnly />
        <input
          type="hidden"
          name="gallery"
          value={galleryKeys.join("\n")}
          readOnly
        />
        {/* Hidden published value — controlled by the toggle in the action bar */}
        <input
          type="hidden"
          name="published"
          value={fields.published ? "on" : ""}
          readOnly
        />

        {/* ── Details ──────────────────────────────────────────── */}
        <SectionCard
          title="Details"
          description="Core product identity shown on the storefront."
        >
          <Field
            label="Title"
            name="title"
            value={fields.title}
            onChange={fields.setTitle}
            placeholder="Signature Line"
            maxLength={70}
            errors={actionState?.fieldErrors?.title}
          />
          <Field
            label="Summary"
            name="summary"
            value={fields.summary}
            onChange={fields.setSummary}
            placeholder="Core best-sellers across all categories…"
            maxLength={180}
            rows={3}
            errors={actionState?.fieldErrors?.summary}
          />
          <Field
            label="Highlight"
            name="highlight"
            value={fields.highlight}
            onChange={fields.setHighlight}
            placeholder="Best sellers"
            maxLength={30}
            errors={actionState?.fieldErrors?.highlight}
          />
          {/* Public URL — read-only, edit mode only */}
          {mode === "edit" && product?.slug && (
            <div>
              <span className="text-xs text-subtle block mb-1.5">
                Public URL
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-black/5 px-4 py-2.5 text-sm text-muted font-mono break-all">
                /products/{actionState?.savedSlug ?? product.slug}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Hero image ────────────────────────────────────────── */}
        <SectionCard
          title="Hero image"
          description="Primary image shown at the top of the product page."
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="rounded-full px-4 py-2 font-semibold border border-default bg-surface hover:brightness-110 cursor-pointer">
              Upload hero
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={(e) => {
                  const f = e.currentTarget.files?.[0];
                  if (f) void uploadHero(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>

            {heroUi.status === "uploading" && (
              <Progress
                label={`Uploading… ${heroUi.progress}%`}
                value={heroUi.progress}
              />
            )}
            {heroUi.status === "error" && (
              <div className="text-xs text-red-500">
                {heroUi.error ?? "Hero upload failed"}
              </div>
            )}

            <div className="text-xs text-subtle break-all">
              {heroKey ? (
                <>
                  Stored key: <span className="font-mono">{heroKey}</span>
                </>
              ) : (
                "No hero image uploaded yet."
              )}
            </div>
          </div>

          {viewUrlMap[heroKey] ? (
            <div className="relative mt-2 h-48 w-full overflow-hidden rounded-2xl border border-default">
              <Image
                src={viewUrlMap[heroKey]}
                alt="Hero"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </SectionCard>

        {/* ── Specs ────────────────────────────────────────────── */}
        <SectionCard
          title="Specs"
          description="Key-value details shown on the product page (e.g. Minimum order: 1–2 cases)."
        >
          <input
            type="hidden"
            name="specs"
            value={JSON.stringify(fields.specs)}
            readOnly
          />
          <SpecsEditor
            specs={fields.specs}
            onChange={fields.setSpecs}
            errors={actionState?.fieldErrors?.specs}
          />
        </SectionCard>

        {/* ── Gallery ───────────────────────────────────────────── */}
        <SectionCard
          title="Gallery"
          description="Additional images shown in the product carousel. Drag to reorder."
        >
          <div className="flex flex-wrap items-center gap-2">
            <label className="rounded-full px-4 py-2 font-semibold border border-default bg-surface hover:brightness-110 cursor-pointer">
              Add images
              <input
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={(e) => {
                  const f = e.currentTarget.files;
                  if (f?.length) addGalleryFiles(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>

            <div className="text-xs text-subtle">
              {galleryKeys.length} saved •{" "}
              {uploads.filter((u) => u.status === "queued").length} queued
            </div>

            {galleryError && (
              <p className="w-full text-xs text-red-500">{galleryError}</p>
            )}
          </div>

          {galleryKeys.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryKeys.map((key, idx) => (
                <div
                  key={key}
                  className="relative overflow-hidden rounded-2xl border border-default bg-black/10"
                  draggable
                  onDragStart={() => (dragFrom.current = idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragFrom.current === null) return;
                    reorderGallery(dragFrom.current, idx);
                    dragFrom.current = null;
                  }}
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={viewUrlMap[key] ?? "/"}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 260px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/70 to-transparent text-white">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] opacity-90 truncate">
                        Drag to reorder
                      </div>
                      <button
                        type="button"
                        className="rounded-lg bg-white/15 px-2 py-1 text-[11px] hover:bg-white/25"
                        onClick={() => removeGalleryKey(key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-subtle">No gallery images yet.</div>
          )}

          {uploads.length ? (
            <div className="mt-2 space-y-2">
              {uploads.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl border border-default bg-black/10 p-3"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-default">
                    <Image
                      src={u.localUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{u.file.name}</div>
                    <div className="text-xs text-subtle">
                      {u.status === "queued" && "Queued"}
                      {u.status === "uploading" && `Uploading ${u.progress}%`}
                      {u.status === "error" && (u.error ?? "Error")}
                    </div>
                    {u.status === "uploading" && (
                      <div className="mt-2 h-1 w-full rounded bg-black/20">
                        <div
                          className="h-1 rounded bg-black"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="rounded-full px-3 py-2 text-xs font-semibold border border-default bg-surface hover:brightness-110 disabled:opacity-60"
                    onClick={() => removeUpload(u.id)}
                    disabled={u.status === "uploading"}
                  >
                    Remove
                  </button>
                </div>
              ))}

              {uploads.some((u) => u.status === "error") && (
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-xs font-semibold border border-default bg-surface hover:brightness-110"
                  onClick={retryFailedUploads}
                >
                  Retry failed uploads
                </button>
              )}
            </div>
          ) : null}
        </SectionCard>

        {/* ── Sections ──────────────────────────────────────────── */}
        <SectionCard
          title="Sections"
          description="Custom content blocks shown on the product page. Add as many as you need."
        >
          <input
            type="hidden"
            name="sections"
            value={JSON.stringify(fields.sections)}
            readOnly
          />
          <SectionsEditor
            sections={fields.sections}
            onChange={fields.setSections}
            errors={actionState?.fieldErrors?.sections}
          />
        </SectionCard>
      </form>

      {/* ── Danger zone ── outside the main form ──────────────── */}
      {product?.id ? (
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-subtle uppercase tracking-wider">
              Danger zone
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/3 p-5 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-red-500">
                Delete this product
              </p>
              <p className="mt-1 text-xs text-muted">
                Permanently removes the product and all its images. This cannot
                be undone.
              </p>
            </div>
            <form action={deleteProductAction} className="shrink-0">
              <input type="hidden" name="id" value={product.id} />
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full px-4 py-2 text-sm font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition cursor-pointer whitespace-nowrap"
                >
                  Delete product
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <DeleteSubmitButton />
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full px-4 py-2 text-sm font-semibold border border-border bg-surface hover:brightness-110 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
