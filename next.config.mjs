/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permite conexiones HMR desde dominios externos (ngrok, etc.)
  allowedDevOrigins: [
    process.env.NGROK_URL,
  ].filter(Boolean),
}

export default nextConfig
