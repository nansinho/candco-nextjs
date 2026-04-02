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

  // TypeScript checking enabled during build
  typescript: {
    ignoreBuildErrors: false,
  },


  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.candco.fr",
      },
    ],
    // Formats modernes pour de meilleures performances
    formats: ["image/avif", "image/webp"],
    // Tailles d'images optimisées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  turbopack: {
    root: ".",
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
        // Headers de sécurité globaux
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.trustindex.io https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.trustindex.io",
              "img-src 'self' data: blob: https://supabase.candco.fr https://*.trustindex.io https://lh3.googleusercontent.com https://www.google-analytics.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://supabase.candco.fr https://*.trustindex.io https://www.google-analytics.com https://analytics.google.com",
              "frame-src 'self' https://*.trustindex.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
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
