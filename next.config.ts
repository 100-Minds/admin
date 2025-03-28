import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	experimental: {
		scrollRestoration: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'picsum.photos',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
