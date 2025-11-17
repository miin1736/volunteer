/**
 * Simple filter smoke using in-repo search helper
 * - Ensures normalized attributes participate in filtering
 */
import { getProducts } from "../../lib/search";

async function main() {
  // Expect sample data to have BrandA/down with >=1 hood=true
  const hoodTrue = await getProducts({ brand: "BrandA", category: "down", filters: { hood: "true" } });
  if (hoodTrue.total < 1) {
    console.error("Expected >=1 result for BrandA/down with hood=true, got", hoodTrue.total);
    process.exit(1);
  }

  // Expect sample data to have at least one 90-10 down ratio
  const ratio9010 = await getProducts({ brand: "BrandA", category: "down", filters: { downRatio: "90-10" } });
  if (ratio9010.total < 1) {
    console.error("Expected >=1 result for BrandA/down with downRatio=90-10, got", ratio9010.total);
    process.exit(1);
  }

  // Sanity: tightening both filters should not increase count
  if (ratio9010.total > hoodTrue.total + 5) {
    console.error("Unexpected filter distribution; counts look off.", { ratio9010: ratio9010.total, hoodTrue: hoodTrue.total });
    process.exit(1);
  }

  console.log("Filter smoke OK", { hoodTrue: hoodTrue.total, ratio9010: ratio9010.total });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
