'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ApiResponse } from '@/interfaces';
import type { SessionData } from '@/interfaces/ApiResponses';
import { type LoginType, callApi, zodValidator } from '@/lib';
import { useSession } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AuthLayout from '@/app/auth/layout';
import { FormErrorMessage } from './common';
import { useState } from 'react';
import { NextSeo } from 'next-seo';

const Login = () => {
	const router = useRouter();
	const {
		//user,
		actions: { updateUser },
	} = useSession((state) => state);

	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<LoginType>({
		resolver: zodResolver(zodValidator('login')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const onSubmit: SubmitHandler<LoginType> = async (data: LoginType) => {
		try {
			setIsLoading(true);
			const { data: responseData, error } = await callApi<ApiResponse<SessionData>>('/auth/sign-in', {
				email: data.email,
				password: data.password,
			});

			if (error) {
				throw new Error(error.message);
			}

			toast.success('Success', {
				description: responseData?.message,
			});

			if (responseData?.data) {
				const { user } = responseData.data;
				updateUser(user);
				router.push('/dashboard');
			}
		} catch (err) {
			toast.error('Login Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	return (
		<>
			<NextSeo
				canonical="https://www.admin.100minds"
				openGraph={{
					url: 'https://www.admin.100minds',
					title: 'Sign in to your account!',
					description: 'Sign in to your admin account to continue using 100 Minds!',
					images: [
						{
							url: 'https://static.100minds/assets/sign-in.png',
							width: 800,
							height: 600,
						},
					],
				}}
				twitter={{ cardType: 'summary_large_image' }}
			/>
			<AuthLayout
				title="Sign in to your account"
				content="Sign in to your account to continue using 100 Minds!"
				heading="Welcome back!"
				greeting="Sign in to continue"
				withHeader={false} // Set to false since the image doesn't show the header
				hasSuccess={false}
			>
				<div className="w-full max-w-md space-y-6">
					{/* "Sign in" text */}
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">Sign in</h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="email" className="text-sm font-medium text-gray-700">
								Email Address <span className="text-red-500">*</span>
							</label>
							<Input
								{...register('email')}
								autoFocus
								type="email"
								id="email"
								aria-label="Email address"
								placeholder="Email Address"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
									errors.email && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.email && <FormErrorMessage error={errors.email} errorMsg={errors.email.message} />}
						</div>
						<div>
							<label htmlFor="password" className="text-sm font-medium text-gray-700">
								Password <span className="text-red-500">*</span>
							</label>
							<Input
								{...register('password')}
								type="password"
								id="password"
								aria-label="Password"
								placeholder="Password"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
									errors.password && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.password && <FormErrorMessage error={errors.password} errorMsg={errors.password.message} />}
						</div>
						<Button
							type="submit"
							disabled={isSubmitting || isLoading}
							variant="default"
							className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-2 rounded"
						>
							{isSubmitting || isLoading ? 'Signing in...' : 'Login'}
						</Button>
						<div className="flex justify-between items-center">
							<Link href="/forgot-password" className="text-sm font-semibold text-[#509999] hover:underline">
								Forgot Password?
							</Link>
							<p className="text-sm text-gray-600">
								Don&apos;t have an account?{' '}
								<Link href="/signup" className="font-medium text-[#509999] hover:underline">
									Sign up
								</Link>
							</p>
						</div>
					</form>
				</div>
			</AuthLayout>
		</>
	);
};

export default Login;

Login.protect = true;
