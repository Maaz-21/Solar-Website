/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // optional, if you want to be strict:
        // port: '',
        // pathname: '/**',
      },
    ],
    // optional, but common:
    // formats: ['image/avif', 'image/webp'],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
