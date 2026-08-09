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

export async function providerError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string };
    message?: string;
  } | null;

  const message =
    body?.error?.message ??
    body?.message ??
    `Provider returned ${response.status}`;

  return new ProviderError(response.status, message, retryAfterOf(response));
}
