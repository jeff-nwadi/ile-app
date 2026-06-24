import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Image sources: same-origin + data: (small inline SVG/CSS) + Cloudinary +
  // our own uploads route. Add your real CDN here.
  "img-src 'self' data: blob: https://res.cloudinary.com /api/uploads/ /uploads/",
  // Inline styles needed by Tailwind's runtime class generation. Tighten with
  // a nonce later if/when we drop dynamic inline <style>.
  "style-src 'self' 'unsafe-inline'",
  // Scripts: self + Paystack inline (loaded via @paystack/inline-js).
  "script-src 'self' 'unsafe-inline' https://js.paystack.co",
  "font-src 'self' data:",
  "connect-src 'self' https://api.paystack.co",
  "frame-src https://checkout.paystack.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
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