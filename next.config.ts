import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Permitir tu dominio en next/image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fitnesschallenge.fenifisc.com" },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Compresión
  compress: true,
};

export default nextConfig;
