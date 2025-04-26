import {
	type ForgotPasswordProps,
	type LoginProps,
	type ResetPasswordProps,
	type SignUpProps,
	type UpdatePasswordsProps,
	type UpdateProfileProps,
	type OtpVerificationProps,
	type AddPowerSkillProps,
	type AddRolePlayProps,
	type AddModuleProps,
	type AddCourseProps,
	type AddLessonProps,
	type AddJourneyProps,
	type AddTeamProps,
	type AddQuizProps,
	type UpdateOrganizationProps,
} from '@/interfaces';
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { z, ZodType } from 'zod';

const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg', // JPEG
	'image/png', // PNG
	'image/gif', // GIF
	'image/webp', // WebP
	'image/bmp', // BMP
	'image/tiff', // TIFF
	'image/svg+xml', // SVG
	'image/heic', // HEIC (Apple’s format, if supported)
];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB in bytes
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

type FormType =
	| 'login'
	| 'signup'
	| 'resetPassword'
	| 'forgotPassword'
	| 'updateProfile'
	| 'updatePasswords'
	| 'otpVerification'
	| 'powerSkill'
	| 'rolePlay'
	| 'module'
	| 'course'
	| 'lesson'
	| 'journey'
	| 'team'
	| 'quiz'
	| 'updateOrganization';

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
		username: z
			.string()
			.min(3, { message: 'username is required' })
			.max(50, { message: 'username must be less than 50 characters' })
			.trim()
			.toLowerCase(),
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
		role: z.enum(['admin', 'user', 'superuser']),
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

