/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
    ],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, "canvas", "jsdom"];
    return config;
  },
  experimental: {
    runtime: "nodejs", // Force Node.js runtime instead of Edge
  },
  typescript: {
    ignoreBuildErrors: true, // ⛔ Ignores TypeScript errors in production
  },
};

export default nextConfig;
