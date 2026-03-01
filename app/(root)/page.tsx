import { Suspense } from "react";
import HeroSlider from "@/components/hero/HeroSlider";
import Products from "@/components/sections/Products";
import WhyVitaria from "@/components/sections/WhyVitaria";
import WholesaleDetails from "@/components/sections/WholesaleDetails";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbsJsonLd } from "@/lib/jsonld";
import { config } from "@/lib/config";

function ProductsSkeleton() {
  return (
    <section id="products" className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[18px] border border-border bg-surface"
            >
              <div className="h-45 animate-pulse bg-white/5" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="main">
      <JsonLd
        id="jsonld-breadcrumbs"
        data={breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Wholesale", path: "/#wholesale" },
        ])}
      />
      <HeroSlider />
      <Suspense fallback={<ProductsSkeleton />}>
        <Products />
      </Suspense>
      <WhyVitaria />
      <WholesaleDetails />
      <Contact turnstileSiteKey={config.turnstile.turnstileSiteKey} />
    </main>
  );
}