const updateProfileSchema: z.ZodType<UpdateProfileProps> = z
	.object({
		firstName: z
			.string()
			.min(0, { message: 'First Name is required' })
			.max(50, { message: 'First Name must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.optional(),
		lastName: z
			.string()
			.min(0, { message: 'Last Name is required' })
			.max(50, { message: 'Last Name must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.optional(),
		username: z
			.string()
			.min(0, { message: 'username is required' })
			.max(50, { message: 'username must be less than 50 characters' })
			.trim()
			.toLowerCase()
			.optional(),
		email: z
			.string()
			// .email({ message: 'Invalid email address' })
			// .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
			// 	message: 'Enter a valid email',
			// })
			.transform((value) => {
				return value.toLowerCase().trim();
			})
			.optional()
			.nullable(),
		bio: z
			.string()
			.min(7, { message: 'Bio must be at least 7 characters long' })
			.max(250, { message: 'Bio must be less than 250 characters' })
			.transform((value) => {
				return value.trim();
				// return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.nullish()
			.or(z.literal('')),
		careerGoals: z
			.string()
			.min(7, { message: 'Career Goals must be at least 7 characters long' })
			.max(250, { message: 'Career Goals must be less than 250 characters' })
			.transform((value) => {
				return value.trim();
				// return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.nullish()
			.or(z.literal('')),
		opportunities: z
			.string()
			.min(7, { message: 'Opportunities must be at least 7 characters long' })
			.max(250, { message: 'Opportunities must be less than 250 characters' })
			.transform((value) => {
				return value.trim();
				// return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.nullish()
			.or(z.literal('')),
		photo: z
			.any() // Allow File or FileList
			.optional()
			.nullable()
			.refine(
				(file) => {
					// If no file is provided (undefined or null), it's valid (optional)
					if (!file) return true;

					// If file is a FileList (from input), check the first file
					if (file instanceof FileList && file.length === 0) return true; // Empty FileList is valid

					// If file is a single File or the first item in FileList
					const targetFile = file instanceof FileList ? file[0] : file;

					// Check if it's a File (not FileList or other type)
					if (!(targetFile instanceof File)) {
						return false;
					}

					// Validate file type
					const isValidType = ACCEPTED_IMAGE_TYPES.includes(targetFile.type);
					if (!isValidType) {
						return false;
					}

					// Validate file size
					const isValidSize = targetFile.size <= MAX_FILE_SIZE;
					if (!isValidSize) {
						return false;
					}

					return true;
				},
				{
					message:
						'Invalid file. Choose an image (JPEG, PNG, GIF, WebP, BMP, TIFF, or SVG) with a maximum size of 8MB.',
				}
			),
	})
	.partial();

const updateOrganizationSchema: z.ZodType<UpdateOrganizationProps> = z
	.object({
		organizationName: z
			.string()
			.min(3, { message: 'Organization Name must be at least 3 characters long' })
			.max(50, { message: 'Organization Name must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.optional()
			.or(z.literal('')),
		organizationWebsite: z
			.string()
			.min(7, { message: 'Organization Website must be at least 7 characters long' })
			.max(50, { message: 'Organization Website must be less than 50 characters' })
			.transform((value) => {
				return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.optional()
			.or(z.literal('')),
		organizationDescription: z
			.string()
			.min(7, { message: 'Description must be at least 7 characters long' })
			.max(250, { message: 'Description must be less than 250 characters' })
			.transform((value) => {
				return value.trim();
				// return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim();
			})
			.optional()
			.or(z.literal('')),
		organizationLogo: z
			.any() // Allow File or FileList
			.optional()
			.nullable()
			.refine(
				(file) => {
					// If no file is provided (undefined or null), it's valid (optional)
					if (!file) return true;

					// If file is a FileList (from input), check the first file
					if (file instanceof FileList && file.length === 0) return true; // Empty FileList is valid

					// If file is a single File or the first item in FileList
					const targetFile = file instanceof FileList ? file[0] : file;

					// Check if it's a File (not FileList or other type)
					if (!(targetFile instanceof File)) {
						return false;
					}

					// Validate file type
					const isValidType = ACCEPTED_IMAGE_TYPES.includes(targetFile.type);
					if (!isValidType) {
						return false;
					}

					// Validate file size
					const isValidSize = targetFile.size <= MAX_FILE_SIZE;
					if (!isValidSize) {
						return false;
					}

					return true;
				},
				{
					message:
						'Invalid file. Choose an image (JPEG, PNG, GIF, WebP, BMP, TIFF, or SVG) with a maximum size of 8MB.',
				}
			),
	})
	.partial();

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

const addPowerSkillSchema: z.ZodType<AddPowerSkillProps> = z.object({
	skill: z.string().min(3, { message: 'Skill is required' }).trim(),
	category: z.string().min(3, { message: 'Skill category is required' }).trim(),
	skillImage: z
		.instanceof(File, { message: 'A valid video file is required' })
		.refine((file) => file.size <= 10 * 1024 * 1024, {
			message: 'File size must not exceed 10MB',
		}),
});

const addRolePlaySchema: z.ZodType<AddRolePlayProps> = z.object({
	scenario: z
		.string()
		.min(5, { message: 'Scenario must be at least 5 characters long' })
		.max(500, { message: 'Scenario must be less than 500 characters' })
		.trim(),
	scenarioImage: z.instanceof(File, { message: 'Scenario image must be a valid file' }),
});

const addModuleSchema: z.ZodType<AddModuleProps> = z.object({
	name: z
		.string()
		.min(5, { message: 'Module must be at least 5 characters long' })
		.max(500, { message: 'Module must be less than 500 characters' })
		.trim(),
});

const addCourseSchema: z.ZodType<AddCourseProps> = z.object({
	name: z
		.string()
		.min(5, { message: 'Module must be at least 5 characters long' })
		.max(100, { message: 'Module must be less than 100 characters' })
		.trim(),
	courseImage: z.instanceof(File, { message: 'Course image must be a valid file' }),
	moduleId: z.string().uuid({ message: 'Invalid module ID format' }),
	scenario: z
		.array(z.string())
		.min(1, { message: 'At least one scenario is required' })
		.max(100, { message: 'Scenarios must not exceed 100 items' })
		.optional()
		.nullable(),
	skills: z
		.array(z.string())
		.min(1, { message: 'At least one skill is required' })
		.max(15, { message: 'Skills must not exceed 15 items' })
		.optional()
		.nullable(),
	courseResource: z.instanceof(File, { message: 'Course resource must be a valid file' }).optional().nullable(),
	status: z
		.enum(['published', 'draft'], {
			required_error: 'Status is required',
			invalid_type_error: 'Status must be either published or draft',
		})
		.optional()
		.nullable(),
});
const addLessonSchema: z.ZodType<AddLessonProps> = z.object({
	title: z
		.string()
		.min(5, { message: 'Title must be at least 5 characters long' })
		.max(100, { message: 'Title must be less than 100 characters' })
		.trim(),
	description: z
		.string()
		.min(5, { message: 'Description must be at least 5 characters long' })
		.max(100, { message: 'Description must be less than 100 characters' })
		.trim(),
	lessonVideo: z
		.instanceof(File, { message: 'A valid video file is required' })
		.refine((file) => file.size <= 500 * 1024 * 1024, {
			message: 'File size must not exceed 500MB',
		}),
	fileName: z
		.string()
		.min(3, { message: 'File name must be at least 3 characters long' })
		.max(255, { message: 'File name must be less than 255 characters' })
		.trim(),
	fileType: z.string().regex(/^video\/(mp4|mov|avi|wmv|flv|webm)$/, { message: 'Invalid video file type' }),
	fileSize: z
		.number()
		.min(1024, { message: 'File size must be at least 1KB' })
		.max(500 * 1024 * 1024, { message: 'File size must not exceed 500MB' }),
	videoLength: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, { message: 'Invalid video length format (HH:MM:SS)' }),
	chapterResources: z.instanceof(File).optional().nullable(),
	//lessonVideo: z.instanceof(File).nullable(),
});

const addJourneySchema: z.ZodType<AddJourneyProps> = z.object({
	moduleId: z.string().uuid({ message: 'Invalid module ID format' }),
});

const addTeamSchema: z.ZodType<AddTeamProps> = z.object({
	name: z
		.string()
		.min(5, { message: 'Team name must be at least 5 characters long' })
		.max(500, { message: 'Team name must be less than 500 characters' })
		.trim(),
});

const addQuizSchema: z.ZodType<AddQuizProps> = z.object({
	question: z
		.string()
		.min(5, { message: 'Question must be at least 5 characters long' })
		.max(500, { message: 'Question must be less than 500 characters' })
		.trim(),
	optionA: z.string().min(1, { message: 'Option A is required' }).trim(),
	optionB: z.string().min(1, { message: 'Option B is required' }).trim(),
	optionC: z.string().trim().nullable(),
	optionD: z.string().trim().nullable(),
	optionE: z.string().trim().nullable(),
	isCorrect: z
		.array(
			z.enum(['optionA', 'optionB', 'optionC', 'optionD', 'optionE'], {
				required_error: 'A correct option is required',
			})
		)
		.min(1, { message: 'At least one correct option is required' }),
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
							: T extends 'powerSkill'
								? AddPowerSkillProps
								: T extends 'rolePlay'
									? AddRolePlayProps
									: T extends 'module'
										? AddModuleProps
										: T extends 'course'
											? AddCourseProps
											: T extends 'lesson'
												? AddLessonProps
												: T extends 'journey'
													? AddJourneyProps
													: T extends 'team'
														? AddTeamProps
														: T extends 'quiz'
															? AddQuizProps
															: T extends 'updateOrganization'
																? UpdateOrganizationProps
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
		powerSkill: addPowerSkillSchema,
		rolePlay: addRolePlaySchema,
		module: addModuleSchema,
		course: addCourseSchema,
		lesson: addLessonSchema,
		journey: addJourneySchema,
		team: addTeamSchema,
		quiz: addQuizSchema,
		updateOrganization: updateOrganizationSchema,
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
								: T extends 'powerSkill'
									? AddPowerSkillProps
									: T extends 'rolePlay'
										? AddRolePlayProps
										: T extends 'module'
											? AddModuleProps
											: T extends 'course'
												? AddCourseProps
												: T extends 'lesson'
													? AddLessonProps
													: T extends 'journey'
														? AddJourneyProps
														: T extends 'team'
															? AddTeamProps
															: T extends 'quiz'
																? AddQuizProps
																: T extends 'updateOrganization'
																	? UpdateOrganizationProps
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
export type AddPowerSkillType = z.infer<typeof addPowerSkillSchema>;
export type AddRolePlayType = z.infer<typeof addRolePlaySchema>;
export type AddModuleType = z.infer<typeof addModuleSchema>;
export type AddCourseType = z.infer<typeof addCourseSchema>;
export type AddLessonType = z.infer<typeof addLessonSchema>;
export type AddJourneyType = z.infer<typeof addJourneySchema>;
export type AddTeamType = z.infer<typeof addTeamSchema>;
export type AddQuizType = z.infer<typeof addQuizSchema>;
export type UpdateOrganizationType = z.infer<typeof updateOrganizationSchema>;
