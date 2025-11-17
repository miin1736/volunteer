# lib 디렉터리 상세 설명

## 📁 구조 개요
```
lib/
├── attributes/
│   └── index.ts               # 속성 정규화 규칙
├── brands.ts                  # 브랜드×카테고리 조합 생성
├── log.ts                     # JSONL 로깅 유틸리티
├── search.ts                  # 상품 검색/필터링 엔진
├── seo.ts                     # SEO/JSON-LD 생성기
└── types.ts                   # 공용 타입 정의
```

---

## 📄 파일별 상세 설명

### 1. index.ts
**역할**: 상품 속성 정규화 규칙 중앙화

**주요 함수**:
```typescript
export function extractAttributes(product: Product): NormalizedAttributes
```

**처리 로직**:
```typescript
// 1. 다운 타입 추출
title: "구스다운 800FP" 
  → downType: "goose"

// 2. 다운 비율 파싱
"90/10" → downRatio: "90-10"
"80-20" → downRatio: "80-20"

// 3. 충전재 파워
"800FP", "750필파워" 
  → fillPower: 800

// 4. 후드 여부
"노후드", "후드없음" 
  → hood: false
"후드", "hooded" 
  → hood: true

// 5. 핏 정규화
"슬림", "slim-fit" 
  → fit: "slim"
"레귤러", "standard" 
  → fit: "standard"

// 6. 겉감 소재
"나일론", "nylon" 
  → shell: "nylon"
"폴리에스터" 
  → shell: "polyester"
```

**사용 예시**:
```typescript
// scripts/parseFeeds.ts에서 사용
const normalized = extractAttributes(rawProduct);
// → { downType: "goose", downRatio: "90-10", fillPower: 800, ... }
```

**확장 포인트**:
- 새 속성 추가 (예: 방수 등급, 단열 등급)
- 브랜드별 커스텀 규칙
- 다국어 지원 (영어/한글 동시 파싱)

---

### 2. brands.ts
**역할**: 동적 브랜드×카테고리 조합 생성 (SSG용)

**주요 함수**:
```typescript
export async function getBrandCategoryCombos(): Promise<BrandCategoryCombo[]>
```

**동작 흐름**:
```typescript
1. 데이터 로드
   ├─ out/products.normalized.json 우선
   └─ fallback: data/sample-products.json

2. 유니크 조합 추출
   products → Set<"BrandA__down"> 
           → Set<"BrandB__slacks">

3. Slug 생성
   "BrandA" → "branda"
   "패딩 재킷" → "패딩-재킷" (slugify)

4. 반환
   [
     { brand: "BrandA", brandSlug: "branda", 
       category: "down", categorySlug: "down" },
     ...
   ]
```

**사용처**:
```typescript
// app/(ewall)/[brand]/[category]/page.tsx
export async function generateStaticParams() {
  const combos = await getBrandCategoryCombos();
  return combos.map(c => ({
    brand: c.brandSlug,
    category: c.categorySlug
  }));
}
// → /branda/down, /brandb/slacks 등 자동 생성
```

**핵심 개념**:
- **Data-driven routes**: 하드코딩 없이 실제 데이터에서 경로 생성
- **Slugify**: URL-safe 문자열 변환 (공백 제거, 소문자화)

---

### 3. log.ts
**역할**: 구조화 로그 기록 (JSONL 형식)

**주요 함수**:
```typescript
export async function appendJsonl(
  filepath: string, 
  entry: Record<string, unknown>
): Promise<void>
```

**동작**:
```typescript
// 사용 예시
await appendJsonl("out/logs/normalize.jsonl", {
  timestamp: new Date().toISOString(),
  level: "error",
  message: "Failed to parse price",
  productId: "ex-001",
  raw: { price: "invalid" }
});

// 파일 내용 (한 줄씩 JSON)
{"timestamp":"2025-11-18T10:00:00Z","level":"error",...}
{"timestamp":"2025-11-18T10:01:00Z","level":"warn",...}
```

**JSONL 장점**:
- 스트림 처리 가능 (GB 단위도 메모리 부담 없음)
- 파싱 에러 격리 (한 줄 오류가 전체 파일에 영향 없음)
- grep/jq 등 CLI 도구로 분석 용이

**사용처**:
- parseFeeds.ts: 정규화 실패 항목 기록
- syncOffers.ts: 가격 변동 이벤트 로그

---

### 4. search.ts
**역할**: 상품 검색 및 필터링 엔진

