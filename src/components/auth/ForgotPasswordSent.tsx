'use client';

import { Success } from '@/components/common';
import AuthLayout from '@/app/auth/layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ForgotPasswordSent() {
	const [email, setEmail] = useState<string | null>(null);

	useEffect(() => {
		const queryEmail = new URLSearchParams(window.location.search).get('email');
		setEmail(queryEmail);
	}, []);

	return (
		<AuthLayout
			title="Password Reset Email Sent"
			content={`We’ve sent a password reset link to ${email || 'your email'}.`}
			withHeader={false}
			hasSuccess={false}
			heading=""
			greeting=""
		>
			<Success
				classNames={{
					description: 'text-gray-600 text-sm',
				}}
				description={`We’ve sent a password reset link to ${email || 'your email'}. Please check your inbox or spam folder.`}
			>
				<div className="flex justify-between items-center ">
					<p className="text-xs text-gray-500">
						Didn’t receive the email?{' '}
						<Link href="/forgot-password" className="text-[#509999] hover:underline">
							Try again
						</Link>
					</p>
					<Link href="/" className="text-xs font-semibold text-[#509999] hover:underline">
						Back to sign in
					</Link>
				</div>
			</Success>
		</AuthLayout>
	);
}
