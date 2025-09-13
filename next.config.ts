import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // habilita otimização para o bucket do S3
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgprodutos.s3.us-east-2.amazonaws.com",
        pathname: "**",
      },
    ],
    // opcional, mas ajuda em algumas versões
    domains: ["imgprodutos.s3.us-east-2.amazonaws.com"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;
