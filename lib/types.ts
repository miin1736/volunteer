export type Product = {
  id: string;
  brand: string;
  category: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountRate: number;
  currency: "KRW";
  seller: string;
  deeplink: string;
  inStock: boolean;

  downType?: "goose" | "duck" | "synthetic";
  downRatio?: "90-10" | "80-20" | "70-30";
  fillPower?: number;
  hood?: boolean;
  fit?: "standard" | "regular" | "loose";
  shell?: "gore-tex" | "nylon" | "poly" | string;

  updatedAt: string;
  score?: number;
};

export type SearchInput = {
  brand: string;
  category: string;
  filters: Record<string, string | string[]>;
};