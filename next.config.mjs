/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.tableboost.app' }],
        destination: 'https://tableboost.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
