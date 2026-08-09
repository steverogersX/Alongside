import { NextResponse, type NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Hand the browser to the API rather than redeeming here. The session cookie
 * has to be set by the host that will later be asked for the document — a
 * cookie set on this app's host is never sent to the API's, so forwarding one
 * through here leaves the guest unauthenticated.
 *
 * request.url is also the internal address behind a proxy, so building the
 * next hop from it is how a shared link ends up pointing at localhost.
 */
export function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  return context.params.then(({ token }) =>
    NextResponse.redirect(`${API}/links/${token}/open`, 307)
  );
}
