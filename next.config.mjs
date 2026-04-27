/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse reads test files at require-time in some code paths; avoid bundling them
      config.externals = [...(config.externals ?? []), 'canvas']
    }
    return config
  },
}

export default nextConfig
