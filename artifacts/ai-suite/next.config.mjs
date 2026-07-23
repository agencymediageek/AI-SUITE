/** @type {import('next').NextConfig} */
// On Replit: set NEXT_PUBLIC_BASE_PATH=/ai-suite
// On VPS production: leave NEXT_PUBLIC_BASE_PATH unset (app runs at root /)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,

  // Allow Replit dev domain for cross-origin requests
  allowedDevOrigins: ["*"],

  // Exclude ESM-only packages from webpack bundling to avoid
  // "require is not defined in ES module scope" errors on Node.js 24
  experimental: {
    serverComponentsExternalPackages: [
      "jose",
      "jsonwebtoken",
      "@supabase/supabase-js",
      "@supabase/postgrest-js",
      "@supabase/realtime-js",
      "@supabase/storage-api",
      "pdf2json",
      "mammoth",
      "docx",
      "fabric",
      "qrcode",
      "openai",
      "stripe",
      "imagekit",
      "nodemailer",
      "cheerio",
    ],
  },
};

export default nextConfig;
