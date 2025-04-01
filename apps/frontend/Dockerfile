FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001
ENV NX_SKIP_NX_CACHE=true

# Copie des fichiers de configuration du monorepo
COPY package.json ./
COPY package-lock.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances à la racine
RUN npm install --frozen-lockfile

# Copie du code source complet
COPY . .

# Build de l'application avec options optimisées
RUN NODE_OPTIONS="--max_old_space_size=4096" npx nx build frontend --configuration=production --skip-nx-cache

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration de l'environnement de production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder /app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/dist/apps/frontend/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Installation des dépendances de production
RUN npm install --omit=dev --frozen-lockfile

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "server.js"] 