import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const LOG_DIR = path.join(process.cwd(), ".data");
const LOG_FILE = path.join(LOG_DIR, "clicks.ndjson");
const MAX_FIELD = 2048;

function trunc(v: string | null | undefined) {
  if (!v) return undefined;
  const s = String(v);
  return s.length > MAX_FIELD ? s.slice(0, MAX_FIELD) : s;
}

async function logClickSafe(entry: Record<string, unknown>) {
  try {
    await fs.promises.mkdir(LOG_DIR, { recursive: true });
    await fs.promises.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // read-only FS or other error: do not block redirect
    console.log("[click-log-fallback]", entry);
  }
}

function buildRedirectUrl(base: URL, toParam: string | null, pid: string | null) {
  let dest: URL;
  try {
    dest = new URL(toParam ?? "");
  } catch {
    dest = new URL("/", base);
  }
  const subId = `ewall_${pid ?? "unknown"}`;
  dest.searchParams.set("subId", subId);
  return { dest, subId };
}

async function handle(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const to = searchParams.get("to");
  const pid = searchParams.get("pid");

  const { dest, subId } = buildRedirectUrl(req.nextUrl, to, pid);

  // Best-effort logging, never blocks redirect
  const entry = {
    ts: new Date().toISOString(),
    pid: trunc(pid ?? "unknown"),
    to: trunc(dest.toString()),
    subId: trunc(subId),
    referer: trunc(req.headers.get("referer")),
    userAgent: trunc(req.headers.get("user-agent")),
    ip: trunc(req.headers.get("x-forwarded-for") ?? undefined),
    method: req.method,
    query: {
      utm_source: trunc(searchParams.get("utm_source")),
      utm_medium: trunc(searchParams.get("utm_medium")),
      utm_campaign: trunc(searchParams.get("utm_campaign")),
      utm_content: trunc(searchParams.get("utm_content")),
      utm_term: trunc(searchParams.get("utm_term")),
    },
  };
  // fire-and-forget
  logClickSafe(entry).catch(() => {});

  return NextResponse.redirect(dest, 307);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function HEAD(req: NextRequest) {
  return handle(req);
}