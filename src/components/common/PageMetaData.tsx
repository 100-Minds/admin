import type { Metadata } from 'next';

interface MetaDataProps {
	title: string;
	content: string;
	image?: string;
	url?: string;
}

export function generatePageMetadata({ title, content, image, url }: MetaDataProps): Metadata {
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
			images: image ? [image] : [],
		},
		twitter: {
			card: image ? 'summary_large_image' : 'summary',
			title: `${title}`,
			description: content,
			images: image ? [image] : [],
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
