/**
 * MVP feed parser: normalize affiliate/product feeds into Product[]
 * - Input: JSON array from affiliate networks or retailers (CSV/XML transform TBD)
 * - Output: normalized JSON ready for indexing
 */
import fs from "node:fs";
import { Product } from "@/lib/types";

type RawItem = Record<string, string>;

function extractAttributes(text: string) {
  const t = text.toLowerCase();
  const downType = /구스|goose/.test(t) ? "goose" : /덕|duck/.test(t) ? "duck" : undefined;
  const downRatio = /90[\/\-]10/.test(t) ? "90-10" : /80[\/\-]20/.test(t) ? "80-20" : /70[\/\-]30/.test(t) ? "70-30" : undefined;
  const hood = /(노후드|no[-\s]?hood)/.test(t) ? false : /(후드|hood)/.test(t) ? true : undefined;
  const fit = /(스탠다드|standard)/.test(t) ? "standard" : /(레귤러|regular)/.test(t) ? "regular" : /(루즈|loose)/.test(t) ? "loose" : undefined;
  const shell = /(gore[-\s]?tex|고어텍스)/.test(t) ? "gore-tex" : /(나일론|nylon)/.test(t) ? "nylon" : /(폴리|poly)/.test(t) ? "poly" : undefined;
  const fpMatch = /(\d{3,4})\s?fp/.exec(t);
  const fillPower = fpMatch ? Number(fpMatch[1]) : undefined;

  return { downType, downRatio, hood, fit, shell, fillPower };
}

export function normalize(raw: RawItem): Product {
  const price = Number(raw.price ?? raw.salePrice ?? 0);
  const originalPrice = Number(raw.originalPrice ?? raw.listPrice ?? 0) || undefined;
  const discountRate = originalPrice ? Math.round(100 - (price / originalPrice) * 100) : 0;

  const text = [raw.title, raw.description, raw.category, raw.attributes].filter(Boolean).join(" ");
  const attrs = extractAttributes(text);

  const now = new Date().toISOString();
  return {
    id: raw.id ?? raw.sku ?? crypto.randomUUID(),
    brand: raw.brand ?? "UNKNOWN",
    category: (raw.category ?? "outer").toLowerCase(),
    title: raw.title ?? "",
    imageUrl: (raw.imageUrl ?? raw.image ?? "").toString(),
    price,
    originalPrice,
    discountRate,
    currency: "KRW",
    seller: raw.seller ?? raw.merchant ?? "",
    deeplink: raw.link ?? raw.url ?? "",
    inStock: (raw.inStock ?? raw.stock ?? "true").toString().toLowerCase() !== "false",
    updatedAt: now,
    ...attrs,
  };
}

if (require.main === module) {
  const input = process.argv[2];
  const output = process.argv[3] ?? "out/products.json";
  if (!input) {
    console.error("Usage: ts-node scripts/parseFeeds.ts <input.json> [output.json]");
    process.exit(1);
  }
  const raw: RawItem[] = JSON.parse(fs.readFileSync(input, "utf-8"));
  const products = raw.map(normalize);
  fs.mkdirSync(require("node:path").dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(products, null, 2));
  console.log(`Wrote ${products.length} products to ${output}`);
}