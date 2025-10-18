"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(sp.toString());
    if (!v) next.delete(k);
    else next.set(k, v);
    router.push(`?${next.toString()}`);
  };

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <select
        defaultValue={sp.get("downType") ?? ""}
        onChange={(e) => setParam("downType", e.target.value || undefined)}
      >
        <option value="">충전재(전체)</option>
        <option value="goose">구스</option>
        <option value="duck">덕</option>
        <option value="synthetic">합성</option>
      </select>

      <select
        defaultValue={sp.get("downRatio") ?? ""}
        onChange={(e) => setParam("downRatio", e.target.value || undefined)}
      >
        <option value="">다운 비율</option>
        <option value="90-10">90/10+</option>
        <option value="80-20">80/20+</option>
        <option value="70-30">70/30+</option>
      </select>

      <select
        defaultValue={sp.get("hood") ?? ""}
        onChange={(e) => setParam("hood", e.target.value || undefined)}
      >
        <option value="">후드</option>
        <option value="yes">후드</option>
        <option value="no">노후드</option>
      </select>

      <select
        defaultValue={sp.get("fit") ?? ""}
        onChange={(e) => setParam("fit", e.target.value || undefined)}
      >
        <option value="">핏</option>
        <option value="standard">스탠다드</option>
        <option value="regular">레귤러</option>
        <option value="loose">루즈</option>
      </select>

      <select
        defaultValue={sp.get("shell") ?? ""}
        onChange={(e) => setParam("shell", e.target.value || undefined)}
      >
        <option value="">겉감</option>
        <option value="gore-tex">고어텍스</option>
        <option value="nylon">나일론</option>
        <option value="poly">폴리</option>
      </select>

      <select
        defaultValue={sp.get("sort") ?? "discount"}
        onChange={(e) => setParam("sort", e.target.value)}
      >
        <option value="discount">할인율순</option>
        <option value="priceAsc">가격↑</option>
        <option value="priceDesc">가격↓</option>
        <option value="new">신규등록</option>
      </select>
    </form>
  );
}