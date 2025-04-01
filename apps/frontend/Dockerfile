FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances à la racine
RUN npm install

# Copie du code source complet
COPY . .

# Build de l'application
RUN npx nx build frontend --configuration=production

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder /app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/dist/apps/frontend/public ./public

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "server.js"] 