import Filters from "@/components/Filters";
import { getProducts } from "@/lib/search";
import { buildProductJsonLd } from "@/lib/seo";
import { getBrandCategoryCombos } from "@/lib/brands";

type Props = {
  params: { brand: string; category: string };
  searchParams: Record<string, string | string[]>;
};

// ISR: revalidate every hour
export const revalidate = 3600;

// Static generation: pre-render all brand×category combos
export async function generateStaticParams() {
  return getBrandCategoryCombos();
}

export default async function Page({ params, searchParams }: Props) {
  const { brand, category } = params;
  const { items, total } = await getProducts({
    brand,
    category,
    filters: searchParams,
  });

  return (
    <main>
      <header>
        <h1>
          {brand} {category} 이월 상품
        </h1>
        <p>총 {total.toLocaleString()}개</p>
      </header>

      <Filters />

      <section className="grid">
        {items.map((p) => (
          <a
            key={p.id}
            href={`/api/out?to=${encodeURIComponent(p.deeplink)}&pid=${p.id}`}
            rel="nofollow sponsored"
          >
            <article>
              <img src={p.imageUrl} alt={p.title} loading="lazy" />
              <h3>{p.title}</h3>
              <p>
                {p.price.toLocaleString()}원{" "}
                {p.discountRate ? <small>({p.discountRate}%↓)</small> : null}
              </p>
              <ul>
                {p.downRatio && <li>다운비율 {p.downRatio}</li>}
                {p.fillPower && <li>필파워 {p.fillPower}</li>}
                {p.hood !== undefined && <li>{p.hood ? "후드" : "노후드"}</li>}
                {p.fit && <li>{p.fit}</li>}
                {p.shell && <li>{p.shell}</li>}
              </ul>
            </article>
          </a>
        ))}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            items.slice(0, 20).map((p) => buildProductJsonLd(p))
          ),
        }}
      />
    </main>
  );
}