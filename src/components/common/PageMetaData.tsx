import type { Metadata } from 'next';

interface MetaDataProps {
	title: string;
	content: string;
	image?: string;
	url?: string;
}

export function generatePageMetadata({ title, content, image, url }: MetaDataProps): Metadata {
	const defaultImage = '/public/LOGO.svg';

	return {
		title: `${title}`,
		description: content,
		openGraph: {
			type: 'website',
			siteName: '100 Minds dashboard',
			locale: 'en_US',
			title: `${title}`,
			description: content,
			url: url || 'https://admin-mmyv.onrender.com',
			images: [
				{
					url: image || defaultImage,
					width: 1200,
					height: 630,
					alt: `${title} - 100 Minds`,
				},
			],
		},
		twitter: {
			card: image || defaultImage ? 'summary_large_image' : 'summary',
			title: `${title}`,
			description: content,
			images: [
				{
					url: image || defaultImage,
					width: 1200,
					height: 630,
					alt: `${title} - 100 Minds`,
				},
			],
		},
		other: {
			'og:locale': 'en_US',
		},
	};
}

// // Optional: If you still want to use PageMetaData as a component (not recommended)
// export default function PageMetaData({ title, content, image, url }: MetaDataProps) {
// 	return null; // No rendering in App Router; use generateMetadata instead
// }
