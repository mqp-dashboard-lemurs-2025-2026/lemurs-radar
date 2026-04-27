import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // These let the frontend call simple paths like "/umass_id".
    // "backend" is the Docker Compose service name.
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
      {
        source: '/clinicians',
        destination: 'http://backend:8000/clinicians',
      },
      {
        source: '/umass_id',
        destination: 'http://backend:8000/umass_id',
      },
      {
        source: '/umass_id/:path*',
        destination: 'http://backend:8000/umass_id/:path*',
      },
      {
        source: '/danger_alert',
        destination: 'http://backend:8000/danger_alert',
      },
      {
        source: '/danger_alert/:path*',
        destination: 'http://backend:8000/danger_alert/:path*',
      },
      {
        source: '/danger_reason/:path*',
        destination: 'http://backend:8000/danger_reason/:path*',
      },
      {
        source: '/health_metrics/:path*',
        destination: 'http://backend:8000/health_metrics/:path*',
      },
      {
        source: '/ccap_scores/:path*',
        destination: 'http://backend:8000/ccap_scores/:path*',
      },
      {
        source: '/past_risk_scores/:path*',
        destination: 'http://backend:8000/past_risk_scores/:path*',
      },
    ];
  },
};

export default nextConfig;
