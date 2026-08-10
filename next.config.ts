import type { NextConfig } from "next";

/**
 * Where this server reaches the API. Inside a container network that is a
 * service name, not the public hostname.
 */
const INTERNAL_API =
  process.env.API_INTERNAL_URL ?? "http://localhost:4000/api";

const nextConfig: NextConfig = {
  /**
   * The API is served under this app's own origin. Without it the browser is
   * talking to a second host, its cookies are third-party, and every request
   * fails for anyone whose browser blocks those — which is the default in a
   * private window. Proxying makes the session a first-party cookie again.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${INTERNAL_API}/:path*` }];
  },
};

export default nextConfig;
