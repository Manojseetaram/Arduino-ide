/** @type {import('next').NextConfig} */
const nextConfig = {
  // redirects: async () => [
  //   {
  //     source: '/',
  //     destination: '/',
  //     permanent: false, // Use false if this might change based on auth
  //   },
  // ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
}

export default nextConfig