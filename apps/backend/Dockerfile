FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production

# Installation des dépendances globales nécessaires (si besoin)
RUN apk add --no-cache python3 make g++

# Copie des fichiers de configuration du monorepo
COPY package.json ./
COPY package-lock.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances à la racine avec un cache plus rapide
RUN npm install --prefer-offline --no-audit --legacy-peer-deps

# Copie du code source complet
COPY . .

# Build de l'application avec optimisation
RUN NODE_OPTIONS="--max_old_space_size=4096" npx nx build backend --configuration=production --skip-nx-cache

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration des variables d'environnement
ENV NODE_ENV=production

# Ajout d'un utilisateur non-root pour plus de sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Installation des dépendances de production uniquement
RUN npm install --only=production --prefer-offline --no-audit --legacy-peer-deps

# Changement de propriétaire pour les fichiers
RUN chown -R nextjs:nodejs /app

# Passage à l'utilisateur non-root
USER nextjs

# Exposition du port
EXPOSE 3001

# Démarrage de l'application avec plus de stabilité
CMD ["node", "main.js"]