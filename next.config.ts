import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Turnstile
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      // Styles: Next.js injects inline styles
      "style-src 'self' 'unsafe-inline'",
      // Images: self + R2 wildcard
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com",
      // Fonts: self
      "font-src 'self'",
      // API calls: self + Turnstile + R2 presigned uploads
      "connect-src 'self' https://challenges.cloudflare.com https://*.r2.cloudflarestorage.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
