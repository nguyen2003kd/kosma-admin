const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN ?? '';
const isLocalBackend =
  backendDomain.startsWith('http://localhost') || backendDomain.startsWith('http://127.0.0.1');

const nextConfig = {
  basePath: '/admin',
  images: {
    dangerouslyAllowLocalIP: isLocalBackend,
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
