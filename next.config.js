/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable SWC and disable Babel
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Add any other Next.js configuration options here
  reactStrictMode: true,
}

module.exports = nextConfig