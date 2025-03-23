'use client';

import { callApi } from '@/lib';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from '@/store';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { OtpVerificationType, zodValidator } from '@/lib/validators/validateWithZod';
import { ApiResponse } from '@/interfaces';
import { SessionData } from '@/interfaces/ApiResponses';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useState, useEffect } from 'react';

interface OtpVerificationProps {
	loginData: { email: string; password: string };
	onSuccess: (user: SessionData[number]) => void;
}

const OtpVerification = ({ loginData, onSuccess }: OtpVerificationProps) => {
	const [isResending, setIsResending] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const router = useRouter();
	const {
		actions: { updateUser },
	} = useSession((state) => state);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000); // Decrease every second

			return () => clearInterval(timer); // Cleanup on unmount or countdown change
		}
	}, [countdown]);

	const form = useForm<OtpVerificationType>({
		resolver: zodResolver(zodValidator('otpVerification')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const onSubmit: SubmitHandler<OtpVerificationType> = async (data) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<SessionData>>('/auth/admin/sign-in', {
				email: loginData.email,
				password: loginData.password,
				otp: data.otp,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.data) {
				toast.success('OTP Verified!', { description: 'Login successful.' });

				const firstUser = responseData.data[0];
				if (!firstUser) {
					throw new Error('User data not found');
				}

				updateUser({ user: firstUser });
				onSuccess(firstUser);
				router.push('/dashboard');
			}
		} catch (err) {
			toast.error('Verification Failed', {
				description: err instanceof Error ? err.message : 'Invalid OTP',
			});
		}
	};

	const handleResend = async () => {
		if (countdown > 0) return;
		setIsResending(true);
		try {
			const { data: responseData, error } = await callApi<ApiResponse<SessionData>>('/auth/sign-in', {
				email: loginData.email,
				password: loginData.password,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.info('OTP Resent!', {
					description: 'A new OTP has been sent to your email. Kindly check your inbox or spam folder.',
				});
				form.reset();
				setCountdown(60);
			} else {
				throw new Error('Unexpected response from server');
			}
		} catch (err) {
			toast.error('Resend Failed', {
				description: err instanceof Error ? err.message : 'Unable to resend OTP',
			});
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="bg-white !p-6 !py-12 !px-12 rounded-4xl shadow-2xl w-full max-w-md text-center">
				<span className="text-xs rounded-full bg-gray-100 px-4 py-2">Let&apos;s get you started</span>
				<p className="text-gray-600 text-2xl !my-4">Fill in the 6-digit code</p>
				<p className="text-gray-500 text-sm">We sent a code to your email</p>

				{/* OTP Input */}
				<Form {...form}>
					<form className="w-full space-y-4 my-2" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="otp"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<InputOTP maxLength={6} {...field}>
											<InputOTPGroup className="flex justify-center gap-2 !my-4">
												{[...Array(6)].map((_, index) => (
													<InputOTPSlot
														key={index}
														index={index}
														className={`w-12 h-12 text-center text-lg font-semibold outline-none bg-gray-100 focus:ring-2 focus:ring-[#509999]`}
													/>
												))}
											</InputOTPGroup>
										</InputOTP>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
							className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer py-5 text-white font-semibold rounded-lg mt-4"
						>
							{form.formState.isSubmitting ? 'Verifying...' : 'Submit OTP'}
						</Button>
					</form>
				</Form>

				{/* Resend OTP */}
				<div className="!mt-4 text-sm flex justify-center items-center gap-1">
					<p className="text-gray-600">Didn&apos;t get the code?</p>
					<Button
						disabled={isResending || form.formState.isSubmitting || countdown > 0}
						className="border border-gray-200 !px-3 py-1 text-gray-600 bg-white hover:bg-[#509999] hover:cursor-pointer h-[100%] hover:text-white rounded-2xl"
						onClick={handleResend}
					>
						{isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default OtpVerification;
