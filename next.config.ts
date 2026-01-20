import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://gstatic.com https://*.gstatic.com;
      style-src 'self' 'unsafe-inline' https://accounts.google.com;
      img-src 'self' data: blob: https://*.googleusercontent.com https://*.gstatic.com;
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} https://accounts.google.com https://*.googleapis.com;
      font-src 'self' data: https://fonts.gstatic.com;
      frame-src https://accounts.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];

const nextConfig: NextConfig = {
  // Silencia warning do Turbopack (Next.js 16+) com configuração webpack do next-pwa
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withPWA(withBundleAnalyzer(nextConfig));
