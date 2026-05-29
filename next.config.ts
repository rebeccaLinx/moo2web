import type { NextConfig } from 'next'

const BASE_PATH = process.env.GITHUB_ACTIONS ? '/moo2web' : ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
}

export default nextConfig
