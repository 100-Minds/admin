'use client';

import { ApiResponse } from '@/interfaces';
import { Quiz, QuizData, QuizOption } from '@/interfaces/ApiResponses';
import { AddQuizType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';

export default function QuizEdit({ quizId }: { quizId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddQuizType>>({});
	const [isLoading, setIsLoading] = useState(false);
	//const [selectKey, setSelectKey] = useState(0);
	const [question, setQuestion] = useState<string>('');
	const [optionA, setOptionA] = useState<string>('');
	const [optionB, setOptionB] = useState<string>('');
	const [optionC, setOptionC] = useState<string>('');
	const [optionD, setOptionD] = useState<string>('');
	const [optionE, setOptionE] = useState<string>('');
	const [isCorrect, setIsCorrect] = useState<QuizOption[]>([]);
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddQuizType>({
		resolver: zodResolver(zodValidator('quiz')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: quiz,
		isLoading: loading,
		error: queryError,
	} = useQuery<Quiz[], Error>({
		queryKey: ['quiz', quizId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Quiz[]>>(`/quiz/get-quiz?quizId=${quizId}`);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching quiz.');
			}
			if (!responseData?.data) {
				throw new Error('Quiz data not returned');
			}
			toast.success('Quiz Fetched', { description: 'Successfully fetched quiz.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching quiz.';
			setError(errorMessage);
			toast.error('Failed to Fetch Quiz', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	useEffect(() => {
		if (quiz && quiz[0]) {
			if (quiz[0].question) {
				setQuestion(quiz[0].question);
			}

			if (quiz[0].optionA) {
				setOptionA(quiz[0].optionA);
			}

			if (quiz[0].optionB) {
				setOptionB(quiz[0].optionB);
			}

			if (quiz[0].optionC) {
				setOptionC(quiz[0].optionC);
			}

			if (quiz[0].optionD) {
				setOptionD(quiz[0].optionD);
			}

			if (quiz[0].optionE) {
				setOptionE(quiz[0].optionE);
			}

			if (quiz[0].isCorrect) {
				setIsCorrect(quiz[0].isCorrect);
			}
		}
	}, [quiz]);

	const onEditQuiz = async (quizId: string, updatedData: Partial<AddQuizType>) => {
		try {
			setIsLoading(true);

			const dataToSend = {
				question: updatedData.question,
				optionA: updatedData.optionA,
				optionB: updatedData.optionB,
				optionC: updatedData.optionC,
				optionD: updatedData.optionD,
				optionE: updatedData.optionE,
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
				const { data: responseData, error } = await callApi<ApiResponse<QuizData>>('/quiz/update', {
					quizId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Quiz Updated', {
						description: 'Quiz has been successfully updated.',
					});
					queryClient.invalidateQueries({ queryKey: ['quiz'] });
					return true;
				}
			}
		} catch (err) {
			toast.error('Quiz Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			setIsLoading(false);
		}
	};

	if (loading || !quiz) {
		return <div className="w-full bg-white rounded-md px-6 py-6">Loading...</div>;
	}

	if (error) {
		<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
			<p>Error: {error}</p>
		</div>;
	}

	const options = [
		{ value: 'optionA', label: 'Option A' },
		{ value: 'optionB', label: 'Option B' },
		{ value: 'optionC', label: 'Option C' },
		{ value: 'optionD', label: 'Option D' },
		{ value: 'optionE', label: 'Option E' },
	];

	return (
		<div className="flex flex-col w-full mt-10">
			<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
				<div className="flex flex-col items-center space-y-2">
					<h2 className="text-center text-xl font-semibold text-gray-900">Edit Quiz</h2>
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
						<label htmlFor="optionD" className="text-sm font-medium text-gray-700">
							Option E
						</label>
						<Input
							value={editedData.optionE ?? optionE ?? ''}
							onChange={(e) => setEditedData({ ...editedData, optionE: e.target.value })}
							type="text"
							id="name"
							aria-label="option E"
							placeholder="option E"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.optionE && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.optionE && <FormErrorMessage error={errors.optionE} errorMsg={errors.optionE.message} />}
					</div>

					<div className="mt-4">
						<Controller
							control={control}
							name="isCorrect"
							render={({ field }) => (
								<div className="mt-4">
									<label className="text-sm font-medium text-gray-700">
										Correct Option<span className="text-red-500">*</span>
									</label>
									<Select
										{...field}
										isMulti
										options={options}
										className="mt-2"
										classNamePrefix="react-select"
										onChange={(selected) => {
											const values = selected.map((s) => s.value);
											field.onChange(values);
										}}
										value={options.filter((opt) => (field.value as string[])?.includes(opt.value))}
										placeholder="Select correct option(s)"
										styles={{
											control: (base) => ({
												...base,
												minHeight: '45px',
												backgroundColor: 'white', // Match your input background
												borderColor: '#d1d5db', // Tailwind gray-300
												boxShadow: 'none',
												'&:hover': {
													borderColor: '#3b82f6', // Tailwind blue-500 for hover
												},
												fontSize: '14px', // Text size
											}),
											placeholder: (base) => ({
												...base,
												fontSize: '14px', // Make placeholder smaller
												color: '#9ca3af', // Tailwind gray-400
											}),
											multiValue: (base) => ({
												...base,
												backgroundColor: '#e0f2fe', // Light blue bg for selected items (optional)
												borderRadius: '6px',
											}),
											multiValueLabel: (base) => ({
												...base,
												fontSize: '12px',
												color: '#2563eb', // Tailwind blue-600 for text
											}),
											multiValueRemove: (base) => ({
												...base,
												color: '#2563eb',
												':hover': {
													backgroundColor: '#bfdbfe', // Lighter on hover
													color: '#1d4ed8',
												},
											}),
										}}
									/>
									{errors.isCorrect && (
										<FormErrorMessage error={errors.isCorrect} errorMsg={errors.isCorrect.message} />
									)}
								</div>
							)}
						/>
					</div>

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						//onClick={(e) => onEditCourse}
						onClick={() => onEditQuiz(quizId, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>
		</div>
	);
}
