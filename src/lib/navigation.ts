/**
 * Helper function for admin navigation paths
 * Automatically prepends /admin prefix based on environment
 */
export const adminPath = (path: string): string => {
  const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '/admin';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

/**
 * Shorthand for common admin paths
 */
export const admin = {
  home: () => adminPath('/'),
  dashboard: () => adminPath('/dashboard'),
  login: () => adminPath('/login'),
  logout: () => adminPath('/logout'),
  notFound: () => adminPath('/404'),
  forbidden: () => adminPath('/403'),
};
