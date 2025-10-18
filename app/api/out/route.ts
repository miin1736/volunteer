import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { appendJsonl } from "@/lib/log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const pid = url.searchParams.get("pid") ?? "unknown";

  if (!to) return NextResponse.json({ error: "missing to" }, { status: 400 });

  // Log click event
  const logPath = path.join(process.cwd(), "logs", "clicks.jsonl");
  await appendJsonl(logPath, {
    pid,
    to,
    referer: req.headers.get("referer") ?? "",
    timestamp: new Date().toISOString(),
  });

  const redirectUrl = new URL(to);
  redirectUrl.searchParams.set("subId", `ewall_${pid}`);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}