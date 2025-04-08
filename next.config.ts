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
				hostname: 'pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
