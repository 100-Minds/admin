'use client';

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/store';
// import Image from 'next/image';
import ForgotPasswordPage from './ForgotPassword';

export default function Settings() {
	const { user } = useSession((state) => state);
	if (!user) return null;

	// const truncateText = (text: string, maxLength: number) => {
	// 	if (!text) return '';
	// 	return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
	// };

	return (
		<>
			<div className="flex flex-col w-full space-y-4">
				<ForgotPasswordPage />
			</div>
		</>
	);
}
