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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // AVIF first (≈20-30% smaller than WebP), WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Qualities used by <Image quality={...}> must be declared here.
    qualities: [60, 75],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
