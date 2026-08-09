import { ProviderError } from "@/modules/providers/provider.error.ts";

const BASE_MS = 1000;
const CAP_MS = 20_000;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Full jitter: two runs that hit the same limit at the same moment must not
 * come back in step, or they simply collide again.
 */
function backoff(attempt: number, retryAfterMs?: number) {
  if (retryAfterMs !== undefined) return Math.min(retryAfterMs, CAP_MS);

  const ceiling = Math.min(BASE_MS * 2 ** attempt, CAP_MS);
  return Math.round(Math.random() * ceiling);
}

export async function withRetry<T>(
  run: () => Promise<T>,
  options: {
    attempts?: number;
    deadline?: number;
    onWait?: (info: { attempt: number; waitMs: number; status: number }) => void;
  } = {}
): Promise<T> {
  const attempts = options.attempts ?? 4;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const retryable =
        error instanceof ProviderError
          ? error.retryable
          : error instanceof TypeError; // fetch failed

      if (!retryable || attempt >= attempts - 1) throw error;

      const wait = backoff(
        attempt,
        error instanceof ProviderError ? error.retryAfterMs : undefined
      );

      // Waiting past the run's deadline helps nobody — fail now with the real
      // reason instead of timing out later with a vague one.
      if (options.deadline && Date.now() + wait > options.deadline) throw error;

      options.onWait?.({
        attempt: attempt + 1,
        waitMs: wait,
        status: error instanceof ProviderError ? error.status : 0,
      });

      await sleep(wait);
    }
  }
}
