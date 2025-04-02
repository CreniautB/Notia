FROM node:20-alpine AS builder

# Configuration de l'environnement
ENV NODE_ENV=production

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Définir un répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du projet racine
COPY package.json .
COPY package-lock.json* .
COPY .npmrc* .

# Installer les dépendances racine (partiellement)
RUN npm install --production=false --ignore-scripts

# Copier les fichiers de configuration spécifiques au backend
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/tsconfig.build.json* ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/

# Installer les dépendances du backend
WORKDIR /app/apps/backend
RUN npm install --production=false

# Copier le code source du backend
COPY apps/backend/src ./src

# Construire l'application
RUN npm run build

# Image de production
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Ajouter un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./

# Changer le propriétaire des fichiers
RUN chown -R nestjs:nodejs /app

# Passer à l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "dist/main.js"]