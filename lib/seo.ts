import { Product, DownProduct, SlacksProduct, JeansProduct, CrewneckProduct, LongSleeveProduct, CoatProduct } from "./types";

export function buildProductJsonLd(p: Product) {
  const additional: any[] = [];
  
  // 카테고리별 속성 추가
  if (p.category === "down") {
    const down = p as DownProduct;
    if (down.downType) additional.push({ "@type": "PropertyValue", name: "Down Type", value: down.downType });
    if (down.downRatio) additional.push({ "@type": "PropertyValue", name: "Down Ratio", value: down.downRatio });
    if (typeof down.fillPower === "number") additional.push({ "@type": "PropertyValue", name: "Fill Power", value: down.fillPower });
    if (typeof down.hood === "boolean") additional.push({ "@type": "PropertyValue", name: "Hood", value: down.hood ? "Yes" : "No" });
    if (down.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: down.fit });
    if (down.shell) additional.push({ "@type": "PropertyValue", name: "Shell", value: down.shell });
  }
  
  if (p.category === "slacks") {
    const slacks = p as SlacksProduct;
    if (slacks.waistType) additional.push({ "@type": "PropertyValue", name: "Waist Type", value: slacks.waistType });
    if (slacks.legOpening) additional.push({ "@type": "PropertyValue", name: "Leg Opening", value: slacks.legOpening });
    if (typeof slacks.stretch === "boolean") additional.push({ "@type": "PropertyValue", name: "Stretch", value: slacks.stretch ? "Yes" : "No" });
    if (slacks.pleats) additional.push({ "@type": "PropertyValue", name: "Pleats", value: slacks.pleats });
    if (slacks.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: slacks.fit });
    if (slacks.shell) additional.push({ "@type": "PropertyValue", name: "Material", value: slacks.shell });
  }
  
  if (p.category === "jeans") {
    const jeans = p as JeansProduct;
    if (jeans.wash) additional.push({ "@type": "PropertyValue", name: "Wash", value: jeans.wash });
    if (jeans.cut) additional.push({ "@type": "PropertyValue", name: "Cut", value: jeans.cut });
    if (jeans.rise) additional.push({ "@type": "PropertyValue", name: "Rise", value: jeans.rise });
    if (typeof jeans.stretch === "boolean") additional.push({ "@type": "PropertyValue", name: "Stretch", value: jeans.stretch ? "Yes" : "No" });
    if (typeof jeans.distressed === "boolean") additional.push({ "@type": "PropertyValue", name: "Distressed", value: jeans.distressed ? "Yes" : "No" });
  }
  
  if (p.category === "crewneck") {
    const crew = p as CrewneckProduct;
    if (crew.neckline) additional.push({ "@type": "PropertyValue", name: "Neckline", value: crew.neckline });
    if (crew.sleeveLength) additional.push({ "@type": "PropertyValue", name: "Sleeve Length", value: crew.sleeveLength });
    if (crew.pattern) additional.push({ "@type": "PropertyValue", name: "Pattern", value: crew.pattern });
    if (crew.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: crew.fit });
    if (crew.shell) additional.push({ "@type": "PropertyValue", name: "Material", value: crew.shell });
  }
  
  if (p.category === "long-sleeve") {
    const longSleeve = p as LongSleeveProduct;
    if (longSleeve.neckline) additional.push({ "@type": "PropertyValue", name: "Neckline", value: longSleeve.neckline });
    if (longSleeve.sleeveType) additional.push({ "@type": "PropertyValue", name: "Sleeve Type", value: longSleeve.sleeveType });
    if (typeof longSleeve.layering === "boolean") additional.push({ "@type": "PropertyValue", name: "Layering", value: longSleeve.layering ? "Yes" : "No" });
    if (longSleeve.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: longSleeve.fit });
    if (longSleeve.shell) additional.push({ "@type": "PropertyValue", name: "Material", value: longSleeve.shell });
  }
  
  if (p.category === "coat") {
    const coat = p as CoatProduct;
    if (coat.length) additional.push({ "@type": "PropertyValue", name: "Length", value: coat.length });
    if (coat.closure) additional.push({ "@type": "PropertyValue", name: "Closure", value: coat.closure });
    if (coat.lining) additional.push({ "@type": "PropertyValue", name: "Lining", value: coat.lining });
    if (typeof coat.hood === "boolean") additional.push({ "@type": "PropertyValue", name: "Hood", value: coat.hood ? "Yes" : "No" });
    if (coat.fit) additional.push({ "@type": "PropertyValue", name: "Fit", value: coat.fit });
    if (coat.shell) additional.push({ "@type": "PropertyValue", name: "Material", value: coat.shell });
  }

// > Json for Linking Data

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