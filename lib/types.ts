// 공통 베이스 속성
type ProductBase = {
  id: string;
  brand: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountRate: number;
  currency: "KRW";
  seller: string;
  deeplink: string;
  inStock: boolean;
  updatedAt: string;
  score?: number;
};

// 다운 재킷 전용 속성
export type DownProduct = ProductBase & {
  category: "down";
  downType?: "goose" | "duck" | "synthetic";
  downRatio?: "90-10" | "80-20" | "70-30";
  fillPower?: number;
  hood?: boolean;
  fit?: "standard" | "regular" | "loose";
  shell?: "gore-tex" | "nylon" | "poly" | string;
};

// 슬랙스 전용 속성
export type SlacksProduct = ProductBase & {
  category: "slacks";
  waistType?: "high" | "mid" | "low";
  legOpening?: "tapered" | "straight" | "wide";
  stretch?: boolean;
  pleats?: "single" | "double" | "none";
  fit?: "slim" | "standard" | "relaxed";
  shell?: "wool" | "cotton" | "polyester" | string;
};

// 청바지 전용 속성
export type JeansProduct = ProductBase & {
  category: "jeans";
  wash?: "light" | "medium" | "dark" | "black";
  cut?: "skinny" | "slim" | "straight" | "bootcut" | "wide";
  rise?: "high" | "mid" | "low";
  stretch?: boolean;
  distressed?: boolean;
};

// 맨투맨 전용 속성
export type CrewneckProduct = ProductBase & {
  category: "crewneck";
  neckline?: "crew" | "mock";
  sleeveLength?: "long" | "3/4" | "short";
  pattern?: "solid" | "stripe" | "graphic";
  fit?: "slim" | "regular" | "oversized";
  shell?: "cotton" | "fleece" | "french-terry" | string;
};

// 롱슬리브 전용 속성
export type LongSleeveProduct = ProductBase & {
  category: "long-sleeve";
  neckline?: "crew" | "v-neck" | "henley";
  sleeveType?: "raglan" | "set-in";
  layering?: boolean;
  fit?: "slim" | "regular" | "oversized";
  shell?: "cotton" | "modal" | "merino" | string;
};

// 코트 전용 속성
export type CoatProduct = ProductBase & {
  category: "coat";
  length?: "short" | "mid" | "long";
  closure?: "button" | "zip" | "belt";
  lining?: "full" | "half" | "none";
  hood?: boolean;
  fit?: "slim" | "regular" | "oversized";
  shell?: "wool" | "cashmere" | "polyester" | string;
};

// 기타 카테고리 (미분류)
export type GenericProduct = ProductBase & {
  category: string;
  fit?: string;
  shell?: string;
};

// Union Type: 모든 카테고리 상품
export type Product =
  | DownProduct
  | SlacksProduct
  | JeansProduct
  | CrewneckProduct
  | LongSleeveProduct
  | CoatProduct
  | GenericProduct;

export type SearchInput = {
  brand: string;
  category: string;
  filters: Record<string, string | string[]>;
};

export type NormalizedSnapshot = {
  generatedAt: string;
  count: number;
  products: Product[];
};

export type AlertCondition = {
  priceBelow?: number;
  discountAtLeast?: number;
  downRatio?: "90-10" | "80-20" | "70-30";
  fillPowerMin?: number;
  hood?: boolean;
  fit?: string;
  shell?: string;
};

export type Alert = {
  id: string;
  email: string;
  brand: string;
  category: string;
  conditions: AlertCondition;
  createdAt: string;
};