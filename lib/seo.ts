import type { Metadata } from "next";
import { SITE } from "./site";

export function buildMetadata(args: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const {
    title,
    description,
    path = "/",
    image = "/images/hero/slide-1.jpg",
    noIndex = false,
  } = args;

  const canonical = new URL(path, SITE.url).toString();
  const ogImage = image.startsWith("http")
    ? image
    : new URL(image, SITE.url).toString();

  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name}`, template: `%s | ${SITE.name}` },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
