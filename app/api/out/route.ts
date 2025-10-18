import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const pid = url.searchParams.get("pid") ?? "unknown";

  if (!to) return NextResponse.json({ error: "missing to" }, { status: 400 });

  // TODO: persist click event (pid, referer, ts, utm/subid)
  // Example: await logClick({ pid, to, referer: req.headers.get("referer") ?? "" });

  const redirectUrl = new URL(to);
  redirectUrl.searchParams.set("subId", `ewall_${pid}`);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}