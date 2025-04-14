'use client';

import { ApiResponse } from '@/interfaces';
import { Assessment, AssessmentData } from '@/interfaces/ApiResponses';
import { AddQuizType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';

export default function AssessmentEditForm({ assessmentId }: { assessmentId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddQuizType>>({});
	const [isLoading, setIsLoading] = useState(false);
	//const [selectKey, setSelectKey] = useState(0);
	const [question, setQuestion] = useState<string>('');
	const [optionA, setOptionA] = useState<string>('');
	const [optionB, setOptionB] = useState<string>('');
	const [optionC, setOptionC] = useState<string>('');
	const [optionD, setOptionD] = useState<string>('');
	const [isCorrect, setIsCorrect] = useState<string>('');
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddQuizType>({
		resolver: zodResolver(zodValidator('quiz')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: assessment,
		isLoading: loading,
		error: queryError,
	} = useQuery<Assessment[], Error>({
		queryKey: ['assessment', assessmentId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Assessment[]>>(
				`/assessment/get-assessment?assessmentId=${assessmentId}`
			);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course assessment.');
			}
			if (!responseData?.data) {
				throw new Error('course assessment data not returned');
			}
			toast.success('Assessment Fetched', { description: 'Successfully fetched course assessment.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching course assessment.';
			setError(errorMessage);
			toast.error('Failed to Fetch Course Assessment', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	useEffect(() => {
		if (assessment && assessment[0]) {
			if (assessment[0].question) {
				setQuestion(assessment[0].question);
			}

			if (assessment[0].optionA) {
				setOptionA(assessment[0].optionA);
			}

			if (assessment[0].optionB) {
				setOptionB(assessment[0].optionB);
			}

			if (assessment[0].optionC) {
				setOptionC(assessment[0].optionC);
			}

			if (assessment[0].optionD) {
				setOptionD(assessment[0].optionD);
			}

			if (assessment[0].isCorrect) {
				setIsCorrect(assessment[0].isCorrect);
			}
		}
	}, [assessment]);

	const onEditAssessment = async (assessmentId: string, updatedData: Partial<AddQuizType>) => {
		try {
			setIsLoading(true);

			const dataToSend = {
				question: updatedData.question,
				optionA: updatedData.optionA,
				optionB: updatedData.optionB,
				optionC: updatedData.optionC,
				optionD: updatedData.optionD,
				isCorrect: updatedData.isCorrect || isCorrect,
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
				const { data: responseData, error } = await callApi<ApiResponse<AssessmentData>>('/assessment/update', {
					assessmentId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Course Assessment Updated', {
						description: 'Course assessment has been successfully updated.',
					});
					queryClient.invalidateQueries({ queryKey: ['assessment'] });
					return true;
				}
			}
		} catch (err) {
			toast.error('Course Assessment Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			//setSelectKey((prev) => prev + 1);
			setIsLoading(false);
		}
	};

	if (loading || !assessment) {
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
					<h2 className="text-center text-xl font-semibold text-gray-900">Edit Assessment</h2>
				</div>

				<form className="space-y-4 relative">
					<div>
						<label htmlFor="question" className="text-sm font-medium text-gray-700">
							Question
						</label>
						<Input
							value={editedData.question ?? question ?? ''}
							onChange={(e) => setEditedData({ ...editedData, question: e.target.value })}
							autoFocus
							type="text"
							id="name"
							aria-label="Question"
							placeholder="Question"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.question && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.question && <FormErrorMessage error={errors.question} errorMsg={errors.question.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="optionA" className="text-sm font-medium text-gray-700">
							Option A
						</label>
						<Input
							value={editedData.optionA ?? optionA ?? ''}
							onChange={(e) => setEditedData({ ...editedData, optionA: e.target.value })}
							type="text"
							id="name"
							aria-label="Option A"
							placeholder="Option A"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.optionA && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.optionA && <FormErrorMessage error={errors.optionA} errorMsg={errors.optionA.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="optionB" className="text-sm font-medium text-gray-700">
							Option B
						</label>
						<Input
							value={editedData.optionB ?? optionB ?? ''}
							onChange={(e) => setEditedData({ ...editedData, optionB: e.target.value })}
							type="text"
							id="name"
							aria-label="Option B"
							placeholder="Option B"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.optionB && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.optionB && <FormErrorMessage error={errors.optionB} errorMsg={errors.optionB.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="optionC" className="text-sm font-medium text-gray-700">
							Option C
						</label>
						<Input
							value={editedData.optionC ?? optionC ?? ''}
							onChange={(e) => setEditedData({ ...editedData, optionC: e.target.value })}
							type="text"
							id="name"
							aria-label="Option C"
							placeholder="Option C"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.optionC && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.optionC && <FormErrorMessage error={errors.optionC} errorMsg={errors.optionC.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="optionD" className="text-sm font-medium text-gray-700">
							Option D
						</label>
						<Input
							value={editedData.optionD ?? optionD ?? ''}
							onChange={(e) => setEditedData({ ...editedData, optionD: e.target.value })}
							type="text"
							id="name"
							aria-label="option D"
							placeholder="option D"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.optionD && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.optionD && <FormErrorMessage error={errors.optionD} errorMsg={errors.optionD.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="isCorrect" className="text-sm font-medium text-gray-700">
							isCorrect
						</label>
						<Select
							value={editedData.isCorrect || isCorrect}
							onValueChange={(value) =>
								setEditedData({ ...editedData, isCorrect: value as 'optionA' | 'optionB' | 'optionC' | 'optionD' })
							}

							//disabled={scenarioLoading}
						>
							<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
								<SelectValue placeholder="Course status" />
							</SelectTrigger>
							<SelectContent
								position="popper"
								className="max-h-60 overflow-y-auto z-0 bg-white shadow-md border border-gray-300 rounded-md"
								avoidCollisions={false}
							>
								<SelectItem value="optionA">Option A</SelectItem>
								<SelectItem value="optionB">Option B</SelectItem>
								<SelectItem value="optionC">Option C</SelectItem>
								<SelectItem value="optionD">Option D</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						//onClick={(e) => onEditCourse}
						onClick={() => onEditAssessment(assessmentId, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>
		</div>
	);
}
