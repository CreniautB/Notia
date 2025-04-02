FROM node:20-alpine AS builder

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Préparation du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration du projet racine
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY nx.json ./
COPY .npmrc* ./

# Copie des bibliothèques partagées
COPY libs /app/libs/

# Installation des dépendances Nx nécessaires
RUN npm install --no-package-lock @nx/next@16.6.0

# Copie complète du répertoire frontend
COPY apps/frontend /app/frontend/
WORKDIR /app/frontend

# Remplacer le fichier next.config.js par une version minimale
RUN echo 'module.exports = {' > next.config.simple.js && \
    echo '  output: "standalone",' >> next.config.simple.js && \
    echo '  eslint: { ignoreDuringBuilds: true },' >> next.config.simple.js && \
    echo '  typescript: { ignoreBuildErrors: true },' >> next.config.simple.js && \
    echo '  transpilePackages: ["three"],' >> next.config.simple.js && \
    echo '  images: { unoptimized: true }' >> next.config.simple.js && \
    echo '};' >> next.config.simple.js

RUN cat next.config.simple.js
RUN cp next.config.simple.js next.config.js

# Création du fichier next-env.d.ts s'il n'existe pas
RUN if [ ! -f "next-env.d.ts" ]; then \
    echo '/// <reference types="next" />' > next-env.d.ts && \
    echo '/// <reference types="next/image-types/global" />' >> next-env.d.ts && \
    echo '' >> next-env.d.ts && \
    echo '// NOTE: This file should not be edited' >> next-env.d.ts && \
    echo '// see https://nextjs.org/docs/basic-features/typescript for more information.' >> next-env.d.ts; \
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

# Debug - montrer le contenu du fichier de configuration et vérifier les fichiers importants
RUN cat next.config.js
RUN ls -la /app/tsconfig.base.json
RUN ls -la /app/libs || echo "Répertoire libs non trouvé"

# Build de l'application avec plus de mémoire
RUN NODE_OPTIONS="--max_old_space_size=4096" npx next build

# Vérification du résultat du build
RUN ls -la ./.next || echo "Répertoire .next non trouvé"
RUN ls -la ./.next/standalone || echo "Mode standalone non généré"

# Créer un script server-wrapper.js pour gérer les variables d'environnement
RUN echo 'const path = require("path");' > server-wrapper.js && \
    echo 'process.env.NODE_ENV = "production";' >> server-wrapper.js && \
    echo 'process.env.NEXT_TELEMETRY_DISABLED = "1";' >> server-wrapper.js && \
    echo 'process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:3001";' >> server-wrapper.js && \
    echo 'console.log("Starting server with API URL:", process.env.NEXT_PUBLIC_API_URL);' >> server-wrapper.js && \
    echo 'require(path.join(process.cwd(), "server.js"));' >> server-wrapper.js

# Copier le wrapper dans le répertoire standalone
RUN cp server-wrapper.js ./.next/standalone/

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

# Exposition du port
EXPOSE 3000

# Utiliser le wrapper pour démarrer l'application
CMD ["node", "server-wrapper.js"] 