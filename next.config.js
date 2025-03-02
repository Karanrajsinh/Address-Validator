/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the 'output: export' for development
  // This setting is for static exports and conflicts with API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    // This will be available on the client side
    NEXT_PUBLIC_HAS_GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'true' : '',
  },
};

module.exports = nextConfig;