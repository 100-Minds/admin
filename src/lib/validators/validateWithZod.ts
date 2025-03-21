import {
	type ForgotPasswordProps,
	type LoginProps,
	type ResetPasswordProps,
	type SignUpProps,
	type UpdatePasswordsProps,
	type UpdateProfileProps,
	type OtpVerificationProps,
} from '@/interfaces';
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { z, ZodType } from 'zod';

const options = {
	dictionary: {
		...zxcvbnCommonPackage.dictionary,
		...zxcvbnEnPackage.dictionary,
	},
	translations: {
		...zxcvbnEnPackage.translations,
	},
	graphs: zxcvbnCommonPackage.adjacencyGraphs,
	// useLevenshteinDistance: true
};
zxcvbnOptions.setOptions(options);

export const checkPasswordStrength = (password: string) => zxcvbnAsync(password).then((response) => response.score);

type FormType = 'login' | 'signup' | 'resetPassword' | 'forgotPassword' | 'updateProfile' | 'updatePasswords' | 'otpVerification';

const signUpSchema: z.ZodType<SignUpProps> = z
	.object({
		firstName: z
			.string()
			.min(2, { message: 'First Name is required' })
			.max(50, { message: 'First Name must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			}),
		lastName: z
			.string()
			.min(2, { message: 'Last Name is required' })
			.max(50, { message: 'Last Name must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			}),
		email: z
			.string()
			.min(2, { message: 'Email is required' })
			.email({ message: 'Invalid email address' })
			.regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
				message: 'Enter a valid email',
			})
			.transform((value) => {
				return value.toLowerCase().trim();
			}),
		password: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*\-\]\?])[A-Za-z\d.,!@#$%^&*\-\]\?]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value, ctx) => {
				const options = {
					dictionary: {
						...zxcvbnCommonPackage.dictionary,
						...zxcvbnEnPackage.dictionary,
					},
					translations: {
						...zxcvbnEnPackage.translations,
					},
					graphs: zxcvbnCommonPackage.adjacencyGraphs,
					// useLevenshteinDistance: true
				};
				zxcvbnOptions.setOptions(options);
				const testedResult = zxcvbn(value);

				if (testedResult.score < 3) {
					testedResult.feedback.suggestions.map((issue) => {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: issue,
						});
					});
				}

				return value.trim();
			}),
		confirmPassword: z
			.string()
			.min(6, { message: 'Password must be more than 6 characters' })
			.transform((value) => {
				return value.trim();
			}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

const loginSchema: z.ZodType<LoginProps> = z.object({
	email: z
		.string()

		.min(2, { message: 'Email is required' })
		.regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
			message: 'Enter a valid email',
		})
		.email({ message: 'Invalid email address' })
		.transform((value) => {
			return value.toLowerCase().trim();
		}),
	password: z.string().transform((value) => {
		return value.trim();
	}),
});

const OtpVerificationSchema: z.ZodType<OtpVerificationProps> = z.object({
	otp: z.string().min(6, { message: 'OTP must be 6 characters' }),
});

const forgotPasswordSchema: z.ZodType<ForgotPasswordProps> = z.object({
	email: z
		.string()
		.min(2, { message: 'Email is required' })
		.regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
			message: 'Enter a valid email',
		})
		.email({ message: 'Invalid email address' })
		.transform((value) => {
			return value.toLocaleLowerCase().trim();
		}),
});

const resetPasswordSchema: z.ZodType<ResetPasswordProps> = z
	.object({
		password: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*])[A-Za-z\d.,!@#$%^&*]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value, ctx) => {
				const options = {
					dictionary: {
						...zxcvbnCommonPackage.dictionary,
						...zxcvbnEnPackage.dictionary,
					},
					translations: {
						...zxcvbnEnPackage.translations,
					},
					graphs: zxcvbnCommonPackage.adjacencyGraphs,
					// useLevenshteinDistance: true
				};
				zxcvbnOptions.setOptions(options);
				const testedResult = zxcvbn(value);

				if (testedResult.score < 3) {
					testedResult.feedback.suggestions.map((issue) => {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: issue,
						});
					});
				}

				return value.trim();
			}),
		confirmPassword: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*])[A-Za-z\d.,!@#$%^&*]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value) => {
				return value.trim();
			}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

