import type { NextConfig } from "next";
import { execSync } from "child_process";

// Get build info at build time
const getBuildInfo = () => {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    const commitDate = execSync("git log -1 --format=%ci").toString().trim();
    return { commitHash, commitDate };
  } catch {
    return { commitHash: "dev", commitDate: new Date().toISOString() };
  }
};

const buildInfo = getBuildInfo();

const nextConfig: NextConfig = {
  // Expose build info to client
  env: {
    NEXT_PUBLIC_BUILD_ID: buildInfo.commitHash,
    NEXT_PUBLIC_BUILD_DATE: buildInfo.commitDate,
  },
  output: "standalone",

  // Skip TypeScript checking during build (VPS memory optimization)
  // TypeScript errors are still caught during development
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build (VPS memory optimization)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sxadbvezilpcldmncjrk.supabase.co",
      },
    ],
    // Formats modernes pour de meilleures performances
    formats: ["image/avif", "image/webp"],
    // Tailles d'images optimisées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Expérimental - améliorations de performance
  experimental: {
    // Optimise le tree-shaking des packages
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
    ],
  },

  // Headers de sécurité et cache
  async headers() {
    return [
      {
        // Cache statique pour les assets
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache pour les pages statiques
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // Compression activée
  compress: true,

  // Génération de source maps uniquement en dev
  productionBrowserSourceMaps: false,

  // Powered by header désactivé (sécurité)
  poweredByHeader: false,
};

export default nextConfig;
