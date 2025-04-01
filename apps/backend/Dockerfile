FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY workspace.json ./

# Installation des dépendances à la racine
RUN npm install

# Copie du code source complet
COPY . .

# Build de l'application
RUN npx nx build backend --configuration=production

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Exposition du port
EXPOSE 3001

# Démarrage de l'application
CMD ["node", "dist/main.js"]