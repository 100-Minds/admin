import ResetPasswordSuccessPage from '@/components/auth/ResetPasswordSuccess';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Success - 100 Minds',
		content: 'You have successfully reset your password!.',
		url: 'https://admin-mmyv.onrender.com/reset-password/success',
	});
};

export default function ForgotPassword() {
	return (
		<div className="flex h-screen items-center justify-center">
			<ResetPasswordSuccessPage />
		</div>
	);
}
