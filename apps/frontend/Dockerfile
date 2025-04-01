FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY . .

# Installation des dépendances
RUN npm install

# Build de l'application
RUN npx nx build frontend --configuration=production

# Génération du package.json de production
RUN npx nx generate-package-json frontend

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder /app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/dist/apps/frontend/public ./public
COPY --from=builder /app/dist/apps/frontend/package.json ./

# Installation des dépendances de production
RUN npm install --production

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "server.js"] 