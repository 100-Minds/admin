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
import { FormErrorMessage } from '../common';
import { useEffect, useState } from 'react';
import { EyeOff, EyeClosed } from 'lucide-react';
import OtpVerification from './OtpVerification';

const Login = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [loginData, setLoginData] = useState<LoginType | null>(null);
	const [showOtpScreen, setShowOtpScreen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const { user } = useSession((state) => state);

	useEffect(() => {
		if (user) {
			router.replace('/dashboard');
		}
	}, [user, router]);

	const {
		//user,
		actions: { updateUser },
	} = useSession((state) => state);

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
			const { data: responseData, error } = await callApi<ApiResponse<SessionData>>('/auth/admin/sign-in', {
				email: data.email,
				password: data.password,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				setLoginData(data);
				setShowOtpScreen(true);
				toast.info('OTP required', { description: 'Enter the OTP sent to your email.' });
				return;
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

	const handleOtpSuccess = (user: SessionData[number]) => {
		updateUser({ user });
		router.push('/dashboard');
	};

	return (
		<>
			{showOtpScreen && loginData ? (
				<OtpVerification loginData={loginData} onSuccess={handleOtpSuccess} />
			) : (
				<AuthLayout heading="Welcome back!" greeting="Sign in to continue" withHeader={true} hasSuccess={false}>
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
									className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
										errors.email && 'border-red-500 ring-2 ring-red-500'
									}`}
								/>
								{errors.email && <FormErrorMessage error={errors.email} errorMsg={errors.email.message} />}
							</div>
							<div>
								<label htmlFor="password" className="text-sm font-medium text-gray-700">
									Password <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<Input
										{...register('password')}
										type={showPassword ? 'text' : 'password'}
										id="password"
										aria-label="Password"
										placeholder="Password"
										className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
											errors.password && 'border-red-500 ring-2 ring-red-500'
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer"
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
									</button>
								</div>
								{errors.password && <FormErrorMessage error={errors.password} errorMsg={errors.password.message} />}
							</div>
							<Button
								type="submit"
								disabled={isSubmitting || isLoading}
								variant="default"
								className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
							>
								{isSubmitting || isLoading ? 'Signing in...' : 'Login'}
							</Button>
							<div className="flex justify-between items-center">
								<div></div>
								<Link href="/forgot-password" className="text-xs font-semibold text-[#509999] hover:underline">
									Forgot Password?
								</Link>
							</div>
						</form>
					</div>
				</AuthLayout>
			)}
		</>
	);
};

export default Login;

Login.protect = true;
