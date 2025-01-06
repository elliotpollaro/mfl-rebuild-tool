/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/get_my_assets',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/get_my_assets`,
      },
      {
        source: '/get_available_assets',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/get_available_assets`,
      },
      {
        source: '/submit_trade',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/submit_trade`,
      },
    ]
  },
}

module.exports = nextConfig 