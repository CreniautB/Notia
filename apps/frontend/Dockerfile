FROM node:20-alpine AS builder

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Préparation du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration du projet racine
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# Copie complète du répertoire frontend
COPY apps/frontend /app/frontend/
WORKDIR /app/frontend

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

# Build de l'application avec plus de mémoire
RUN NODE_OPTIONS="--max_old_space_size=4096" npx next build

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Copie des fichiers nécessaires
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public || mkdir -p ./public

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"] 