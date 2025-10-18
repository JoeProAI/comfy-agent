/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COMFY_CLOUD_KEY: process.env.COMFY_CLOUD_KEY,
    SMART_MODEL_ROUTER: process.env.SMART_MODEL_ROUTER || 'true',
  },
}

export default nextConfig