import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/types";
import { buildProductJsonLd } from "@/lib/seo";

type Props = {
  params: { brand: string; category: string; slug: string };
};

export const revalidate = 3600;

async function loadAllProducts(): Promise<Product[]> {
  const normalized = path.join(process.cwd(), "out", "products.normalized.json");
  const sample = path.join(process.cwd(), "data", "sample-products.json");
  try {
    const raw = await fs.readFile(normalized, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : (parsed.products as Product[]);
  } catch {
    const raw = await fs.readFile(sample, "utf-8");
    return JSON.parse(raw) as Product[];
  }
}

export default async function Page({ params }: Props) {
  const { brand, category, slug } = params;
  const all = await loadAllProducts();
  const p = all.find(
    (x) => x.id === slug && x.brand.toLowerCase() === brand.toLowerCase() && x.category.toLowerCase() === category.toLowerCase()
  );
  if (!p) return notFound();

  const jsonLd = buildProductJsonLd(p);
  const trusted = (p.seller || "").toLowerCase().includes("official");

  return (
    <main>
      <nav>
        <a href={`/${brand}/${category}`}>&larr; {brand} {category} 목록</a>
      </nav>

      <article>
        <header>
          <h1>{p.title}</h1>
          <p>
            <strong>{p.price.toLocaleString()}원</strong>
            {p.discountRate ? <small> ({p.discountRate}%↓)</small> : null}
          </p>
          <p>
            판매처: {p.seller}
            {trusted ? <span className="badge">공식</span> : null}
          </p>
        </header>

        <section className="gallery">
          <img src={p.imageUrl} alt={p.title} />
        </section>

        <section className="specs">
          <h2>스펙</h2>
          <ul>
            {p.downType && <li>충전재: {p.downType}</li>}
            {p.downRatio && <li>다운 비율: {p.downRatio}</li>}
            {typeof p.fillPower === "number" && <li>필파워: {p.fillPower}</li>}
            {p.hood !== undefined && <li>후드: {p.hood ? "있음" : "없음"}</li>}
            {p.fit && <li>핏: {p.fit}</li>}
            {p.shell && <li>겉감: {p.shell}</li>}
          </ul>
        </section>

        <section className="price-history">
          <h2>가격 히스토리 (플레이스홀더)</h2>
          <div style={{ height: 160, background: "#f3f4f6", display: "grid", placeItems: "center" }}>
            <span>차트 준비 중</span>
          </div>
        </section>

        <p>
          <a
            href={`/api/out?to=${encodeURIComponent(p.deeplink)}&pid=${p.id}`}
            className="btn"
            rel="nofollow sponsored"
          >
            구매하러 가기
          </a>
        </p>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

export async function generateStaticParams() {
  // Pre-render a limited set to keep build light
  const all = await loadAllProducts();
  return all.slice(0, 50).map((p) => ({ brand: p.brand, category: p.category, slug: p.id }));
}
