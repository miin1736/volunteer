/**
 * Brand and category definitions for pre-rendering
 */

export const BRANDS = ["BrandA"] as const;
export const CATEGORIES = ["down"] as const;

export type Brand = typeof BRANDS[number];
export type Category = typeof CATEGORIES[number];

/**
 * Get all brand×category combinations for static generation
 */
export function getBrandCategoryCombos(): Array<{ brand: string; category: string }> {
  const combos: Array<{ brand: string; category: string }> = [];
  for (const brand of BRANDS) {
    for (const category of CATEGORIES) {
      combos.push({ brand, category });
    }
  }
  return combos;
}
