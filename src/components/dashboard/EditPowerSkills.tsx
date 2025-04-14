'use client';

import { ApiResponse } from '@/interfaces';
import { PowerSkill, PowerSkillData } from '@/interfaces/ApiResponses';
import { AddPowerSkillType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';

export default function SkillEdit({ skillId }: { skillId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddPowerSkillType>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [powerSkill, setPowerSkill] = useState<string>('');
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddPowerSkillType>({
		resolver: zodResolver(zodValidator('powerSkill')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: skill,
		isLoading: loading,
		error: queryError,
	} = useQuery<PowerSkill[], Error>({
		queryKey: ['skill', skillId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<PowerSkill[]>>(`/skill?skillId=${skillId}`);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching power skill.');
			}
			if (!responseData?.data) {
				throw new Error('Power Skill data not returned');
			}
			toast.success('Power Skill Fetched', { description: 'Successfully fetched power skill.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching power skill.';
			setError(errorMessage);
			toast.error('Failed to Fetch Power Skill', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	useEffect(() => {
		if (skill && skill[0]) {
			if (skill[0].powerskill) {
				setPowerSkill(skill[0].powerskill);
			}
		}
	}, [skill]);

	const onEditSkill = async (skillId: string, updatedData: Partial<AddPowerSkillType>) => {
		try {
			setIsLoading(true);

			const dataToSend = {
				skill: updatedData.skill,
			};

			Object.keys(dataToSend).forEach((key) => {
				if (dataToSend[key as keyof typeof dataToSend] === undefined) {
					delete (dataToSend as Record<string, unknown>)[key];
				}
			});

			const isDataUpdated = Object.keys(dataToSend).length > 0;
			if (!isDataUpdated) {
				toast.warning('No changes to update', { description: 'No fields were modified.' });
				return false;
			}

			if (Object.keys(dataToSend).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<PowerSkillData>>('/skill/update-skill', {
					skillId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Power skill Updated', {
						description: 'Power skill has been successfully updated.',
					});
					queryClient.invalidateQueries({ queryKey: ['skill'] });
					return true;
				}
			}
		} catch (err) {
			toast.error('Power skill Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			setIsLoading(false);
		}
	};

	if (loading || !skill) {
		return <div className="w-full bg-white rounded-md px-6 py-6">Loading...</div>;
	}

	if (error) {
		<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
			<p>Error: {error}</p>
		</div>;
	}

	return (
		<div className="flex flex-col w-full mt-10">
			<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
				<div className="flex flex-col items-center space-y-2">
					<h2 className="text-center text-xl font-semibold text-gray-900">Edit Power skill</h2>
				</div>

				<form className="space-y-4 relative">
					<div>
						<label htmlFor="powerskill" className="text-sm font-medium text-gray-700">
							Power Skill
						</label>
						<Input
							value={editedData.skill ?? powerSkill ?? ''}
							onChange={(e) => setEditedData({ ...editedData, skill: e.target.value })}
							autoFocus
							type="text"
							id="powerskill"
							aria-label="Power Skill"
							placeholder="Power Skill"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.skill && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.skill && <FormErrorMessage error={errors.skill} errorMsg={errors.skill.message} />}
					</div>

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						//onClick={(e) => onEditCourse}
						onClick={() => onEditSkill(skillId, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>
		</div>
	);
}
