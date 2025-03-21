import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	output: 'export',
	reactStrictMode: true,
	experimental: {
		scrollRestoration: true,
	},
};

export default nextConfig;
