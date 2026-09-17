/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['mapbox-gl', 'design-system'],
  allowedDevOrigins: ['192.168.100.105'],
  images: {
    qualities: [60, 75],
  },
};

export default nextConfig;
