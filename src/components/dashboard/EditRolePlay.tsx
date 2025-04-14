'use client';

import { ApiResponse } from '@/interfaces';
import { RolePlay, RolePlayData } from '@/interfaces/ApiResponses';
import { AddRolePlayType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CameraIcon, FormErrorMessage } from '../common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '../ui/input';

export default function RolePlayEdit({ rolePlayId }: { rolePlayId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddRolePlayType>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [scenarioImage, setScenarioImage] = useState<string | null>(null);
	const [scenario, setScenario] = useState<string>('');
	//const [description, setDescription] = useState<string>('');
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddRolePlayType>({
		resolver: zodResolver(zodValidator('rolePlay')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: rolePlay,
		isLoading: loading,
		error: queryError,
	} = useQuery<RolePlay[], Error>({
		queryKey: ['rolePlay', rolePlayId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<RolePlay[]>>(
				`/scenario?scenarioId=${rolePlayId}`
			);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching role play.');
			}
			if (!responseData?.data) {
				throw new Error('Role Play data not returned');
			}
			toast.success('Role Play Fetched', { description: 'Successfully fetched role play.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching role play.';
			setError(errorMessage);
			toast.error('Failed to Fetch Role play', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	useEffect(() => {
		if (rolePlay && rolePlay[0]) {
			if (rolePlay[0].scenario) {
				setScenario(rolePlay[0].scenario);
			}

			if (rolePlay[0].scenarioImage) {
				setScenarioImage(rolePlay[0].scenarioImage);
			}

			// if (rolePlay[0].description) {
			// 	setDescription(rolePlay[0].description);
			// }
		}
	}, [rolePlay]);

	const onEditRoleplay = async (scenarioId: string, updatedData: Partial<AddRolePlayType>) => {
		try {
			setIsLoading(true);

			const isImageUpdated = !!editedData.scenarioImage;
			const dataToSend = {
				scenario: updatedData.scenario,
				//description: updatedData.description,
			};

			Object.keys(dataToSend).forEach((key) => {
				if (dataToSend[key as keyof typeof dataToSend] === undefined) {
					delete (dataToSend as Record<string, unknown>)[key];
				}
			});

			const isDataUpdated = Object.keys(dataToSend).length > 0;
			if (!isDataUpdated && !isImageUpdated) {
				toast.warning('No changes to update', { description: 'No fields were modified.' });
				return false;
			}

			let scenarioUpdated = false;
			let scenarioImageUpdated = false;
			if (Object.keys(dataToSend).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<RolePlayData>>('/scenario/update-scenario', {
					scenarioId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Role Play Updated', {
						description: 'Role Play has been successfully updated.',
					});
					queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
					scenarioUpdated = true;
					return true;
				}
			}

			if (updatedData.scenarioImage instanceof File) {
				const imageFormData = new FormData();
				imageFormData.append('scenarioImage', updatedData.scenarioImage);
				imageFormData.append('scenarioId', scenarioId);

				const { data: imageResponse, error: imageError } = await callApi<ApiResponse<RolePlayData>>(
					'/scenario/update-scenario',
					imageFormData
				);

				if (imageError) {
					throw new Error(imageError.message);
				}

				if (imageResponse?.status === 'success') {
					toast.success('Role Play Updated', { description: 'Role play has been successfully updated.' });
					queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
					scenarioImageUpdated = true;
				}
			}

			if (scenarioUpdated || scenarioImageUpdated) {
				reset();
			}
		} catch (err) {
			toast.error('Role Play Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			setIsLoading(false);
		}
	};

	if (loading || !rolePlay) {
		return <div className="w-full bg-white rounded-md px-6 py-6">Loading...</div>;
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setScenarioImage(imageUrl);
			setEditedData({ ...editedData, scenarioImage: file });
		} else {
			setScenarioImage(rolePlay[0].scenarioImage);
			setEditedData({ ...editedData, scenarioImage: null });
		}
	};

	if (error) {
		<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
			<p>Error: {error}</p>
		</div>;
	}

	return (
		<div className="flex flex-col w-full mt-10">
			<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
				<div className="flex flex-col items-center space-y-2">
					<h2 className="text-center text-xl font-semibold text-gray-900">Edit Role Play</h2>
				</div>

				<form className="space-y-4 relative">
					<div className="flex justify-center gap-8 mt-4">
						<div className="relative">
							<label htmlFor="scenarioImage" className="relative cursor-pointer">
								<Avatar className="w-24 h-24 border">
									<AvatarImage src={scenarioImage || ''} className="object-cover w-full h-full" />
									<AvatarFallback>RP</AvatarFallback>
								</Avatar>
								<span className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1 rounded-full">
									<CameraIcon className="text-black w-5 h-5" />
								</span>
							</label>
							<Input
								type="file"
								id="scenarioImage"
								accept="image/*"
								onChange={(e) => handleImageChange(e)}
								className="hidden"
							/>
						</div>
					</div>

					<div className="mt-4">
						<label htmlFor="scenario" className="text-sm font-medium text-gray-700">
							Scenario
						</label>
						<Input
							value={editedData.scenario ?? scenario ?? ''}
							onChange={(e) => setEditedData({ ...editedData, scenario: e.target.value })}
							autoFocus
							type="text"
							id="scenario"
							aria-label="Role Play"
							placeholder="Role Play"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.scenario && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.scenario && <FormErrorMessage error={errors.scenario} errorMsg={errors.scenario.message} />}
					</div>

					{/* <div className="mt-4">
						<label htmlFor="description" className="text-sm font-medium text-gray-700">
							Description
						</label>
						<Input
							value={editedData.scenario ?? scenario ?? ''}
							onChange={(e) => setEditedData({ ...editedData, scenario: e.target.value })}
							autoFocus
							type="text"
							id="description"
							aria-label="Description"
							placeholder="Description"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.scenario && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{/* {errors.description && <FormErrorMessage error={errors.description} errorMsg={errors.description.message} />}
					</div> */}

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						onClick={() => onEditRoleplay(rolePlayId, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>
		</div>
	);
}
