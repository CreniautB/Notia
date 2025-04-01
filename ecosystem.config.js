module.exports = {
  apps: [
    {
      name: 'notia-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'notia-frontend',
      cwd: './apps/frontend/.next/standalone',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://notias.fr'
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
}; 