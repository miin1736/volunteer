import { Product } from "./types";

export function buildProductJsonLd(p: Product) {
  const additional: any[] = [];
  if (p.downType) additional.push({ "@type": "PropertyValue", name: "Down Type", value: p.downType });
  if (p.downRatio) additional.push({ "@type": "PropertyValue", name: "Down Ratio", value: p.downRatio });
  if (typeof p.fillPower === "number") additional.push({ "@type": "PropertyValue", name: "Fill Power", value: p.fillPower });
  if (typeof p.hood === "boolean") additional.push({ "@type": "PropertyValue", name: "Hood", value: p.hood ? "Yes" : "No" });
  if (p.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: p.fit });
  if (p.shell) additional.push({ "@type": "PropertyValue", name: "Shell", value: p.shell });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    brand: p.brand,
    image: p.imageUrl,
    additionalProperty: additional.length ? additional : undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: p.deeplink,
    },
  };
}