import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { appendJsonl } from "@/lib/log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const pid = url.searchParams.get("pid") ?? "unknown";

  if (!to) return NextResponse.json({ error: "missing to" }, { status: 400 });

  // Log click event (best-effort, don't block redirect on failure)
  const logPath = path.join(process.cwd(), "logs", "clicks.jsonl");
  try {
    await appendJsonl(logPath, {
      pid,
      to,
      referer: req.headers.get("referer") ?? "",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Log to console but don't fail the request
    console.error("Failed to log click event:", err);
  }

  const redirectUrl = new URL(to);
  redirectUrl.searchParams.set("subId", `ewall_${pid}`);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}