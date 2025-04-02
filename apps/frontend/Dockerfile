FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Copie des fichiers pour l'installation des dépendances
COPY package.json ./
COPY package-lock.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Forcer l'utilisation de Next.js 14.0.0
RUN npm install next@14.0.0 --save-exact --legacy-peer-deps

# Copie du code source complet
COPY . .

# Nettoyage du cache Next.js pour éviter les problèmes
RUN npx rimraf ./apps/frontend/.next ./apps/frontend/node_modules/.cache

# Build de l'application avec débogage et plus de mémoire
RUN NODE_OPTIONS="--max_old_space_size=4096" npx nx build frontend --verbose

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Copie des fichiers nécessaires
COPY --from=builder /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder /app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/dist/apps/frontend/public ./public

# Exposition du port
EXPOSE 3000

# Commande de démarrage avec des options de performance
CMD ["node", "server.js"] 