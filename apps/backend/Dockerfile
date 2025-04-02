FROM node:20-alpine AS builder

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++

# Installation globale de NestJS CLI
RUN npm install -g @nestjs/cli

# Copie des fichiers du projet backend
WORKDIR /app/backend
COPY ./apps/backend/package.json ./
COPY ./apps/backend/tsconfig*.json ./
COPY ./apps/backend/nest-cli.json ./
COPY ./.npmrc /app/

# Installation des dépendances du backend
RUN npm install --prefer-offline --no-audit --legacy-peer-deps

# Copie du code source du backend
COPY ./apps/backend/src ./src

# Build de l'application backend
RUN nest build

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration des variables d'environnement
ENV NODE_ENV=production

# Ajout d'un utilisateur non-root pour plus de sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/.npmrc ./.npmrc

# Changement de propriétaire pour les fichiers
RUN chown -R nextjs:nodejs /app

# Passage à l'utilisateur non-root
USER nextjs

# Exposition du port
EXPOSE 3001

# Démarrage de l'application avec plus de stabilité
CMD ["node", "dist/main.js"]