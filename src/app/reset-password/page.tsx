import ResetPassword from '@/components/auth/ResetPassword';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Reset Password - 100 Minds',
		content: 'Reset your password! Follow the instructions on this page to set a new password.',
		url: 'https://admin-mmyv.onrender.com/reset-password',
	});
};

export default function ForgotPassword() {
	return (
		<div className="flex h-screen items-center justify-center">
			<ResetPassword />
		</div>
	);
}
