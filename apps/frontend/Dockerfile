FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NX_DAEMON=false
ENV NODE_ENV=production

# Copie des fichiers de configuration du monorepo
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances à la racine
RUN npm ci

# Copie du code source complet
COPY . .

# Build de l'application
RUN npx nx build frontend --configuration=production

# Génération du package.json de production avec le démon désactivé
RUN NODE_ENV=production npx nx generate-package-json frontend --project=frontend

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder /app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/dist/apps/frontend/public ./public
COPY --from=builder /app/package.json ./

# Installation des dépendances de production
RUN npm ci --omit=dev

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "server.js"] 