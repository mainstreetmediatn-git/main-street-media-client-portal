const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const dashboard = path.join(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(dashboard, relativePath), "utf8");

test("Firecrawl client is server-only and never exposes a public key", () => {
  const source = read("lib/firecrawl.ts");
  assert.match(source, /import "server-only"/);
  assert.match(source, /process\.env\.FIRECRAWL_API_KEY/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_FIRECRAWL/);
});

test("Firecrawl routes cover each required backend operation", () => {
  for (const route of ["health", "business-search", "scrape", "competitors", "research", "screenshot", "metadata"]) {
    assert.ok(fs.existsSync(path.join(dashboard, "app/api/firecrawl", route, "route.ts")), `missing ${route} route`);
  }
});

test("health endpoint contains only safe status fields", () => {
  const source = read("app/api/firecrawl/health/route.ts");
  assert.match(source, /configured: (true|false)/);
  assert.match(source, /connected: (true|false)/);
  assert.match(source, /status:/);
  assert.doesNotMatch(source, /FIRECRAWL_API_KEY[^\n]*:/);
});
