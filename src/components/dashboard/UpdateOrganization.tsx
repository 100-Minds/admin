'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormErrorMessage, VerifiedIcon } from '../common';
import { CameraIcon } from '../common';
import { useSession } from '@/store';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UpdateOrganizationType, callApi, zodValidator } from '@/lib';
import { ApiResponse } from '@/interfaces';
import { SessionData } from '@/interfaces/ApiResponses';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function UpdateOrganization() {
	const {
		user,
		actions: { updateUser },
	} = useSession((state) => state);
	const [logoImage, setLogoImage] = useState(user && user[0].organizationLogo);
	const [isLoading, setIsLoading] = useState(false);

	const initialValues = {
		organizationName: user ? user[0].organizationName : '',
		organizationDescription: user ? user[0].organizationDescription : '',
		organizationWebsite: user ? user[0].organizationWebsite : '',
		organizationLogo: undefined,
	};

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<UpdateOrganizationType>({
		resolver: zodResolver(zodValidator('updateOrganization')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: initialValues,
	});

	useEffect(() => {
		if (user && user[0]) {
			setLogoImage(user[0].organizationLogo || '');
			reset({
				organizationName: user[0].organizationName || '',
				organizationDescription: user[0].organizationDescription || '',
				organizationWebsite: user[0].organizationWebsite || '',
				organizationLogo: undefined,
			});
		}
	}, [user, reset]);

	const formValues = watch();
	const hasChanges = () => {
		const { organizationName, organizationDescription, organizationWebsite, organizationLogo } = formValues;

		const textFieldsChanged =
			(organizationName || '') !== (initialValues.organizationName || '') ||
			(organizationDescription || '') !== (initialValues.organizationDescription || '') ||
			(organizationWebsite || '') !== (initialValues.organizationWebsite || '');
		const logoChanged = organizationLogo instanceof File;

		return textFieldsChanged || logoChanged;
	};

	const onSubmit: SubmitHandler<UpdateOrganizationType> = async (data: UpdateOrganizationType) => {
		try {
			setIsLoading(true);

			const profileUpdates = {
				organizationName: data.organizationName || undefined,
				organizationDescription: data.organizationDescription || undefined,
				organizationWebsite: data.organizationWebsite || undefined,
			};

			const filteredUpdates = Object.fromEntries(
				Object.entries(profileUpdates).filter(([, value]) => value !== undefined && value !== '')
			);

			let profileUpdated = false;
			let photoUpdated = false;

			if (Object.keys(filteredUpdates).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<SessionData>>(
					'/user/update-organization',
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

			if (data.organizationLogo instanceof File) {
				const photoFormData = new FormData();
				photoFormData.append('organizationLogo', data.organizationLogo);

				const { data: photoResponse, error: photoError } = await callApi<ApiResponse<SessionData>>(
					'/user/update-organization',
					photoFormData
				);

				if (photoError) {
					throw new Error(photoError.message);
				}

				if (photoResponse?.status === 'success') {
					toast.success('Profile Updated', { description: 'Your profile has been updated successfully..' });
					photoUpdated = true;
				}

				if (photoResponse?.data) {
					updateUser({ user: photoResponse.data[0] });
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
			setLogoImage(imageUrl);
			setValue('organizationLogo', file, { shouldValidate: true });
		} else {
			setLogoImage(user && user[0].organizationLogo);
			setValue('organizationLogo', undefined, { shouldValidate: true });
		}
	};

	return (
		<div className="max-w-lg mx-auto p-6 rounded-xl overflow-auto max-h-[75vh] scrollbar-hide">
			<h2 className="text-center text-xl font-semibold mb-4">Update Organization Profile</h2>
			<p className="text-center text-sm text-gray-500 mb-6">
				Update your organization profile information and logo below.
			</p>

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
							<AvatarImage src={logoImage || ''} className="object-cover w-full h-full" />
							<AvatarFallback>ORG</AvatarFallback>
						</Avatar>
						<span className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1 rounded-full">
							<CameraIcon className="text-black w-5 h-5" />
						</span>
					</label>
					<input
						type="file"
						id="profileUpload"
						accept="image/*"
						{...register('organizationLogo', {
							onChange: (e) => handleImageChange(e),
						})}
						className="hidden"
					/>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Name
						</label>
						<Input
							{...register('organizationName')}
							id="organizationName"
							aria-label="Organization Name"
							placeholder="Organization Name"
							className={`min-h-[45px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.organizationName ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.organizationName && (
							<FormErrorMessage error={errors.organizationName} errorMsg={errors.organizationName.message} />
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Description
						</label>
						<Input
							{...register('organizationDescription')}
							id="organizationDescription"
							aria-label="Organization Description"
							placeholder="Organization Description"
							className={`min-h-[45px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.organizationDescription ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.organizationDescription && (
							<FormErrorMessage
								error={errors.organizationDescription}
								errorMsg={errors.organizationDescription.message}
							/>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<label htmlFor="name" className="text-sm font-medium text-gray-700">
							Website
						</label>
						<Input
							{...register('organizationWebsite')}
							id="organizationWebsite"
							aria-label="Organization Website"
							placeholder="Organization Website"
							className={`min-h-[45px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
								errors.organizationWebsite ? 'border-red-500 ring-2 ring-red-500' : ''
							}`}
						/>
						{errors.organizationWebsite && (
							<FormErrorMessage error={errors.organizationWebsite} errorMsg={errors.organizationWebsite.message} />
						)}
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
