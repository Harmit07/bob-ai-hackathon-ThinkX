/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fallback to Babel if SWC native binary fails to load on this machine
  experimental: {
    forceSwcTransforms: false,
  },
}

module.exports = nextConfig
