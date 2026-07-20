import "server-only";

import Firecrawl from "@mendable/firecrawl-js";

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;

export type FirecrawlFailureCode = "unavailable" | "timeout" | "rate_limit" | "failed";

export class FirecrawlRequestError extends Error {
  constructor(
    message: string,
    public readonly code: FirecrawlFailureCode
  ) {
    super(message);
  }
}

export function isFirecrawlConfigured() {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

export function getFirecrawlClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new FirecrawlRequestError("Firecrawl is not configured for this environment.", "unavailable");
  }

  return new Firecrawl(apiKey);
}

export function isPublicHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_048) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const blocked =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    return (url.protocol === "https:" || url.protocol === "http:") && !blocked;
  } catch {
    return false;
  }
}

export function requireString(value: unknown, label: string, maxLength = 300) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new FirecrawlRequestError(`Provide a ${label} of no more than ${maxLength} characters.`, "failed");
  }

  return value.trim();
}

function classifyError(error: unknown): FirecrawlRequestError {
  if (error instanceof FirecrawlRequestError) return error;
  const message = error instanceof Error ? error.message : "Firecrawl could not complete this request.";
  const normalized = message.toLowerCase();

  if (normalized.includes("429") || normalized.includes("rate limit")) {
    return new FirecrawlRequestError("Firecrawl rate limit reached. Please try again shortly.", "rate_limit");
  }
  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("aborted")) {
    return new FirecrawlRequestError("Firecrawl took too long to respond. Please try again.", "timeout");
  }
  return new FirecrawlRequestError("Firecrawl could not complete this request.", "failed");
}

async function withTimeout<T>(operation: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new FirecrawlRequestError("Firecrawl request timed out.", "timeout")), REQUEST_TIMEOUT_MS);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function runFirecrawl<T>(operation: string, action: () => Promise<T>) {
  let lastError: FirecrawlRequestError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const startedAt = Date.now();
    try {
      const value = await withTimeout(action());
      console.info(JSON.stringify({ event: "firecrawl.request", operation, attempt, outcome: "success", durationMs: Date.now() - startedAt }));
      return value;
    } catch (error) {
      lastError = classifyError(error);
      console.warn(JSON.stringify({ event: "firecrawl.request", operation, attempt, outcome: lastError.code, durationMs: Date.now() - startedAt }));
      if (lastError.code === "rate_limit" || lastError.code === "unavailable" || attempt === MAX_ATTEMPTS) break;
    }
  }

  throw lastError ?? new FirecrawlRequestError("Firecrawl could not complete this request.", "failed");
}

export function firecrawlErrorResponse(error: unknown) {
  const failure = classifyError(error);
  const status = failure.code === "unavailable" ? 503 : failure.code === "timeout" ? 504 : failure.code === "rate_limit" ? 429 : 502;
  return { body: { error: failure.message, code: failure.code }, status };
}
