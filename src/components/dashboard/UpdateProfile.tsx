'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorMessage, VerifiedIcon } from '../common';
import { CameraIcon } from '../common';
import { useSession } from '@/store';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UpdateProfileType, callApi, zodValidator } from '@/lib';
import { ApiResponse } from '@/interfaces';
import { SessionData } from '@/interfaces/ApiResponses';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function UpdateProfile() {
	const {
		user,
		actions: { updateUser },
	} = useSession((state) => state);
	const [profileImage, setProfileImage] = useState(user && user[0].photo);
	const [isLoading, setIsLoading] = useState(false);

	const initialValues = {
		email: user ? user[0].email : '',
		firstName: user ? user[0].firstName : '',
		lastName: user ? user[0].lastName : '',
		username: user ? user[0].username : '',
		photo: undefined,
		bio: user ? user[0].bio : '',
		careerGoals: user ? user[0].careerGoals : '',
		opportunities: user ? user[0].opportunities : '',
		strengths: user ? user[0].strengths : '',
		assessment: user ? user[0].assessment : '',
	};

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<UpdateProfileType>({
		resolver: zodResolver(zodValidator('updateProfile')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: initialValues,
	});

	useEffect(() => {
		if (user && user[0]) {
			setProfileImage(user[0].photo || '');
			reset({
				email: user ? user[0].email : '',
				firstName: user ? user[0].firstName : '',
				lastName: user ? user[0].lastName : '',
				username: user ? user[0].username : '',
				photo: undefined,
				bio: user ? user[0].bio : '',
				careerGoals: user ? user[0].careerGoals : '',
				opportunities: user ? user[0].opportunities : '',
				strengths: user ? user[0].strengths : '',
			});
		}
	}, [user, reset]);

	const formValues = watch();
	const hasChanges = () => {
		const { email, firstName, lastName, username, photo, bio, careerGoals, opportunities, strengths } = formValues;

		const textFieldsChanged =
			(email || '') !== (initialValues.email || '') ||
			(firstName || '') !== (initialValues.firstName || '') ||
			(lastName || '') !== (initialValues.lastName || '') ||
			(username || '') !== (initialValues.username || '') ||
			(bio || '') !== (initialValues.bio || '') ||
			(careerGoals || '') !== (initialValues.careerGoals || '') ||
			(opportunities || '') !== (initialValues.opportunities || '') ||
			(strengths || '') !== (initialValues.strengths || '');
		const photoChanged = photo instanceof File;

		return textFieldsChanged || photoChanged;
	};

	const onSubmit: SubmitHandler<UpdateProfileType> = async (data: UpdateProfileType) => {
		try {
			setIsLoading(true);

			const profileUpdates = {
				email: data.email || undefined,
				firstName: data.firstName || undefined,
				lastName: data.lastName || undefined,
				username: data.username || undefined,
				bio: data.bio || undefined,
				careerGoals: data.careerGoals || undefined,
				opportunities: data.opportunities || undefined,
				strengths: data.strengths || undefined,
			};

			const filteredUpdates = Object.fromEntries(
				Object.entries(profileUpdates).filter(([, value]) => value !== undefined && value !== '')
			);

			let profileUpdated = false;
			let photoUpdated = false;

			if (Object.keys(filteredUpdates).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<SessionData>>(
					'/user/update-user',
					filteredUpdates
				);

				if (error) {
					throw new Error(error.message);
				}

				if (responseData?.status === 'success') {
					toast.success('Profile Updated', { description: 'Your profile has been updated successfully.' });
					profileUpdated = true;
				}

				if (responseData?.data) {
					updateUser({ user: responseData.data[0] });
				}
			}

			if (data.photo instanceof File) {
				const photoFormData = new FormData();
				photoFormData.append('photo', data.photo);

				const { data: photoResponse, error: photoError } = await callApi<ApiResponse<SessionData>>(
					'/user/upload-profile-picture',
					photoFormData
				);

				if (photoError) {
					throw new Error(photoError.message);
				}

				if (photoResponse?.status === 'success') {
					toast.success('Profile Photo Updated', { description: 'Your profile photo has been updated successfully.' });
					photoUpdated = true;
				}

				if (photoResponse?.data) {
					updateUser({ user: photoResponse.data[0] });
					setProfileImage(photoResponse.data[0].photo ?? profileImage);
				}
			}

			if (profileUpdated || photoUpdated) {
				reset();
			}
		} catch (err) {
			toast.error('Profile Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setProfileImage(imageUrl);
			setValue('photo', file, { shouldValidate: true });
		} else {
			setProfileImage(user && user[0].photo);
			setValue('photo', undefined, { shouldValidate: true });
		}
	};

	return (
		<div className="max-w-lg mx-auto p-6 rounded-xl overflow-auto max-h-[75vh] scrollbar-hide">
			<h2 className="text-center text-xl font-semibold mb-4">Update Profile</h2>
			<p className="text-center text-sm text-gray-500 mb-6">Update your profile information and photo below.</p>

			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative flex justify-center mt-4">
					<label htmlFor="profileUpload" className="relative cursor-pointer">
						{user && user[0]?.accountType === 'organization' && (
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="absolute -top-0 right-1 bg-blue-400 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
										<VerifiedIcon className="h-6 w-6" />
									</span>
								</TooltipTrigger>
								<TooltipContent side="top" className="">
									<p>{user && user[0].organizationName}</p>
								</TooltipContent>
							</Tooltip>
						)}
						<Avatar className="w-24 h-24 border">
							<AvatarImage src={profileImage || ''} className="object-cover w-full h-full" />
							<AvatarFallback>
								<Image src="/icons/Frame 7.svg" alt="Fallback Icon" width={100} height={100} />
							</AvatarFallback>
						</Avatar>
						<span className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1 rounded-full">
							<CameraIcon className="text-black w-5 h-5" />
						</span>
					</label>
					<input
						type="file"
						id="profileUpload"
						accept="image/*"
						{...register('photo', {
							onChange: (e) => handleImageChange(e),
						})}
						className="hidden"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label htmlFor="firstName" className="text-sm font-medium text-gray-700">
							First Name
						</label>
						<Input
							{...register('firstName')}
							type="text"
							autoFocus
							id="firstName"
							aria-label="First Name"
							placeholder="First Name"
							className={`min-h-[45px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.firstName && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.firstName && <FormErrorMessage error={errors.firstName} errorMsg={errors.firstName.message} />}
					</div>

					<div>
						<label htmlFor="lastName" className="text-sm font-medium text-gray-700">
							Last Name
						</label>
						<Input
							{...register('lastName')}
							type="text"
							id="lastName"
							aria-label="Last Name"
							placeholder="Last Name"
							className={`min-h-[45px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.lastName && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.lastName && <FormErrorMessage error={errors.lastName} errorMsg={errors.lastName.message} />}
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label htmlFor="username" className="text-sm font-medium text-gray-700">
							User Name
						</label>
						<Input
							{...register('username')}
							type="text"
							id="username"
							aria-label="User Name"
							placeholder="User Name"
							className={`min-h-[45px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.username && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.username && <FormErrorMessage error={errors.username} errorMsg={errors.username.message} />}
					</div>

					<div>
						<label htmlFor="email" className="text-sm font-medium text-gray-700">
							Email
						</label>
						<Input
							{...register('email')}
							type="email"
							id="email"
							aria-label="Email"
							placeholder="Email Address"
							className={`min-h-[45px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.email && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.email && <FormErrorMessage error={errors.email} errorMsg={errors.email.message} />}
					</div>
				</div>

				{user && user[0]?.accountType === 'organization' && (
					<div className="grid grid-cols-1 gap-4">
						<div>
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Bio
							</label>
							<Textarea
								{...register('bio')}
								id="bio"
								aria-label="Bio"
								placeholder="Bio"
								className={`min-h-[70px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
									errors.bio ? 'border-red-500 ring-2 ring-red-500' : ''
								}`}
							/>
							{errors.bio && <FormErrorMessage error={errors.bio} errorMsg={errors.bio.message} />}
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Career Goals
						</label>
						<Textarea
							{...register('careerGoals')}
							id="careerGoals"
							aria-label="Your career Goals"
							placeholder="Your career Goals"
							className={`min-h-[70px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.careerGoals ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.careerGoals && (
							<FormErrorMessage error={errors.careerGoals} errorMsg={errors.careerGoals.message} />
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Opportunities
						</label>
						<Textarea
							{...register('opportunities')}
							id="opportunities"
							aria-label="Opportunities you would want to work on"
							placeholder="Opportunities you would want to work on"
							className={`min-h-[70px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.opportunities ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.opportunities && (
							<FormErrorMessage error={errors.opportunities} errorMsg={errors.opportunities.message} />
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Strengths
						</label>
						<Textarea
							{...register('strengths')}
							id="strengths"
							aria-label="strengths"
							placeholder="Your strengths"
							className={`min-h-[70px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.strengths ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.strengths && <FormErrorMessage error={errors.strengths} errorMsg={errors.strengths.message} />}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Assessment link
						</label>
						<Input
							autoFocus
							id="assessment"
							aria-label="assessment"
							placeholder="Your Assessment link"
							disabled
							className={`min-h-[45px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.strengths ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isSubmitting || isLoading || !hasChanges()}
					variant="default"
					className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
				>
					{isSubmitting || isLoading ? 'Saving...' : 'Save Changes'}
				</Button>
			</form>
		</div>
	);
}