**주요 함수**:
```typescript
export async function getProducts(params: {
  brand?: string;
  category?: string;
  sort?: "discount" | "price-low" | "price-high" | "newest";
  // 필터들
  downType?: "goose" | "duck";
  downRatio?: "90-10" | "80-20" | "70-30";
  fillPowerMin?: number;
  hood?: boolean;
  fit?: "slim" | "standard" | "oversized";
  shell?: "nylon" | "polyester" | "cotton";
  priceMax?: number;
  discountMin?: number;
}): Promise<Product[]>
```

**동작 흐름**:
```typescript
1. 데이터 로드
   out/products.normalized.json 또는 sample-products.json

2. 필터링 체인
   products
     .filter(p => p.brand === params.brand)          // 브랜드
     .filter(p => p.category === params.category)    // 카테고리
     .filter(p => p.downRatio === params.downRatio)  // 다운 비율
     .filter(p => p.fillPower >= params.fillPowerMin) // 충전재
     .filter(p => p.hood === params.hood)            // 후드
     .filter(p => p.price <= params.priceMax)        // 가격
     // ...

3. 정렬
   sort === "discount" 
     → discountRate 내림차순
   sort === "price-low" 
     → price 오름차순
   sort === "newest" 
     → updatedAt 내림차순

4. 반환
   필터링+정렬된 Product[]
```

**사용 예시**:
```typescript
// 페이지에서 사용
const products = await getProducts({
  brand: "BrandA",
  category: "down",
  downRatio: "90-10",
  fillPowerMin: 750,
  hood: false,
  sort: "discount"
});
// → 90/10 구스다운, 750FP 이상, 노후드, 할인율 높은 순
```

**최적화 포인트**:
- 현재: 매번 전체 파일 로드 (수백 개까지 OK)
- 추후: Redis 캐싱, Elasticsearch, 인덱스 최적화

---

### 5. seo.ts
**역할**: SEO 메타데이터 및 JSON-LD 구조화 데이터 생성

**주요 함수**:

#### 5.1 `buildProductJsonLd`
```typescript
export function buildProductJsonLd(product: Product): object
```

**생성 예시**:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "BrandA 다운 재킷 90/10 노후드 800FP",
  "image": "https://via.placeholder.com/400x400.png?text=BrandA",
  "description": "BrandA down 카테고리의 할인 상품",
  "brand": {
    "@type": "Brand",
    "name": "BrandA"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/p/ex-001",
    "priceCurrency": "KRW",
    "price": 89000,
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "RetailerX" }
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "downType", "value": "goose" },
    { "@type": "PropertyValue", "name": "downRatio", "value": "90-10" },
    { "@type": "PropertyValue", "name": "fillPower", "value": 800 },
    { "@type": "PropertyValue", "name": "hood", "value": false }
  ]
}
```

**Google 검색 효과**:
- 리치 스니펫 표시 (별점, 가격, 재고 상태)
- 검색 순위 향상 (구조화 데이터 가점)
- 이미지 검색 노출 증가

#### 5.2 `buildListingJsonLd`
```typescript
export function buildListingJsonLd(
  brand: string, 
  category: string, 
  products: Product[]
): object
```

**생성 예시**:
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "BrandA down 카테고리 이월 상품",
  "numberOfItems": 15,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": { "@type": "Product", "name": "...", ... }
    },
    ...
  ]
}
```

**사용처**:
```tsx
// app/(ewall)/[brand]/[category]/page.tsx
export default async function Page({ params }) {
  const products = await getProducts(params);
  const jsonLd = buildListingJsonLd(params.brand, params.category, products);
  
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      {/* 상품 목록 렌더링 */}
    </>
  );
}
```

---

### 6. types.ts
**역할**: 프로젝트 전체 TypeScript 타입 정의

**주요 타입**:

#### 6.1 `Product` (핵심 상품 타입)
```typescript
export interface Product {
  // 기본 정보
  id: string;                    // 고유 ID
  brand: string;                 // 브랜드명
  category: string;              // 카테고리
  title: string;                 // 상품명
  
  // 이미지/링크
  imageUrl?: string;             // 대표 이미지
  deeplink: string;              // 구매 링크
  
  // 가격
  price: number;                 // 현재가
  originalPrice?: number;        // 정가
  discountRate?: number;         // 할인율 (%)
  currency: string;              // 통화 (KRW 등)
  
  // 판매 정보
  seller: string;                // 판매처
  inStock: boolean;              // 재고 여부
  
  // 정규화된 속성 (lib/attributes에서 추출)
  downType?: "goose" | "duck";
  downRatio?: "90-10" | "80-20" | "70-30";
  fillPower?: number;
  hood?: boolean;
  fit?: "slim" | "standard" | "oversized";
  shell?: "nylon" | "polyester" | "cotton";
  
  // 메타
  updatedAt: string;             // ISO 8601 날짜
}
```

