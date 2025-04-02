FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Copie des fichiers du projet frontend
WORKDIR /app/frontend
COPY ./apps/frontend/package.json ./
COPY ./apps/frontend/next.config.js ./
COPY ./apps/frontend/next-env.d.ts ./
COPY ./.npmrc ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Forcer l'utilisation de Next.js 14.0.0
RUN npm install next@14.0.0 react@18.2.0 react-dom@18.2.0 --save-exact --legacy-peer-deps

# Copie du code source du frontend
COPY ./apps/frontend/public ./public
COPY ./apps/frontend/src ./src
COPY ./apps/frontend/tsconfig.json ./
COPY ./apps/frontend/.eslintrc.js ./

# Nettoyage du cache Next.js pour éviter les problèmes
RUN npx rimraf ./.next ./node_modules/.cache

# Build de l'application avec débogage et plus de mémoire
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
COPY --from=builder /app/frontend/public ./public

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"] 