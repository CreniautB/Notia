/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vous pouvez changer le port ici si nécessaire
  // server: {
  //   port: 4200
  // }
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
