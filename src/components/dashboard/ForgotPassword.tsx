'use client';

import { FormErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type ForgotPasswordType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Success } from '@/components/common';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiResponse } from '@/interfaces';
import { useSession } from '@/store';
import { useState } from 'react';

const ForgotPasswordPage = () => {
	const { user } = useSession((state) => state);
	const [sent, setSent] = useState<boolean>(false);

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
		setSent(false);
		const { data: responseData, error } = await callApi<ApiResponse>('/auth/password/forgot', {
			email: data.email,
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
			setSent(true);
		}
	};

	return (
		<>
			{sent ? (
				<Success
					classNames={{
						description: 'text-gray-600 text-sm',
						wrapper: 'bg-[#F8F8F8] pt-0',
					}}
					description={`We’ve sent a password reset link to ${user ? user[0].email : 'your email'}. Please check your inbox or spam folder.`}
				>
					<div className="flex justify-between items-center ">
						<p className="text-xs text-gray-500">
							Didn’t receive the email?{' '}
							<Link href="/settings" className="text-[#509999] hover:underline" onClick={() => setSent(false)}>
								Try again
							</Link>
						</p>
						<Link
							href="/settings"
							className="text-xs font-semibold text-[#509999] hover:underline"
							onClick={() => setSent(false)}
						>
							Back
						</Link>
					</div>
				</Success>
			) : (
				<div className="flex flex-col w-full">
					<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
						<div className="flex flex-col items-center space-y-2">
							<h2 className="text-center text-xl font-semibold text-gray-900">Change Password</h2>
							<p className="text-sm text-gray-600 text-center">
								A password reset link will be sent to the email address below!
							</p>
						</div>
						<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 md:gap-6 w-full">
							<div className="mt-2">
								<div className="space-y-1">
									<label htmlFor="email" className="text-sm font-medium text-gray-700">
										Email Address <span className="text-red-500">*</span>
									</label>
									<Input
										{...register('email')}
										defaultValue={user ? user[0].email : ''}
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
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default ForgotPasswordPage;
