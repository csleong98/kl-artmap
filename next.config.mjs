/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['mapbox-gl'],
  allowedDevOrigins: ['192.168.100.105'],
};

export default nextConfig;
