/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // Static HTML export — no server needed, deploys to Vercel/GitHub Pages
  trailingSlash: true,   // /part-9 → /part-9/index.html (works on all static hosts)
  images: {
    unoptimized: true,   // Required for static export (no Next.js image server)
  },
};

export default nextConfig;
