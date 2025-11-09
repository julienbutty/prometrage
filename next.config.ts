import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver ESLint pendant le build Vercel (Prisma généré pose problème)
  // ESLint reste actif en développement local via `npm run lint`
  // TODO: Migrer Prisma output vers node_modules avant prod finale
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
