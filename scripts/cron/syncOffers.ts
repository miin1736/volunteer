/**
 * Periodic sync to:
 * - fetch feeds
 * - normalize and upsert products
 * - mark OOS and update prices
 */
import type { Product } from "@/lib/types";
import { normalize } from "../parseFeeds";

type RawItem = Record<string, string>;

async function fetchFeed(): Promise<RawItem[]> {
  // TODO: Replace with actual affiliate/feed API calls
  return [];
}

async function upsertProducts() {
  const raw = await fetchFeed();
  // Use the shared normalizer so types align with Product.
  const products: Product[] = raw.map(normalize);

  // TODO: upsert into DB or index
  // Example: await db.upsert(products)
  console.log(`Synced ${products.length} products`);
}

if (require.main === module) {
  upsertProducts().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}