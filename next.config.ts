import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Tells the browser bundle whether bookings go to the shared Supabase store (lib/store.ts).
    NEXT_PUBLIC_SHARED_STORE:
      process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? "1" : "",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  async headers() {
    return [
      {
        // Frame sequences never change for a given build — cache them hard.
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
