import { NextResponse, type NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const response = await fetch(`${API}/links/${token}/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { success: true; data: { documentId: string } }
    | { success: false; error: { message: string } }
    | null;

  if (!payload?.success) {
    const message = payload?.success === false ? payload.error.message : "";
    const url = new URL("/link-unavailable", request.url);
    if (message) url.searchParams.set("reason", message);
    return NextResponse.redirect(url);
  }

  const redirect = NextResponse.redirect(
    new URL(`/d/${payload.data.documentId}`, request.url)
  );

  for (const cookie of response.headers.getSetCookie()) {
    redirect.headers.append("set-cookie", cookie);
  }

  return redirect;
}
