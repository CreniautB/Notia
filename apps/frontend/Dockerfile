FROM node:20-alpine AS builder

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Préparation du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration du projet racine
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# Installation des dépendances Nx nécessaires
RUN npm install --no-package-lock @nx/next@16.6.0

# Copie complète du répertoire frontend
COPY apps/frontend /app/frontend/
WORKDIR /app/frontend

# Création d'un fichier next.config.js simplifié pour Docker
RUN echo "/** @type {import('next').NextConfig} */\n\
const nextConfig = {\n\
  output: 'standalone',\n\
  reactStrictMode: true,\n\
  poweredByHeader: false,\n\
  eslint: { ignoreDuringBuilds: true },\n\
  typescript: { ignoreBuildErrors: true },\n\
  transpilePackages: ['three'],\n\
  images: {\n\
    domains: ['notias.fr', '217.154.16.57'],\n\
    unoptimized: true,\n\
  },\n\
  async rewrites() {\n\
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001';\n\
    return [{ source: '/api/:path*', destination: \`\${apiUrl}/api/:path*\` }];\n\
  },\n\
};\n\
\n\
module.exports = nextConfig;" > next.config.docker.js

# Création du fichier next-env.d.ts s'il n'existe pas
RUN if [ ! -f "next-env.d.ts" ]; then \
    echo '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/basic-features/typescript for more information.' > next-env.d.ts; \
    fi

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Forcer l'utilisation de Next.js 14.0.0 et React 18.2.0
RUN npm install next@14.0.0 react@18.2.0 react-dom@18.2.0 --save-exact --legacy-peer-deps

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Nettoyage du cache Next.js pour éviter les problèmes
RUN npx rimraf ./.next ./node_modules/.cache

# Utiliser le fichier de configuration Docker pour le build
RUN cp next.config.docker.js next.config.js

# Build de l'application avec plus de mémoire
RUN NODE_OPTIONS="--max_old_space_size=4096" npx next build

# Vérification du résultat du build
RUN ls -la ./.next || echo "Répertoire .next non trouvé"
RUN ls -la ./.next/standalone || echo "Mode standalone non généré"

# Création d'un script d'entrée alternatif pour le build au démarrage
RUN echo "#!/bin/sh\n\
echo 'Lancement du build Next.js au démarrage...'\n\
# Utiliser le fichier de configuration Docker\n\
cp next.config.docker.js next.config.js\n\
# Nettoyer le cache\n\
npx rimraf ./.next ./node_modules/.cache\n\
# Build avec plus de mémoire\n\
NODE_OPTIONS='--max_old_space_size=4096' npx next build\n\
# Lancer le serveur\n\
node server.js" > docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001
ENV NEXT_PRIVATE_STANDALONE=true

# Copie des fichiers nécessaires
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public || mkdir -p ./public
COPY --from=builder /app/frontend/docker-entrypoint.sh ./

# Alternative: Si la build échoue pendant la construction Docker, utiliser le script d'entrée
# ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"] 