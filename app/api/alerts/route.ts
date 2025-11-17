import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Alert, AlertCondition } from "@/lib/types";

const OUT_DIR = path.join(process.cwd(), "out");
const JSONL = path.join(OUT_DIR, "alerts.jsonl");
const SNAPSHOT = path.join(OUT_DIR, "alerts.json");

async function ensureDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function appendJsonl(obj: unknown) {
  await ensureDir();
  const line = JSON.stringify(obj) + "\n";
  await fs.appendFile(JSONL, line, "utf-8");
}

async function readAll(): Promise<Alert[]> {
  try {
    const raw = await fs.readFile(SNAPSHOT, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Alert[]) : (parsed.items as Alert[]);
  } catch {
    try {
      const raw = await fs.readFile(JSONL, "utf-8");
      return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((l) => JSON.parse(l));
    } catch {
      return [];
    }
  }
}

async function writeSnapshot(items: Alert[]) {
  await ensureDir();
  await fs.writeFile(
    SNAPSHOT,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 2),
    "utf-8"
  );
}

function parseBool(v: unknown): boolean | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.toLowerCase();
  return t === "true" || t === "yes" ? true : t === "false" || t === "no" ? false : undefined;
}

export async function GET() {
  const items = await readAll();
  return NextResponse.json({ items, count: items.length });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Alert> & {
      email?: string;
      brand?: string;
      category?: string;
      conditions?: Partial<AlertCondition>;
    };

    const email = (body.email || "").trim();
    const brand = (body.brand || "").trim();
    const category = (body.category || "").trim();
    if (!email || !brand || !category) {
      return NextResponse.json({ error: "email, brand, category are required" }, { status: 400 });
    }

    const c: AlertCondition = {
      priceBelow: typeof body.conditions?.priceBelow === "number" ? body.conditions!.priceBelow : undefined,
      discountAtLeast:
        typeof body.conditions?.discountAtLeast === "number" ? body.conditions!.discountAtLeast : undefined,
      downRatio: body.conditions?.downRatio as AlertCondition["downRatio"],
      fillPowerMin:
        typeof body.conditions?.fillPowerMin === "number" ? body.conditions!.fillPowerMin : undefined,
      hood:
        typeof body.conditions?.hood === "boolean"
          ? body.conditions!.hood
          : parseBool((body as any).hood),
      fit: body.conditions?.fit as AlertCondition["fit"],
      shell: body.conditions?.shell as AlertCondition["shell"],
    };

    const item: Alert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      brand,
      category,
      conditions: c,
      createdAt: new Date().toISOString(),
    };

    await appendJsonl(item);
    const all = await readAll();
    await writeSnapshot(all.concat());
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unexpected" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const items = await readAll();
  const next = items.filter((x) => x.id !== id);
  if (next.length === items.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  await writeSnapshot(next);
  // also rewrite JSONL lazily
  try {
    await fs.writeFile(JSONL, next.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf-8");
  } catch {}
  return NextResponse.json({ ok: true });
}
