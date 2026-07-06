import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // If BACKEND_API_URL is set (e.g., local development), proxy requests there.
    // Otherwise, assume Vercel/Netlify is handling the /api routes natively via serverless functions.
    const backendUrl = process.env.BACKEND_API_URL;
    if (backendUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
