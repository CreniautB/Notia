FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Build de l'application
RUN npx nx build backend --configuration=production

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Exposition du port
EXPOSE 3001

# Démarrage de l'application
CMD ["node", "dist/main.js"] 