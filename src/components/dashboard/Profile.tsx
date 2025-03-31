'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSession } from '@/store';
import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UpdateProfileType, callApi, zodValidator } from '@/lib';
import { ApiResponse } from '@/interfaces';
import { SessionData } from '@/interfaces/ApiResponses';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CameraIcon } from '../common';

export default function Profile() {
	const { user } = useSession((state) => state);
	const [profileImage, setProfileImage] = useState(user && user[0].photo);
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const {
		//user,
		actions: { updateUser },
	} = useSession((state) => state);

	const initialValues = {
		email: user ? user[0].email : '',
		firstName: user ? user[0].firstName : '',
		lastName: user ? user[0].lastName : '',
		username: user ? user[0].username : '',
		photo: undefined,
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

	const formValues = watch();
	const hasChanges = () => {
		const { email, firstName, lastName, username, photo } = formValues;

		const textFieldsChanged =
			(email || '') !== (initialValues.email || '') ||
			(firstName || '') !== (initialValues.firstName || '') ||
			(lastName || '') !== (initialValues.lastName || '') ||
			(username || '') !== (initialValues.username || '');

		const photoChanged = photo instanceof File;

		return textFieldsChanged || photoChanged;
	};

	const truncateText = (text: string, maxLength: number) => {
		if (!text) return '';
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
	};

	const onSubmit: SubmitHandler<UpdateProfileType> = async (data: UpdateProfileType) => {
		try {
			setIsLoading(true);

			const profileUpdates = {
				email: data.email || undefined,
				firstName: data.firstName || undefined,
				lastName: data.lastName || undefined,
				username: data.username || undefined,
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
			} else {
				console.log('No profile fields to update');
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
				setIsDialogOpen(false);
			}
		} catch (err) {
			toast.error('Profile Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	// const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	if (e.target.files && e.target.files.length > 0) {
	// 		const file = e.target.files[0];
	// 		const imageUrl = URL.createObjectURL(file);
	// 		setProfileImage(imageUrl);
	// 		setValue('photo', file);
	// 	}
	// };

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log('Event in handleImageChange:', e);
		const files = e.target.files;
		console.log('Files:', files);

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
		<div className="mt-auto">
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger className="w-full" onClick={() => setIsDialogOpen(true)}>
					<div className="flex items-center gap-2 p-2 rounded-xl bg-white cursor-pointer">
						<Avatar>
							<AvatarImage src={profileImage || ''} />
							<AvatarFallback>
								<Image src="/icons/Frame 7.svg" alt="Fallback Icon" width={100} height={100} />
							</AvatarFallback>
						</Avatar>
						<div className="hidden mds:flex flex-col">
							<span className="text-sm font-semibold">{`${truncateText(`${user && user[0].firstName} ${user && user[0].lastName}`, 15)}`}</span>
							<span className="text-[12px] text-gray-400">{truncateText((user && user[0].email) || '', 20)}</span>
						</div>
					</div>
				</DialogTrigger>
				<DialogContent className="max-w-lg rounded-xl p-6">
					<DialogTitle className="text-center text-xl font-semibold">Profile Info</DialogTitle>
					<DialogDescription className="text-center text-sm text-gray-500">
						Update your profile information and photo below.
					</DialogDescription>

					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div className="relative flex justify-center mt-4">
							<label htmlFor="profileUpload" className="relative cursor-pointer">
								<Avatar className="w-24 h-24 border">
									<AvatarImage src={profileImage || ''} />
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

						<Button
							type="submit"
							disabled={isSubmitting || isLoading || !hasChanges()}
							variant="default"
							className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						>
							{isSubmitting || isLoading ? 'Saving...' : 'Save Changes'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}