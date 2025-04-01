FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY . .

# Installation des dépendances
RUN npm install

# Build de l'application
RUN npx nx build backend --configuration=production

# Génération du package.json de production
RUN npx nx generate-package-json backend

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/dist/apps/backend/package.json ./

# Installation des dépendances de production
RUN npm install --production

# Exposition du port
EXPOSE 3001

# Démarrage de l'application
CMD ["node", "main.js"]