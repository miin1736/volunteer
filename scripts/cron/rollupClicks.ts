/// <reference types="node" />
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

type Click = {
  ts: string;
  pid?: string;
  subId?: string;
};

type DailyRollup = {
  date: string; // YYYY-MM-DD
  productId: string;
  subId?: string;
  count: number;
};

function ymd(ts: string): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function run() {
  const inFile = path.join(process.cwd(), ".data", "clicks.ndjson");
  const outFile = path.join(process.cwd(), "out", "clicks.daily.json");
  let text = "";
  try {
    text = await fs.readFile(inFile, "utf-8");
  } catch {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), items: [] }, null, 2), "utf-8");
    console.log("No click log found; wrote empty rollup.");
    return;
  }

  const lines = text.split(/\r?\n/).filter(Boolean);
  const map = new Map<string, number>();
  for (const l of lines) {
    try {
      const c = JSON.parse(l) as Click;
      const key = `${ymd(c.ts)}__${c.pid ?? "unknown"}__${c.subId ?? ""}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    } catch {}
  }

  const items: DailyRollup[] = Array.from(map.entries()).map(([k, count]) => {
    const [date, productId, subId] = k.split("__");
    return { date, productId, subId: subId || undefined, count };
  });

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(
    outFile,
    JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2),
    "utf-8"
  );
  console.log(`Rolled up ${lines.length} clicks → ${items.length} daily rows`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
