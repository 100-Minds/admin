import Head from 'next/head';
// import type { ReactNode } from "react";
interface MetaDataProps {
	// children: ReactNode,
	title: string;
	content: string;
	image?: string;
	url?: string;
}

const PageMetaData = ({ title, content, image, url }: MetaDataProps) => {
	return (
		<Head>
			{/* // Primary Meta Tags */}
			<title>{`100 Minds | ${title}`}</title>
			<meta property="og:site_name" content="100 Minds" />
			<meta property="og:locale" content="en_US" />
			<meta name="title" content={`100 Minds | ${title}`} />
			<link rel="canonical" href="http://localhost:3000" />
			<meta name="description" content={content} />
			{/* // Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			{url && <meta property="og:url" content={url} />}
			<meta property="og:title" content={`100 Minds | ${title}`} />
			<meta property="og:description" content={content} />
			{image && <meta property="og:image" content={image} />}
			{/* // Twitter */}
			{image && <meta property="twitter:card" content="summary_large_image" />}
			{image && <meta name="twitter:image:content_type" content="image/png" />}
			{url && <meta property="twitter:url" content={url} />}
			{image && <meta name="twitter:image:width" content="2400" />}
			{image && <meta name="twitter:image:height" content="1256" />}
			{image && <meta name="twitter:image:title" content="100 Minds OG Image" />}
			<meta property="twitter:title" content={`100 Minds | ${title}`} />
			<meta property="twitter:description" content={content} />
			{image && <meta property="twitter:image" content={image} />}
		</Head>
	);
};

export default PageMetaData;
