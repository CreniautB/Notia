FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++

# Copie des fichiers de configuration du monorepo
COPY package.json ./
COPY package-lock.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .npmrc ./

# Installation des dépendances à la racine
RUN npm install --prefer-offline --no-audit --legacy-peer-deps

# Installation globale de Nx CLI
RUN npm install -g nx@16.6.0

# Copie du code source complet
COPY . .

# Build de l'application avec optimisation
RUN nx build backend --configuration=production --skip-nx-cache

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
COPY --from=builder /app/.npmrc ./.npmrc

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