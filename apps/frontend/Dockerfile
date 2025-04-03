FROM node:20-alpine AS builder

# Installation des dépendances globales nécessaires
RUN apk add --no-cache python3 make g++ git

# Préparation du répertoire de travail
WORKDIR /app/frontend

# Créer un package.json minimal pour le frontend
RUN echo '{' > package.json && \
    echo '  "name": "frontend",' >> package.json && \
    echo '  "version": "0.1.0",' >> package.json && \
    echo '  "private": true,' >> package.json && \
    echo '  "scripts": {' >> package.json && \
    echo '    "build": "next build",' >> package.json && \
    echo '    "start": "next start"' >> package.json && \
    echo '  },' >> package.json && \
    echo '  "dependencies": {' >> package.json && \
    echo '    "@emotion/react": "11.11.0",' >> package.json && \
    echo '    "@emotion/styled": "11.11.0",' >> package.json && \
    echo '    "@mui/icons-material": "5.14.0",' >> package.json && \
    echo '    "@mui/material": "5.14.0",' >> package.json && \
    echo '    "@react-three/drei": "9.80.0",' >> package.json && \
    echo '    "@react-three/fiber": "8.13.6",' >> package.json && \
    echo '    "next": "14.0.0",' >> package.json && \
    echo '    "react": "18.2.0",' >> package.json && \
    echo '    "react-dom": "18.2.0",' >> package.json && \
    echo '    "three": "0.154.0"' >> package.json && \
    echo '  }' >> package.json && \
    echo '}' >> package.json

# Créer un tsconfig.json minimal pour le frontend
RUN echo '{' > tsconfig.json && \
    echo '  "compilerOptions": {' >> tsconfig.json && \
    echo '    "target": "es5",' >> tsconfig.json && \
    echo '    "lib": ["dom", "dom.iterable", "esnext"],' >> tsconfig.json && \
    echo '    "allowJs": true,' >> tsconfig.json && \
    echo '    "skipLibCheck": true,' >> tsconfig.json && \
    echo '    "strict": true,' >> tsconfig.json && \
    echo '    "forceConsistentCasingInFileNames": true,' >> tsconfig.json && \
    echo '    "noEmit": true,' >> tsconfig.json && \
    echo '    "esModuleInterop": true,' >> tsconfig.json && \
    echo '    "module": "esnext",' >> tsconfig.json && \
    echo '    "moduleResolution": "node",' >> tsconfig.json && \
    echo '    "resolveJsonModule": true,' >> tsconfig.json && \
    echo '    "isolatedModules": true,' >> tsconfig.json && \
    echo '    "jsx": "preserve",' >> tsconfig.json && \
    echo '    "incremental": true,' >> tsconfig.json && \
    echo '    "plugins": [' >> tsconfig.json && \
    echo '      {' >> tsconfig.json && \
    echo '        "name": "next"' >> tsconfig.json && \
    echo '      }' >> tsconfig.json && \
    echo '    ],' >> tsconfig.json && \
    echo '    "paths": {' >> tsconfig.json && \
    echo '      "@/*": ["./src/*"],' >> tsconfig.json && \
    echo '      "@notia/shared/*": ["../libs/shared/src/*"]' >> tsconfig.json && \
    echo '    }' >> tsconfig.json && \
    echo '  },' >> tsconfig.json && \
    echo '  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],' >> tsconfig.json && \
    echo '  "exclude": ["node_modules"]' >> tsconfig.json && \
    echo '}' >> tsconfig.json

# Créer un next.config.js minimal
RUN echo 'module.exports = {' > next.config.js && \
    echo '  output: "standalone",' >> next.config.js && \
    echo '  eslint: { ignoreDuringBuilds: true },' >> next.config.js && \
    echo '  typescript: { ignoreBuildErrors: true },' >> next.config.js && \
    echo '  transpilePackages: ["three"],' >> next.config.js && \
    echo '  images: { unoptimized: true },' >> next.config.js && \
    echo '  webpack: (config, { isServer }) => {' >> next.config.js && \
    echo '    config.resolve.alias = {' >> next.config.js && \
    echo '      ...config.resolve.alias,' >> next.config.js && \
    echo '      "@notia/shared": "/app/libs/shared/src"' >> next.config.js && \
    echo '    };' >> next.config.js && \
    echo '    return config;' >> next.config.js && \
    echo '  }' >> next.config.js && \
    echo '};' >> next.config.js

# Créer le fichier next-env.d.ts
RUN echo '/// <reference types="next" />' > next-env.d.ts && \
    echo '/// <reference types="next/image-types/global" />' >> next-env.d.ts && \
    echo '' >> next-env.d.ts && \
    echo '// NOTE: This file should not be edited' >> next-env.d.ts && \
    echo '// see https://nextjs.org/docs/basic-features/typescript for more information.' >> next-env.d.ts

# Créer les répertoires nécessaires
RUN mkdir -p ./src ./public ../libs/shared/src

# Copier le code source
COPY apps/frontend/src ./src
COPY apps/frontend/public ./public
COPY libs/shared/src ../libs/shared/src

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001

# Build de l'application avec plus de mémoire
RUN NODE_OPTIONS="--max_old_space_size=4096" npx next build

# Créer un script server-wrapper.js pour gérer les variables d'environnement
RUN echo 'const path = require("path");' > server-wrapper.js && \
    echo 'process.env.NODE_ENV = "production";' >> server-wrapper.js && \
    echo 'process.env.NEXT_TELEMETRY_DISABLED = "1";' >> server-wrapper.js && \
    echo 'process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:3001";' >> server-wrapper.js && \
    echo 'console.log("Starting server with API URL:", process.env.NEXT_PUBLIC_API_URL);' >> server-wrapper.js && \
    echo 'require(path.join(process.cwd(), "server.js"));' >> server-wrapper.js

# Copier le wrapper dans le répertoire standalone
RUN cp server-wrapper.js ./.next/standalone/

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Configuration de l'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://backend:3001
ENV NEXT_PRIVATE_STANDALONE=true

# Copie des fichiers nécessaires
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public

# Exposition du port
EXPOSE 3000

# Utiliser le wrapper pour démarrer l'application
CMD ["node", "server-wrapper.js"] 