/**
 * MVP feed parser: normalize affiliate/product feeds into Product[]
 * - Input: JSON array from affiliate networks or retailers (CSV/XML/JSON → assume JSON first)
 * - Output: normalized JSON ready for indexing
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Product, NormalizedSnapshot } from "../lib/types";
import { extractAttributes } from "../lib/attributes";
import { appendJsonl } from "../lib/log";

type RawItem = Record<string, string>;


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

// CLI entry (pure ESM): run only when this file is the entry point
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    const input = process.argv[2];
    const output = process.argv[3] ?? "out/products.normalized.json";
    if (!input) {
      console.error("Usage: ts-node scripts/parseFeeds.ts <input.json> [output.json]");
      process.exit(1);
    }
    const raw: RawItem[] = JSON.parse(fs.readFileSync(input, "utf-8"));
    const products: Product[] = [];
    let failures = 0;
    for (const r of raw) {
      try {
        products.push(normalize(r));
      } catch (e: any) {
        failures++;
        await appendJsonl("out/logs/normalize.jsonl", {
          level: "warn",
          reason: e?.message ?? String(e),
          item: r,
        });
      }
    }
    const snapshot: NormalizedSnapshot = {
      generatedAt: new Date().toISOString(),
      count: products.length,
      products,
    };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(snapshot, null, 2));
    console.log(`Wrote ${products.length} products to ${output} (failures: ${failures})`);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}