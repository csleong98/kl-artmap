/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['mapbox-gl'],
};

export default nextConfig;
