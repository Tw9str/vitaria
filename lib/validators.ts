import { z } from "zod";

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(70, "Title must be 70 characters or fewer."),
  summary: z
    .string()
    .min(2, "Summary must be at least 2 characters.")
    .max(180, "Summary must be 180 characters or fewer."),
  highlight: z
    .string()
    .max(30, "Highlight must be 30 characters or fewer.")
    .optional()
    .or(z.literal("")),
  image: z.string().max(300).default(""),

  gallery: z.array(z.string().max(300)).default([]),

  sections: z
    .array(
      z.object({
        heading: z.string().max(60, "Heading must be 60 characters or fewer."),
        items: z
          .array(
            z.string().max(300, "Each item must be 300 characters or fewer."),
          )
          .default([]),
      }),
    )
    .default([]),

  specs: z
    .array(
      z.object({
        label: z
          .string()
          .min(1, "Label is required.")
          .max(60, "Label must be 60 characters or fewer."),
        value: z
          .string()
          .min(1, "Value is required.")
          .max(120, "Value must be 120 characters or fewer."),
      }),
    )
    .default([]),

  published: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

// ---------------------------------------------------------------------------
// Lead (wholesale inquiry form)
// ---------------------------------------------------------------------------

const BUSINESS_TYPES = [
  "Retail store",
  "E-commerce",
  "Distributor",
  "Hospitality",
  "Other",
] as const;

export const leadSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z.email("Please enter a valid email address."),
  company: z
    .string()
    .min(1, "Company name is required.")
    .max(120, "Company must be 120 characters or fewer."),
  website: z
    .string()
    .max(200, "Website must be 200 characters or fewer.")
    .optional()
    .or(z.literal("")),
  type: z.enum(BUSINESS_TYPES, {
    error: "Please select a business type.",
  }),
  region: z
    .string()
    .max(80, "Region must be 80 characters or fewer.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(2000, "Message must be 2000 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ---------------------------------------------------------------------------
// Admin login
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Image file (client-side only — uses browser File API)
// ---------------------------------------------------------------------------

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export const imageFileSchema = z
  .custom<File>((val) => val instanceof File, "Please select a file.")
  .refine(
    (f) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
    "Only JPEG, PNG, and WebP images are allowed.",
  )
  .refine((f) => f.size <= MAX_IMAGE_BYTES, "File exceeds the 8 MB limit.");

// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  image: z
    .string()
    .max(500, "Image key must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
