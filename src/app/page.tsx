'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/store';
import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
	const { user } = useSession((state) => state);
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.replace('/dashboard');
		}
	}, [user, router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
