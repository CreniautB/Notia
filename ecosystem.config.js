module.exports = {
  apps: [
    {
      name: 'notia-backend',
      cwd: '/home/notia/Notia/apps/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb://localhost:27017/notia',
        GOOGLE_CLIENT_ID: '17316209711-ebjpj0c4k9ptt69qjp76evqfdqh4digq.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        GOOGLE_CALLBACK_URL: 'https://notias.fr/api/auth/google/callback',
        ADMIN_EMAILS: 'creniaut.benjamin@gmail.com',
        SESSION_SECRET: '474311d581ebb2a8dee7293f4d51d15c90e2940d6766f3ebe897e2c0d093e34c',
        FRONTEND_URL: 'https://notias.fr'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'notia-frontend',
      cwd: '/home/notia/Notia/apps/frontend/.next/standalone',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://notias.fr',
        NODE_TLS_REJECT_UNAUTHORIZED: '0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}; 