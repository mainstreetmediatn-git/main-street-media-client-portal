import { NextResponse } from "next/server";
import { firecrawlErrorResponse, getFirecrawlClient, isPublicHttpUrl, requireString, runFirecrawl } from "../../../../lib/firecrawl";
import { requireFirecrawlUser } from "../../../../lib/firecrawlApi";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireFirecrawlUser())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json().catch(() => null);
    const topic = requireString(body?.topic, "research topic");
    const website = body?.website;
    if (website && !isPublicHttpUrl(website)) return NextResponse.json({ error: "Provide a valid public http(s) website URL." }, { status: 400 });
    const client = getFirecrawlClient();
    const [search, websiteData] = await Promise.all([
      runFirecrawl("business-research", () => client.search(topic, { sources: ["web"], limit: 6, timeout: 15_000 })),
      website ? runFirecrawl("business-research-scrape", () => client.scrape(website, { formats: ["markdown"], onlyMainContent: true })) : Promise.resolve(null)
    ]);
    return NextResponse.json({ source: "real", results: search.web ?? [], website: websiteData });
  } catch (error) {
    const response = firecrawlErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
