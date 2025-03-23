'use client';

import { Success } from '@/components/common';
import AuthLayout from '@/app/auth/layout';
import Link from 'next/link';
import { Button } from '../ui/button';

const ResetPasswordSuccessPage = () => {
	return (
		<AuthLayout
			title="Success"
			content="You have successfully reset your password!"
			withHeader={false}
			heading=""
			greeting=""
		>
			<Success
				classNames={{
					description: 'text-gray-600 text-sm',
				}}
				description="Password Reset Successful"
			>
				<Button className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded">
					<Link href="/">Sign in to continue</Link>
				</Button>
			</Success>
		</AuthLayout>
	);
};

export default ResetPasswordSuccessPage;
