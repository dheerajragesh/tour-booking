/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  // Allow webpack-hmr websocket requests from your dev host
  allowedDevOrigins: ['192.168.20.216'],
};


export default nextConfig;
