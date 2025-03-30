'use client';

import { FormErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/app/auth/layout';
import { type ForgotPasswordType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiResponse } from '@/interfaces';

const ForgotPasswordPage = () => {
	const router = useRouter();

	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordType>({
		resolver: zodResolver(zodValidator('forgotPassword')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const onSubmit = async (data: ForgotPasswordType) => {
		const { data: responseData, error } = await callApi<ApiResponse>('/auth/password/forgot', {
			email: data.email.trim(),
		});

		if (error) {
			toast.error('Error', {
				description: error.message,
			});
		} else {
			toast.success('Success', {
				description: responseData?.message || 'Password reset link sent to your email.',
			});
			reset();
			router.push(`/forgot-password/sent?email=${encodeURIComponent(data.email.toLowerCase())}`);
		}
	};

	return (
		<AuthLayout
			heading="Forgot Password"
			greeting="Reset your password. Follow the instructions on this page to get your account back!"
			withHeader
			hasSuccess={false}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 md:gap-6 w-full">
				<div className="mt-2">
					<div className="space-y-1">
						<label htmlFor="email" className="text-sm font-medium text-gray-700">
							Email Address <span className="text-red-500">*</span>
						</label>
						<Input
							{...register('email')}
							autoFocus
							type="email"
							id="email"
							placeholder="Enter your email address"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.email && ' border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.email?.message && <FormErrorMessage error={errors} errorMsg={errors.email.message} />}
					</div>
				</div>
				<div className="flex flex-col gap-4 text-center">
					<Button
						disabled={isSubmitting}
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						variant="default"
					>
						Submit
					</Button>
				</div>

				<div className="flex justify-between items-center">
					<div></div>
					<Link href="/" className="text-xs font-semibold text-[#509999] hover:underline">
						Back to sign in page
					</Link>
				</div>
			</form>
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