#### 6.2 `NormalizedSnapshot` (스냅샷 구조)
```typescript
export interface NormalizedSnapshot {
  generatedAt: string;           // 생성 시각
  count: number;                 // 상품 수
  products: Product[];           // 상품 배열
}
```

#### 6.3 `Alert` (알림 타입)
```typescript
export interface Alert {
  id: string;
  email: string;
  brand: string;
  category: string;
  conditions: AlertCondition;    // 알림 조건
  createdAt: string;
}

export interface AlertCondition {
  priceBelow?: number;           // X원 이하
  discountAtLeast?: number;      // Y% 이상 할인
  downRatio?: string;            // 다운 비율
  fillPowerMin?: number;         // 최소 충전재
  hood?: boolean;                // 후드 여부
  fit?: string;                  // 핏
  shell?: string;                // 겉감
}
```

**사용 예시**:
```typescript
// 타입 안전성 보장
const product: Product = {
  id: "ex-001",
  brand: "BrandA",
  category: "down",
  // ... (필수 필드 누락 시 컴파일 에러)
};

// 함수 시그니처에서 활용
function filterByPrice(products: Product[], max: number): Product[] {
  return products.filter(p => p.price <= max);
}
```

---

## 🔗 파일 간 의존성 다이어그램

```
types.ts (기본 타입)
   ↓
attributes/index.ts (정규화 규칙)
   ↓
search.ts (검색 엔진) ← brands.ts (조합 생성)
   ↓                      ↓
seo.ts (JSON-LD)    app/[brand]/[category]/page.tsx
   ↓                      ↓
log.ts (로깅)       scripts/parseFeeds.ts
```

---

## 💡 핵심 개념 정리

### 1. **서버 전용 모듈**
- lib 내 모든 파일은 Node.js 환경에서만 실행
- `fs`, `path` 등 Node API 사용 가능
- 클라이언트 번들에 포함 안 됨 (번들 크기 최적화)

### 2. **Pure Functions 원칙**
- 대부분 순수 함수 (같은 입력 → 같은 출력)
- 사이드 이펙트 최소화 (log.ts 제외)
- 테스트 용이성 향상

### 3. **Type-first 설계**
- `types.ts`에서 먼저 타입 정의
- 구현 시 타입 안전성 보장
- IDE 자동완성 지원

### 4. **확장 가능한 구조**
- 새 속성 추가: `attributes/index.ts` 수정
- 새 필터: `search.ts`에 조건 추가
- 새 SEO 요소: `seo.ts`에 스키마 확장

---

## 🚀 실전 활용 시나리오

### 시나리오 1: 새 속성 "방수 등급" 추가
```typescript
// 1. types.ts에 타입 추가
export interface Product {
  // ...existing
  waterproofRating?: 1 | 2 | 3 | 4 | 5;
}

// 2. attributes/index.ts에 추출 로직 추가
export function extractAttributes(product: Product) {
  // ...existing
  
  const waterproof = /(\d)[급등급]?\s*방수/i.exec(product.title);
  return {
    // ...existing
    waterproofRating: waterproof ? parseInt(waterproof[1]) : undefined
  };
}

// 3. search.ts에 필터 추가
export async function getProducts(params: {
  // ...existing
  waterproofMin?: number;
}) {
  return products.filter(p => 
    !params.waterproofMin || 
    (p.waterproofRating ?? 0) >= params.waterproofMin
  );
}

// 4. seo.ts에 JSON-LD 추가
if (product.waterproofRating) {
  additionalProperty.push({
    "@type": "PropertyValue",
    "name": "waterproofRating",
    "value": product.waterproofRating
  });
}
```

### 시나리오 2: 브랜드별 커스텀 정규화
```typescript
// attributes/index.ts
const BRAND_RULES: Record<string, (title: string) => Partial<Product>> = {
  "BrandA": (title) => ({
    // BrandA는 "800F"로 표기
    fillPower: /(\d+)F\b/i.exec(title)?.[1] 
      ? parseInt(RegExp.$1) 
      : undefined
  }),
  "BrandB": (title) => ({
    // BrandB는 "FP800"로 표기
    fillPower: /FP(\d+)/i.exec(title)?.[1] 
      ? parseInt(RegExp.$1) 
      : undefined
  })
};

export function extractAttributes(product: Product) {
  const base = { /* 기본 로직 */ };
  const custom = BRAND_RULES[product.brand]?.(product.title) ?? {};
  return { ...base, ...custom };
}
```

---

더 궁금한 파일이나 개념이 있으면 말씀해 주세요!