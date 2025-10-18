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
  return BRANDS.flatMap(brand => 
    CATEGORIES.map(category => ({ brand, category }))
  );
}
