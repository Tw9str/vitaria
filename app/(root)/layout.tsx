import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import ThemeBootstrap from "@/components/shared/ThemeBootsrap";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";

export const metadata: Metadata = {
  ...buildMetadata({
    title: SITE.name,
    description:
      "VITARIA: premium product lines for retail partners. Request catalog, pricing, and samples.",
    path: "/",
    image: "/images/hero/slide-1.jpg",
  }),

  referrer: "strict-origin-when-cross-origin",

  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0f12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ThemeBootstrap />
      <JsonLd id="jsonld-org" data={organizationJsonLd()} />
      <JsonLd id="jsonld-website" data={websiteJsonLd()} />
      <Header />
      {children}
      <Footer />
    </>
  );
}