const updateProfileSchema: z.ZodType<UpdateProfileProps> = z.object({
	firstName: z
		.string()
		.min(2, { message: 'First Name is required' })
		.max(50, { message: 'First Name must be less than 50 characters' })
		.transform((value) => {
			return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
		})
		.optional(),
	lastName: z
		.string()
		.min(2, { message: 'Last Name is required' })
		.max(50, { message: 'Last Name must be less than 50 characters' })
		.transform((value) => {
			return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
		})
		.optional(),
	phoneNumber: z.string().optional(),
});

const updatePassWordsSchema: z.ZodType<UpdatePasswordsProps> = z
	.object({
		oldPassword: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*])[A-Za-z\d.,!@#$%^&*]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value, ctx) => {
				const options = {
					dictionary: {
						...zxcvbnCommonPackage.dictionary,
						...zxcvbnEnPackage.dictionary,
					},
					translations: {
						...zxcvbnEnPackage.translations,
					},
					graphs: zxcvbnCommonPackage.adjacencyGraphs,
				};
				zxcvbnOptions.setOptions(options);
				const testedResult = zxcvbn(value);

				if (testedResult.score < 3) {
					testedResult.feedback.suggestions.map((issue) => {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: issue,
						});
					});
				}

				return value.trim();
			}),
		newPassword: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*])[A-Za-z\d.,!@#$%^&*]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value, ctx) => {
				const options = {
					dictionary: {
						...zxcvbnCommonPackage.dictionary,
						...zxcvbnEnPackage.dictionary,
					},
					translations: {
						...zxcvbnEnPackage.translations,
					},
					graphs: zxcvbnCommonPackage.adjacencyGraphs,
				};
				zxcvbnOptions.setOptions(options);
				const testedResult = zxcvbn(value);

				if (testedResult.score < 3) {
					testedResult.feedback.suggestions.map((issue) => {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: issue,
						});
					});
				}

				return value.trim();
			}),
		confirmPassword: z
			.string()
			.min(8, { message: 'Password must have at least 8 characters!' })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*])[A-Za-z\d.,!@#$%^&*]{6,}$/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			})
			.max(50)
			.transform((value) => {
				return value.trim();
			}),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword'],
	});

// export const zodValidator = (formType: FormType) => {
// 	switch (formType) {
// 		case 'signup':
// 			return signUpSchema;
// 		case 'login':
// 			return loginSchema;
// 		case 'forgotPassword':
// 			return forgotPasswordSchema;
// 		case 'resetPassword':
// 			return resetPasswordSchema;
// 		case 'updateProfile':
// 			return updateProfileSchema;
// 		case 'updatePasswords':
// 			return updatePassWordsSchema;
// 		default:
// 			return;
// 	}
// };

export const zodValidator = <T extends FormType>(
	type: T
): ZodType<
	T extends 'login'
		? LoginProps
		: T extends 'signup'
			? SignUpProps
			: T extends 'resetPassword'
				? ResetPasswordProps
				: T extends 'forgotPassword'
					? ForgotPasswordProps
					: T extends 'updateProfile'
						? UpdateProfileProps
						: T extends 'otpVerification'
							? OtpVerificationProps
							: UpdatePasswordsProps
> => {
	const schemaMap = {
		login: loginSchema,
		signup: signUpSchema,
		resetPassword: resetPasswordSchema,
		forgotPassword: forgotPasswordSchema,
		updateProfile: updateProfileSchema,
		updatePasswords: updatePassWordsSchema,
		otpVerification: OtpVerificationSchema,
	};

	return schemaMap[type] as ZodType<
		T extends 'login'
			? LoginProps
			: T extends 'signup'
				? SignUpProps
				: T extends 'resetPassword'
					? ResetPasswordProps
					: T extends 'forgotPassword'
						? ForgotPasswordProps
						: T extends 'updateProfile'
							? UpdateProfileProps
							: T extends 'otpVerification'
								? OtpVerificationProps
								: UpdatePasswordsProps
	>; // TypeScript needs this assertion to match the conditional type
};

export type SignUpType = z.infer<typeof signUpSchema>;
export type LoginType = z.infer<typeof loginSchema>;
export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordsType = z.infer<typeof updatePassWordsSchema>;
export type OtpVerificationType = z.infer<typeof OtpVerificationSchema>;
