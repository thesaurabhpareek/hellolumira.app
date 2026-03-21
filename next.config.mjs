/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for catching potential issues in development
  reactStrictMode: true,

  // Disable source maps in production to prevent code exposure
  productionBrowserSourceMaps: false,

  // Security headers applied to all routes
  async headers() {
    return [{
      source: '/api/(.*)',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://hellolumira.app' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ]
    }, {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self'",
            "img-src 'self' data: blob: https://*.supabase.co https://hellolumira.app https://lh3.googleusercontent.com",
            "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.resend.com wss://*.supabase.co https://accounts.google.com https://www.googleapis.com",
            "frame-src https://accounts.google.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self' https://accounts.google.com",
          ].join('; ')
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'off' },
      ]
    }]
  },

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/ssr'],
  },
};

export default nextConfig;
