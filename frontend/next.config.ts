import type { NextConfig } from "next";

// Backend base URL. Server-side fetches use it directly; client form posts go
// through the rewrite below so they stay same-origin (no CORS).
const BACKEND = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
