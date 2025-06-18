/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuración para Material UI
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/styled-engine'
  ],
  // Configuración para optimización de imágenes
  images: {
    domains: [],
  },
  // Configuración para webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/styled-engine': '@mui/styled-engine-sc'
    };
    return config;
  },
};

module.exports = nextConfig; 