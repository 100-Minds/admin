import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/components/common/PageMetaData';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Sign in - 100 Minds',
		content: 'Sign in to access 100 Minds admin dashboard',
		url: 'https://admin-mmyv.onrender.com',
	});
};

export default function Home() {
	return (
		<div className="flex h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
