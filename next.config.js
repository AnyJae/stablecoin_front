/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_AVALANCHE_RPC_URL: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    NEXT_PUBLIC_XRPL_SERVER_URL: process.env.NEXT_PUBLIC_XRPL_SERVER_URL || 'wss://s.devnet.rippletest.net:51233',
  },
  
  // 이미지 도메인 설정
  images: {
    domains: ['localhost'],
  },
  
  // API 라우트 설정
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    console.log('Backend URL for rewrites:', backendUrl);
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // Node.js 모듈을 클라이언트에서 사용할 수 있도록 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 