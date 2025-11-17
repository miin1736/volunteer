/**
 * Periodic sync to:
 * - fetch feeds
 * - normalize and upsert products
 * - mark OOS and update prices
 */
/// <reference types="node" />
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import type { Product, NormalizedSnapshot, Alert } from "../../lib/types";
import { normalize } from "../parseFeeds.ts";

type RawItem = Record<string, string>;

async function fetchFeed(): Promise<RawItem[]> {
  // TODO: Replace with actual affiliate/feed API calls
  return [];
}

async function readSnapshot(file: string): Promise<Product[] | null> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : (parsed.products as Product[]);
  } catch {
    return null;
  }
}

async function loadAlerts(): Promise<Alert[]> {
  const outDir = path.join(process.cwd(), "out");
  const snap = path.join(outDir, "alerts.json");
  const jsonl = path.join(outDir, "alerts.jsonl");
  try {
    const raw = await fs.readFile(snap, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Alert[]) : (parsed.items as Alert[]);
  } catch {
    try {
      const raw = await fs.readFile(jsonl, "utf-8");
      return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((l: string) => JSON.parse(l) as Alert);
    } catch {
      return [];
    }
  }
}

function matchesAlert(p: Product, a: Alert): boolean {
  if (p.brand.toLowerCase() !== a.brand.toLowerCase()) return false;
  if (p.category.toLowerCase() !== a.category.toLowerCase()) return false;
  const c = a.conditions || {};
  if (typeof c.priceBelow === "number" && !(p.price <= c.priceBelow)) return false;
  if (typeof c.discountAtLeast === "number" && !(p.discountRate >= c.discountAtLeast)) return false;
  if (c.downRatio && p.downRatio !== c.downRatio) return false;
  if (typeof c.fillPowerMin === "number" && !(typeof p.fillPower === "number" && p.fillPower >= c.fillPowerMin)) return false;
  if (typeof c.hood === "boolean" && p.hood !== c.hood) return false;
  if (c.fit && p.fit !== c.fit) return false;
  if (c.shell && p.shell !== c.shell) return false;
  return true;
}

async function appendEmailQueue(records: any[]) {
  if (!records.length) return;
  const outDir = path.join(process.cwd(), "out");
  await fs.mkdir(outDir, { recursive: true });
  const file = path.join(outDir, "emails.queue.jsonl");
  const lines = records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  await fs.appendFile(file, lines, "utf-8");
}

async function upsertProducts() {
  const raw = await fetchFeed();
  // Use the shared normalizer so types align with Product.
  const products: Product[] = raw.map(normalize);

  // TODO: upsert into DB or index
  // Example: await db.upsert(products)
  // For MVP visibility, also write normalized snapshot locally and compute diffs
  const out = path.join(process.cwd(), "out", "products.normalized.json");
  const prevFile = path.join(process.cwd(), "out", "products.normalized.prev.json");
  const prev = (await readSnapshot(out)) ?? [];

  const snapshot: NormalizedSnapshot = {
    generatedAt: new Date().toISOString(),
    count: products.length,
    products,
  };
  await fs.mkdir(path.dirname(out), { recursive: true });
  // Save previous snapshot for inspection
  if (prev.length) {
    await fs.writeFile(prevFile, JSON.stringify({ generatedAt: new Date().toISOString(), count: prev.length, products: prev }, null, 2), "utf-8");
  }
  await fs.writeFile(out, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`Synced ${products.length} products → ${out}`);

  // Diff price/stock changes
  const prevMap = new Map(prev.map((p) => [p.id, p] as const));
  const events: Array<{ type: "price_drop" | "restock"; product: Product; prev?: Product }> = [];
  for (const p of products) {
    const before = prevMap.get(p.id);
    if (!before) continue;
    if (typeof before.price === "number" && p.price < before.price) {
      events.push({ type: "price_drop", product: p, prev: before });
    }
    if (before.inStock === false && p.inStock === true) {
      events.push({ type: "restock", product: p, prev: before });
    }
  }

  if (events.length) {
    const alerts = await loadAlerts();
    const queue: any[] = [];
    for (const ev of events) {
      for (const a of alerts) {
        if (!matchesAlert(ev.product, a)) continue;
        queue.push({
          ts: new Date().toISOString(),
          to: a.email,
          reason: ev.type,
          productId: ev.product.id,
          brand: ev.product.brand,
          category: ev.product.category,
          price: ev.product.price,
          discountRate: ev.product.discountRate,
          title: ev.product.title,
        });
      }
    }
    await appendEmailQueue(queue);
    console.log(`Change-detect: ${events.length} events, queued ${queue.length} emails (dry-run)`);
  } else {
    console.log("Change-detect: no changes");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  upsertProducts().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}