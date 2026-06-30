/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },

  // Perf: lazy-load fuse.js — saves ~173KB from homepage bundle
  experimental: {
    optimizePackageImports: ['fuse.js'],
  },
}

module.exports = nextConfig