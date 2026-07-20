import { NextResponse } from "next/server";
import { firecrawlErrorResponse, getFirecrawlClient, requireString, runFirecrawl } from "../../../../lib/firecrawl";
import { requireFirecrawlUser } from "../../../../lib/firecrawlApi";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireFirecrawlUser())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json().catch(() => null);
    const business = requireString(body?.business, "business name");
    const location = requireString(body?.location, "location", 120);
    const data = await runFirecrawl("competitor-discovery", () =>
      getFirecrawlClient().search(`${business} competitors in ${location}`, { sources: ["web"], limit: 8, timeout: 15_000 })
    );
    return NextResponse.json({ source: "real", results: data.web ?? [] });
  } catch (error) {
    const response = firecrawlErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
