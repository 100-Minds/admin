'use client';

import { FormErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiResponse } from '@/interfaces';
import AuthLayout from '@/app/auth/layout';
import { type ResetPasswordType, callApi, checkPasswordStrength, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeOff, EyeClosed } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
	const router = useRouter();
	const [token, setToken] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const queryToken = new URLSearchParams(window.location.search).get('token');
		setToken(queryToken);
	}, []);

	const {
		handleSubmit,
		register,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordType>({
		resolver: zodResolver(zodValidator('resetPassword')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const password = watch('password', '');
	const [passwordStrength, setPasswordStrength] = useState<number>(0);
	const deferredPassword = useDeferredValue(password);

	useEffect(() => {
		const checkStrength = async () => {
			if (deferredPassword) {
				const strength = await checkPasswordStrength(deferredPassword);
				setPasswordStrength(strength);
			}
		};
		checkStrength().catch(() => {
			// Silently ignore errors (e.g., if checkPasswordStrength fails)
		});
	}, [deferredPassword]);

	const onSubmit = async (data: ResetPasswordType) => {
		if (!token) {
			toast.error('Request Failed', {
				description: 'No reset token provided. Please use the link from your email.',
			});
			return;
		}

		const { data: responseData, error } = await callApi<ApiResponse>('/auth/password/reset', {
			token,
			password: data.password,
			confirmPassword: data.confirmPassword,
		});

		if (error) {
			toast.error('Error', {
				description: error.message,
				duration: 3000,
			});
		} else {
			toast.success('Success', {
				description: responseData?.message || 'Password reset successful!',
			});
			router.push('/reset-password/success');
		}
	};

	return (
		<AuthLayout
			heading="Reset Password"
			greeting="Reset your password! Follow the instructions on this page to set a new password."
			withHeader
			hasSuccess={false}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
				<div className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-1">
							<label htmlFor="password" className="text-sm font-medium text-gray-700">
								New Password <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Input
									{...register('password')}
									className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
										errors.password && 'border-red-500 ring-2 ring-red-500'
									}`}
									placeholder="Create a new password"
									type={showPassword ? 'text' : 'password'}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
								</button>
							</div>
							{password.length > 0 && <FormErrorMessage isForPasswordStrength result={passwordStrength} />}
							{errors.password?.message && <FormErrorMessage error={errors} errorMsg={errors.password.message} />}
						</div>

						<div className="space-y-1">
							<label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
								Confirm Password <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Input
									{...register('confirmPassword')}
									className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
										errors.confirmPassword && 'ring-2 border-red-500 ring-red-500'
									}`}
									placeholder="Re-enter password"
									type={showConfirmPassword ? 'text' : 'password'}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer"
								>
									{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
								</button>
							</div>
							{errors.confirmPassword?.message && (
								<FormErrorMessage error={errors} errorMsg={errors.confirmPassword.message} />
							)}
						</div>
					</div>
				</div>
				<Button
					disabled={isSubmitting}
					className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded mt-6"
					variant="default"
				>
					Submit
				</Button>
			</form>
		</AuthLayout>
	);
};

export default ResetPassword;
