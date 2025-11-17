import { MetadataRoute } from "next";
import { getBrandCategoryCombos } from "@/lib/brands";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const combos = await getBrandCategoryCombos();

  const brandCategoryPages = combos.map(({ brand, category }) => ({
    url: `${baseUrl}/${brand}/${category}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...brandCategoryPages,
  ];
}
