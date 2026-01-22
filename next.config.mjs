/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['maplibre-gl'],
};

export default nextConfig;
