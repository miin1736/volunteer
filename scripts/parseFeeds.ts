/**
 * MVP feed parser: normalize affiliate/product feeds into Product[]
 * - Input: JSON array from affiliate networks or retailers (CSV/XML/JSON → assume JSON first)
 * - Output: normalized JSON ready for indexing
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Product } from "@/lib/types";

type RawItem = Record<string, string>;

type Attrs = {
  downType?: "goose" | "duck" | "synthetic";
  downRatio?: "90-10" | "80-20" | "70-30";
  hood?: boolean;
  fit?: "standard" | "regular" | "loose";
  shell?: "gore-tex" | "nylon" | "poly" | string;
  fillPower?: number;
};

function extractAttributes(text: string): Attrs {
  const t = text.toLowerCase();

  const downType =
    /구스|goose/.test(t)
      ? ("goose" as const)
      : /덕|duck/.test(t)
      ? ("duck" as const)
      : /synthetic|합성/.test(t)
      ? ("synthetic" as const)
      : undefined;

  const downRatio =
    /90[\/\-]10/.test(t)
      ? ("90-10" as const)
      : /80[\/\-]20/.test(t)
      ? ("80-20" as const)
      : /70[\/\-]30/.test(t)
      ? ("70-30" as const)
      : undefined;

  const hood = /(노후드|no[-\s]?hood)/.test(t)
    ? false
    : /(후드|hood)/.test(t)
    ? true
    : undefined;

  const fit =
    /(스탠다드|standard)/.test(t)
      ? ("standard" as const)
      : /(레귤러|regular)/.test(t)
      ? ("regular" as const)
      : /(루즈|loose)/.test(t)
      ? ("loose" as const)
      : undefined;

  const shell =
    /(gore[-\s]?tex|고어텍스)/.test(t)
      ? ("gore-tex" as const)
      : /(나일론|nylon)/.test(t)
      ? ("nylon" as const)
      : /(폴리|poly)/.test(t)
      ? ("poly" as const)
      : undefined;

  const fpMatch = /(\d{3,4})\s?fp/.exec(t);
  const fillPower = fpMatch ? Number(fpMatch[1]) : undefined;

  return { downType, downRatio, hood, fit, shell, fillPower };
}

export function normalize(raw: RawItem): Product {
  const price = Number(raw.price ?? raw.salePrice ?? 0);
  const originalPrice =
    Number(raw.originalPrice ?? raw.listPrice ?? 0) || undefined;
  const discountRate = originalPrice
    ? Math.round(100 - (price / originalPrice) * 100)
    : 0;

  const text = [raw.title, raw.description, raw.category, raw.attributes]
    .filter(Boolean)
    .join(" ");
  const attrs = extractAttributes(text);

  const now = new Date().toISOString();
  return {
    id: (raw.id ?? raw.sku ?? crypto.randomUUID()) as string,
    brand: (raw.brand ?? "UNKNOWN") as string,
    category: ((raw.category ?? "outer") as string).toLowerCase(),
    title: (raw.title ?? "") as string,
    imageUrl: ((raw.imageUrl ?? raw.image ?? "") as string).toString(),
    price,
    originalPrice,
    discountRate,
    currency: "KRW",
    seller: (raw.seller ?? raw.merchant ?? "") as string,
    deeplink: (raw.link ?? raw.url ?? "") as string,
    inStock:
      String(raw.inStock ?? raw.stock ?? "true")
        .toLowerCase()
        .trim() !== "false",
    updatedAt: now,
    ...attrs,
  };
}

// ESM equivalent of require.main === module check
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename || process.argv[1]?.endsWith('parseFeeds.ts');

if (isMainModule) {
  const input = process.argv[2];
  const output = process.argv[3] ?? "out/products.json";
  if (!input) {
    console.error("Usage: ts-node scripts/parseFeeds.ts <input.json> [output.json]");
    process.exit(1);
  }
  const raw: RawItem[] = JSON.parse(fs.readFileSync(input, "utf-8"));
  const products = raw.map(normalize);
  fs.mkdirSync(path.dirname(output), {
    recursive: true,
  });
  fs.writeFileSync(output, JSON.stringify(products, null, 2));
  console.log(`Wrote ${products.length} products to ${output}`);
}