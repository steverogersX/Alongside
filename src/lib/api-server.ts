import { headers } from "next/headers";

import { api } from "@/lib/api";

/**
 * The API as this server reaches it, which need not be the URL the browser
 * uses: inside a container network the public hostname often does not resolve.
 */
const BASE_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/** A slow API should not hold the page hostage; the client can retry. */
const TIMEOUT_MS = 3000;

/**
 * The session rides on the cookie; the rest is so the API sees the person who
 * asked rather than this server. Without them every server-rendered request
 * looks like it came from one machine, which makes rate limits and audit logs
 * useless.
 */
async function forwarded() {
  const incoming = await headers();

  return Object.fromEntries(
    (["cookie", "user-agent", "x-forwarded-for", "x-real-ip"] as const)
      .map((name) => [name, incoming.get(name)])
      .filter(([, value]) => value)
  ) as Record<string, string>;
}

/**
 * The same request the browser makes, minus the one thing a server cannot do
 * for itself: there is no cookie jar in node, so the session has to be read off
 * the incoming request and re-sent by hand.
 */
export async function serverGet<T>(path: string): Promise<T> {
  return api<T>(path, {
    baseUrl: BASE_URL,
    headers: await forwarded(),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
