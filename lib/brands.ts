import fs from "fs/promises";
import path from "path";
import type { Product } from "./types";

/**
 * Load products from normalized snapshot if present; else from sample data.
 */
async function loadProducts(): Promise<Product[]> {
  const normalized = path.join(process.cwd(), "out", "products.normalized.json");
  const sample = path.join(process.cwd(), "data", "sample-products.json");
  try {
    const raw = await fs.readFile(normalized, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : (parsed.products as Product[]);
  } catch {
    const raw = await fs.readFile(sample, "utf-8");
    return JSON.parse(raw) as Product[];
  }
}

/**
 * Get all brand×category combinations for static generation, derived from data.
 */
export async function getBrandCategoryCombos(): Promise<Array<{ brand: string; category: string }>> {
  const items = await loadProducts();
  const seen = new Set<string>();
  const combos: Array<{ brand: string; category: string }> = [];
  for (const p of items) {
    if (!p.brand || !p.category) continue;
    const key = `${p.brand}__${p.category}`;
    if (seen.has(key)) continue;
    seen.add(key);
    combos.push({ brand: p.brand, category: p.category });
  }
  // Stable sort for deterministic SSG
  combos.sort((a, b) => a.brand.localeCompare(b.brand) || a.category.localeCompare(b.category));
  return combos;
}
