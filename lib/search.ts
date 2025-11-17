/// <reference types="node" />
import fs from "fs/promises";
import path from "path";
import { Product, SearchInput } from "./types";
import { extractAttributes } from "./attributes";

function toBool(v?: string | null) {
  if (v == null) return undefined;
  const t = v.toLowerCase();
  return t === "yes" || t === "true" ? true : t === "no" || t === "false" ? false : undefined;
}

function sortItems(items: Product[], sort?: string) {
  switch (sort) {
    case "priceAsc":
      return items.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return items.sort((a, b) => b.price - a.price);
    case "new":
      return items.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    case "discount":
    default:
      return items.sort((a, b) => b.discountRate - a.discountRate);
  }
}

export async function getProducts(input: SearchInput): Promise<{ items: Product[]; total: number }> {
  // Prefer normalized snapshot if present; fall back to sample data
  let all: Product[] = [];
  const normalizedPath = path.join(process.cwd(), "out", "products.normalized.json");
  const samplePath = path.join(process.cwd(), "data", "sample-products.json");
  try {
    const raw = await fs.readFile(normalizedPath, "utf-8");
    const parsed = JSON.parse(raw);
    all = Array.isArray(parsed) ? (parsed as Product[]) : (parsed.products as Product[]);
  } catch {
    const raw = await fs.readFile(samplePath, "utf-8");
    all = JSON.parse(raw) as Product[];
  }

  // Backfill normalized attributes if missing using centralized extractor
  all = all.map((p) => {
    // Check if category-specific attributes exist
    let hasAttrs = false;
    if (p.category === "down") {
      const down = p as import("./types").DownProduct;
      hasAttrs = !!(down.downType || down.downRatio || down.fillPower || down.hood !== undefined || down.fit || down.shell);
    } else if ("fit" in p || "shell" in p) {
      hasAttrs = true;
    }
    
    if (hasAttrs) return p;
    const text = [p.title, p.brand, p.category].filter(Boolean).join(" ");
    const attrs = extractAttributes(text);
    return { ...p, ...attrs } as Product;
  });

  const f = input.filters || {};
  const downType = typeof f.downType === "string" ? f.downType : undefined;
  const downRatio = typeof f.downRatio === "string" ? f.downRatio : undefined;
  const hood = typeof f.hood === "string" ? toBool(f.hood) : undefined;
  const fit = typeof f.fit === "string" ? f.fit : undefined;
  const shell = typeof f.shell === "string" ? f.shell : undefined;
  const sort = typeof f.sort === "string" ? f.sort : "discount";

  let items = all.filter(
    (p) =>
      p.brand.toLowerCase() === input.brand.toLowerCase() &&
      p.category.toLowerCase() === input.category.toLowerCase()
  );

  if (downType) items = items.filter((p) => p.category === "down" && (p as import("./types").DownProduct).downType === downType);
  if (downRatio) items = items.filter((p) => p.category === "down" && (p as import("./types").DownProduct).downRatio === downRatio);
  if (hood !== undefined) items = items.filter((p) => (p.category === "down" || p.category === "coat") && (p as any).hood === hood);
  if (fit) items = items.filter((p) => "fit" in p && (p as any).fit === fit);
  if (shell) items = items.filter((p) => "shell" in p && (p as any).shell === shell);

  sortItems(items, sort);

  return { items, total: items.length };
}