'use client';

import { ApiResponse } from '@/interfaces';
import { JourneyData, Module } from '@/interfaces/ApiResponses';
import { AddJourneyType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

export default function Journeyy() {
	const [isLoading, setIsLoading] = useState(false);
	const [selectKey, setSelectKey] = useState(0);
	const queryClient = useQueryClient();

	const {
		setValue,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddJourneyType>({
		resolver: zodResolver(zodValidator('journey')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const onSubmit: SubmitHandler<AddJourneyType> = async (data: AddJourneyType) => {
		try {
			setIsLoading(true);
			const { data: responseData, error } = await callApi<ApiResponse<JourneyData>>('/journey/create', {
				moduleId: data.moduleId,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Learning Journey Created', { description: 'The learning journey has been added successfully.' });
				queryClient.invalidateQueries({ queryKey: ['journey'] });
			}
		} catch (err) {
			toast.error('Learning Journey Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
			setSelectKey((prev) => prev + 1);
		}
	};

	const {
		data: modules,
		isLoading: moduleLoading,
		error: moduleQueryError,
	} = useQuery<Module[], Error>({
		queryKey: ['module'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Module[]>>('/course/get-modules');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course modules.');
			}
			if (!responseData?.data) {
				throw new Error('No module data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (moduleQueryError) {
			const errorMessage = moduleQueryError.message || 'An unexpected error occurred while fetching modules.';
			toast.error('Failed to fetch modules', {
				description: errorMessage,
			});
		}
	}, [moduleQueryError]);

	

	return (
		<>
			<div className="flex flex-col w-full">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">Create A Learning Journey </h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label className="text-sm font-medium text-gray-700">
								Select Module <span className="text-red-500">*</span>
							</label>
							<Select
								onValueChange={(value) => setValue('moduleId', value, { shouldValidate: true })}
								disabled={moduleLoading}
								key={selectKey}
							>
								<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
									<SelectValue placeholder={moduleLoading ? 'Loading modules...' : 'Choose a module'} />
								</SelectTrigger>

								<SelectContent
									position="popper"
									className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
								>
									{modules?.map((module) => (
										<SelectItem key={module.id} value={module.id} className="w-full">
											{module.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.moduleId && <FormErrorMessage error={errors.moduleId} errorMsg={errors.moduleId.message} />}
						</div>

						<Button
							type="submit"
							disabled={isSubmitting || isLoading}
							variant="default"
							className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						>
							{isSubmitting || isLoading ? 'Creating...' : 'Create'}
						</Button>
					</form>
				</div>

				
			</div>
		</>
	);
}
