export class ProviderError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }

  /** 429 is the one worth waiting on; 5xx and network blips are worth one or two. */
  get retryable() {
    return this.status === 429 || this.status >= 500;
  }
}

export function retryAfterOf(response: Response) {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds) * 1000;

  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

const MAX_MESSAGE = 180;

/**
 * Providers return essays — Gemini's quota error is a dozen lines of metric
 * names and links. Keep the first sentence; the rest is noise in a chat rail.
 */
function tidy(message: string) {
  const first = message.split(/[\n*]|(?<=\.)\s(?=[A-Z])/)[0] ?? message;
  const trimmed = first.replace(/\s+/g, " ").trim();

  return trimmed.length > MAX_MESSAGE
    ? `${trimmed.slice(0, MAX_MESSAGE - 1).trimEnd()}…`
    : trimmed;
}

export async function providerError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { retryDelay?: string }[] };
    message?: string;
  } | null;

  const message = tidy(
    body?.error?.message ??
      body?.message ??
      `Provider returned ${response.status}`
  );

  // Gemini puts its wait in the body rather than a Retry-After header.
  const detail = body?.error?.details?.find((row) => row.retryDelay);
  const bodyDelay = detail?.retryDelay
    ? Number.parseFloat(detail.retryDelay) * 1000
    : undefined;

  return new ProviderError(
    response.status,
    message,
    retryAfterOf(response) ?? (Number.isFinite(bodyDelay) ? bodyDelay : undefined)
  );
}
