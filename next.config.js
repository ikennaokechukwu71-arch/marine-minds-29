/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
    },
    {
      protocol: 'https',
      hostname: 'msrhzfetnqiqakpvyrik.supabase.co',
    },
  ],
},
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
}

module.exports = nextConfig