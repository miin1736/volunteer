import fs from "node:fs/promises";
import path from "node:path";
import { Product, SearchInput } from "./types";

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
  const file = path.join(process.cwd(), "data", "sample-products.json");
  const raw = await fs.readFile(file, "utf-8");
  const all: Product[] = JSON.parse(raw);

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

  if (downType) items = items.filter((p) => p.downType === downType);
  if (downRatio) items = items.filter((p) => p.downRatio === downRatio);
  if (hood !== undefined) items = items.filter((p) => p.hood === hood);
  if (fit) items = items.filter((p) => p.fit === fit);
  if (shell) items = items.filter((p) => p.shell === shell);

  sortItems(items, sort);

  return { items, total: items.length };
}