const nextConfig = {
  basePath: '/admin',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kosmo.vietprodev.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
