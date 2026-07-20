import { NextResponse } from "next/server";
import { getFirecrawlClient, isFirecrawlConfigured, runFirecrawl } from "../../../../lib/firecrawl";

export const runtime = "nodejs";

export async function GET() {
  if (!isFirecrawlConfigured()) {
    return NextResponse.json({ configured: false, connected: false, status: "Firecrawl API key is not configured." });
  }

  try {
    await runFirecrawl("health", () => getFirecrawlClient().getCreditUsage());
    return NextResponse.json({ configured: true, connected: true, status: "Firecrawl is connected." });
  } catch {
    return NextResponse.json({ configured: true, connected: false, status: "Firecrawl could not be reached." });
  }
}
