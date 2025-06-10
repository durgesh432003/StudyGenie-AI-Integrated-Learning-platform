/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js configuration options
  reactStrictMode: true,
  
  // SWC configuration is now the default in newer Next.js versions
  // and swcMinify is no longer needed as an explicit option
  experimental: {
    // Only keep valid experimental options
    // forceSwcTransforms is also deprecated in newer Next.js versions
  }
}

module.exports = nextConfig