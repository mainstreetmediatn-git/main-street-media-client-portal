import { NextResponse } from "next/server";
import { firecrawlErrorResponse, getFirecrawlClient, isPublicHttpUrl, runFirecrawl } from "../../../../lib/firecrawl";
import { requireFirecrawlUser } from "../../../../lib/firecrawlApi";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireFirecrawlUser())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json().catch(() => null);
    if (!isPublicHttpUrl(body?.url)) return NextResponse.json({ error: "Provide a valid public http(s) URL." }, { status: 400 });
    const data = await runFirecrawl("metadata", () => getFirecrawlClient().scrape(body.url, { formats: ["markdown"], onlyMainContent: true }));
    return NextResponse.json({ source: "real", metadata: data.metadata ?? {}, url: body.url });
  } catch (error) {
    const response = firecrawlErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
