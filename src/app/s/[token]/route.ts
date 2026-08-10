import type { NextRequest } from "next/server";

/**
 * Redeeming happens at the API, but through this app's own origin so the
 * cookie it sets is first-party — a browser blocking third-party cookies, as
 * private windows do by default, would otherwise drop it and leave the guest a
 * stranger on the very next request.
 *
 * The Location is relative on purpose: request.url is the internal address
 * behind a proxy, and building an absolute URL from it is how a shared link
 * ends up pointing at localhost.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  return new Response(null, {
    status: 307,
    headers: { location: `/api/links/${encodeURIComponent(token)}/open` },
  });
}
