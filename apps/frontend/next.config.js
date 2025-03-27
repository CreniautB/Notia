/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Configurer le build pour éviter les blocages
  output: 'standalone',
  
  // Configuration pour Next.js 15+
  reactStrictMode: true,
  
  // Désactiver certaines optimisations qui peuvent bloquer le build
  // swcMinify: false, // Suppression de cette option qui n'est plus supportée
  
  // Personnaliser les règles ESLint
  eslint: {
    // Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },

  // Ignorer les erreurs TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Empêcher le pré-rendu statique de certaines routes
  // La syntaxe correcte pour Next.js 15
  skipTrailingSlashRedirect: true,
  
  transpilePackages: ['three'],
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    // Optimiser les options de surveillance
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    };

    // Résoudre les modules partagés
    config.resolve.alias = {
      ...config.resolve.alias,
      '@notia/shared': require('path').resolve(__dirname, '../../libs/shared'),
    };

    // Augmenter la taille limite des assets
    config.performance = {
      ...config.performance,
      maxAssetSize: 1000000, // 1MB
      maxEntrypointSize: 1000000, // 1MB
    };

    // Optimisations supplémentaires
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  async rewrites() {
    // Choisir l'URL API en fonction de l'environnement
    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL || 'http://217.154.16.57'
      : 'http://127.0.0.1:3001';
    
    console.log(`[Config] Environnement: ${process.env.NODE_ENV}, API URL de base: ${apiBaseUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ['localhost', '217.154.16.57', 'notias.fr'],
  },
  // Configuration pour les assets statiques
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://notias.fr' : '',
  // Configuration pour le serveur de production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
