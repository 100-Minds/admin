'use client';

import { ApiResponse } from '@/interfaces';
import { Assessment, Quiz, QuizData } from '@/interfaces/ApiResponses';
import { AddQuizType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Select from 'react-select';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import React from 'react';
import { EditIcon, CopyIcon, DeleteIcon, SaveIcon, XIcon } from '../common';
import { isValidUUID } from '@/lib/helpers/isValidUUID';
import { useRouter } from 'next/navigation';

export default function AddAssessments({ courseId }: { courseId: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<Quiz>>({});
	const skipPageResetRef = useRef(true);
	const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		control,
		//watch,
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
		queryKey: ['assessment', courseId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Assessment[]>>(
				`/assessment/course?courseId=${courseId}`
			);
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course assessment.');
			}
			if (!responseData?.data) {
				throw new Error('No assessment data returned');
			}
			toast.success('Course Assessments Fetched', { description: 'Successfully fetched assessments.' });
			return responseData.data;
		},
		enabled: !!courseId && isValidUUID(courseId),
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching assessments.';
			setError(errorMessage);
			toast.error('Failed to Fetch Assessments', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<AddQuizType> = async (data: AddQuizType) => {
		try {
			setIsLoading(true);

			const { data: responseData, error } = await callApi<ApiResponse<QuizData>>('/assessment/create', {
				question: data.question,
				optionA: data.optionA,
				optionB: data.optionB,
				optionC: data.optionC,
				optionD: data.optionD,
				optionE: data.optionE,
				isCorrect: data.isCorrect,
				courseId,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Assessment Created', { description: 'Course assessment has been created successfully.' });
				queryClient.invalidateQueries({ queryKey: ['assessment', courseId] });
			}
		} catch (err) {
			toast.error('Assessment Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	const onDeleteQuiz = async (quizId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/assessment/delete`, {
				quizId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Assessment Deleted', { description: 'Assessment has been successfully deleted.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Assessment Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onEditQuiz = async (courseId: string, updatedData: Partial<Assessment>) => {
		try {
			const dataToSend = {
				question: updatedData.question,
				optionA: updatedData.optionA,
				optionB: updatedData.optionB,
				optionC: updatedData.optionC ?? '',
				optionD: updatedData.optionD ?? '',
				optionE: updatedData.optionE ?? '',
				isCorrect: updatedData.isCorrect,
			};

			Object.keys(dataToSend).forEach((key) => {
				if (dataToSend[key as keyof typeof dataToSend] === undefined) {
					delete (dataToSend as Record<string, unknown>)[key];
				}
			});

			if (Object.keys(dataToSend).length === 0) {
				toast.warning('No changes to update', { description: 'No fields were modified.' });
				return false;
			}

			const { data: responseData, error } = await callApi<ApiResponse<QuizData>>(`/assessment/update`, {
				courseId,
				...dataToSend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Assessment Updated', { description: 'Assessment has been successfully updated.' });
				queryClient.invalidateQueries({ queryKey: ['assessment'] });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Assessment Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	useEffect(() => {
		if (editingRowId && inputRefs.current[editingRowId]) {
			inputRefs.current[editingRowId]?.focus();
		}
	}, [editingRowId]);

	const columns: ColumnDef<Assessment>[] = React.useMemo(
		() => [
			{
				id: 'select',
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
						onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'question',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Question
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const quiz = row.original;
					const isEditing = editingRowId === quiz.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[quiz.id] = el;
								}}
								value={editedData.question || quiz.question}
								onChange={(e) => setEditedData({ ...editedData, question: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								//autoFocus
							/>
						);
					}

					return (
						<div className="flex items-center space-x-2">
							<Avatar>
								<AvatarImage src="/icons/Course.svg" className="object-cover w-full h-full" />
								<AvatarFallback>Q</AvatarFallback>
							</Avatar>
							<span className="lowercase ml-3">{`${quiz.question} `}</span>
						</div>
					);
				},
				accessorFn: (row) => `${row.question}`,
			},
			{
				id: 'optionA',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Option A
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[assessment.id] = el;
								}}
								value={editedData.optionA || assessment.optionA}
								onChange={(e) => setEditedData({ ...editedData, optionA: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								//autoFocus
							/>
						);
					}

					return <span className="lowercase ml-3">{`${assessment.optionA}`}</span>;
				},
				accessorFn: (row) => `${row.optionA}`,
			},
			{
				id: 'optionB',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Option B
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[assessment.id] = el;
								}}
								value={editedData.optionB || assessment.optionB}
								onChange={(e) => setEditedData({ ...editedData, optionB: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								//autoFocus
							/>
						);
					}

					return <span className="lowercase ml-3">{`${assessment.optionB}`}</span>;
				},
				accessorFn: (row) => `${row.optionB}`,
			},
			{
				id: 'optionC',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Option C
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[assessment.id] = el;
								}}
								value={editedData.optionC || assessment.optionC}
								onChange={(e) => setEditedData({ ...editedData, optionC: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								//autoFocus
							/>
						);
					}

					return assessment.optionC ? (
						<span className="lowercase ml-3">{assessment.optionC}</span>
					) : (
						<span className="lowercase ml-3"></span>
					);
				},
				accessorFn: (row: Quiz) => row.optionC || '',
			},
			{
				id: 'optionD',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Option D
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[assessment.id] = el;
								}}
								value={editedData.optionD || assessment.optionD}
								onChange={(e) => setEditedData({ ...editedData, optionD: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								//autoFocus
							/>
						);
					}

					return assessment.optionD ? (
						<span className="lowercase ml-3">{assessment.optionD}</span>
					) : (
						<span className="lowercase ml-3"></span>
					);
				},
				accessorFn: (row: Quiz) => row.optionD || '',
			},
			{
				id: 'isCorrect',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Correct Option
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					if (isEditing) {
						// return (
						// 	<Select
						// 		value={editedData.isCorrect || assessment.isCorrect}
						// 		onValueChange={(value) => setEditedData({ ...editedData, isCorrect: value })}
						// 		//disabled={scenarioLoading}
						// 	>
						// 		<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
						// 			<SelectValue placeholder="Select a correct option" />
						// 		</SelectTrigger>
						// 		<SelectContent
						// 			position="popper"
						// 			className="max-h-60 overflow-y-auto z-0 bg-white shadow-md border border-gray-300 rounded-md"
						// 			avoidCollisions={false}
						// 		>
						// 			<SelectItem value="optionA">Option A</SelectItem>
						// 			<SelectItem value="optionB">Option B</SelectItem>
						// 			<SelectItem value="optionC">Option C</SelectItem>
						// 			<SelectItem value="optionD">Option D</SelectItem>
						// 		</SelectContent>
						// 	</Select>
						// );
					}

					return <span className="ml-3">{`${assessment.isCorrect}`}</span>;
				},
				accessorFn: (row) => `${row.isCorrect}`,
			},
			{
				accessorKey: 'created_at',
				header: () => <div>Created At</div>,
				cell: ({ row }) => {
					const date = row.getValue('created_at');

					if (!date) return <div className="text-right">—</div>;

					const formattedDate =
						typeof date === 'string' || typeof date === 'number'
							? format(new Date(date), 'EEE do, MMM')
							: 'Invalid Date';

					return <div className="">{formattedDate}</div>;
				},
			},
			{
				id: 'actions',
				enableHiding: false,
				cell: ({ row }) => {
					const assessment = row.original;
					const isEditing = editingRowId === assessment.id;

					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild className="hover:cursor-pointer">
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								{!isEditing ? (
									<>
										<DropdownMenuItem
											onClick={() => navigator.clipboard.writeText(assessment.id)}
											className="hover:cursor-pointer"
										>
											<CopyIcon className=" h-4 w-4" />
											Copy Assessment ID
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												router.push(`/courses/${courseId}/assessment/${assessment.id}`);
											}}
											className="hover:cursor-pointer"
										>
											<EditIcon className=" h-4 w-4" />
											Edit Assessment
										</DropdownMenuItem>

										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="hover:cursor-pointer text-red-500"
											onClick={async () => {
												const success = await onDeleteQuiz(row.original.id);
												if (success) await queryClient.invalidateQueries({ queryKey: ['assessment'] });
											}}
										>
											<DeleteIcon className=" h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</>
								) : (
									<>
										<DropdownMenuItem
											onClick={async () => {
												const success = await onEditQuiz(assessment.id, editedData);
												if (success) {
													setEditedData({});
													setEditingRowId(null);
													skipPageResetRef.current = true;
												}
											}}
											className="hover:cursor-pointer"
										>
											<SaveIcon className=" h-4 w-4" />
											Save
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setEditingRowId(null);
												setEditedData({});
											}}
											className="hover:cursor-pointer text-red-500"
										>
											<XIcon className=" h-4 w-4" />
											Cancel
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[editedData, editingRowId, queryClient]
	);

	const table = useReactTable({
		data: assessment ?? [],
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		autoResetPageIndex: !skipPageResetRef.current,
		autoResetExpanded: !skipPageResetRef.current,
	});

	const debouncedFilter = React.useCallback(
		(value: string) => {
			const filterFunc = debounce((filterValue: string) => {
				table.getColumn('question')?.setFilterValue(filterValue);
			}, 2000);
			filterFunc(value);
		},
		[table]
	);

	const options = [
		{ value: 'optionA', label: 'Option A' },
		{ value: 'optionB', label: 'Option B' },
		{ value: 'optionC', label: 'Option C' },
		{ value: 'optionD', label: 'Option D' },
		{ value: 'optionE', label: 'Option E' },
	];

	return (
		<>
			<div className="flex flex-col w-full">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900 mt-8">Create Course Assessment</h2>
					</div>
					<form className="space-y-4 relative" onSubmit={handleSubmit(onSubmit)}>
						

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Question<span className="text-red-500">*</span>
							</label>
							<Textarea
								{...register('question')}
								autoFocus
								id="question"
								aria-label="Question"
								placeholder="Question"
								className={`min-h-[43px] px-3 py-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm resize-none overflow-hidden ${
									errors.question ? 'border-red-500 ring-2 ring-red-500' : ''
								}`}
							/>
							{errors.question && <FormErrorMessage error={errors.question} errorMsg={errors.question.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="optionA" className="text-sm font-medium text-gray-700">
								Option A<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('optionA')}
								type="text"
								id="optionA"
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
								Option B<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('optionB')}
								type="text"
								id="optionB"
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
								{...register('optionC')}
								type="text"
								id="optionC"
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
								{...register('optionD')}
								type="text"
								id="optionD"
								aria-label="Option D"
								placeholder="Option D"
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
								{...register('optionE')}
								type="text"
								id="optionE"
								aria-label="Option E"
								placeholder="Option E"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.optionD && 'border-red-500 ring-2 ring-red-500'
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
							type="submit"
							disabled={isSubmitting || isLoading}
							variant="default"
							className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						>
							{isSubmitting || isLoading ? 'Creating...' : 'Create'}
						</Button>
					</form>
				</div>

				{loading ? (
					<div className="w-full bg-white rounded-md px-6 py-6">
						<div className="flex items-center py-4">
							<div className="h-10 w-48 bg-gray-200 rounded animate-pulse max-w-sm"></div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className="h-10 w-32 bg-gray-200 rounded ml-auto animate-pulse"></div>
								</DropdownMenuTrigger>
							</DropdownMenu>
						</div>

						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow className="bg-[#F8F8F8]">
										{table
											.getHeaderGroups()
											.map((headerGroup) =>
												headerGroup.headers.map((header) => (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
													</TableHead>
												))
											)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array.from({ length: 10 }).map((_, index) => (
										<TableRow key={index} className="animate-pulse">
											{columns.map((_, cellIndex) => (
												<TableCell key={cellIndex}>
													<div className="h-4 bg-gray-200 rounded w-full"></div>
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				) : error ? (
					<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
						<p>Error: {error}</p>
					</div>
				) : (
					<div className="w-full bg-white rounded-md px-6">
						<div className="flex items-center py-4">
							<Input
								placeholder="Filter Questions..."
								defaultValue={(table.getColumn('question')?.getFilterValue() as string) ?? ''}
								onChange={(event) => debouncedFilter(event.target.value)}
								className="max-w-sm"
							/>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="ml-auto hover:cursor-pointer">
										Columns <ChevronDown />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{table
										.getAllColumns()
										.filter((column) => column.getCanHide())
										.map((column) => {
											return (
												<DropdownMenuCheckboxItem
													key={column.id}
													className="capitalize"
													checked={column.getIsVisible()}
													onCheckedChange={(value) => column.toggleVisibility(!!value)}
												>
													{column.id}
												</DropdownMenuCheckboxItem>
											);
										})}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id} className="bg-[#F8F8F8]">
											{headerGroup.headers.map((header) => {
												return (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={columns.length} className="h-24 text-center">
												No results.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
						<div className="flex items-center py-4 px-0">
							<div className="text-sm text-muted-foreground mr-4 w-full">
								{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
								selected.
							</div>

							<Pagination className="ml-auto mb-0">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() => table.previousPage()}
											className={
												!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'
											}
										/>
									</PaginationItem>

									{[...Array(table.getPageCount())].map((_, index) => {
										if (table.getPageCount() <= 3 || index < 2 || index === table.getPageCount() - 1) {
											return (
												<PaginationItem key={index}>
													<PaginationLink
														onClick={() => table.setPageIndex(index)}
														isActive={table.getState().pagination.pageIndex === index}
														className="hover:cursor-pointer"
													>
														{index + 1}
													</PaginationLink>
												</PaginationItem>
											);
										}
										if (index === 2 && table.getPageCount() > 3) {
											return (
												<PaginationItem key={index} className="mb-auto text-xl">
													...
													{/* <PaginationEllipsis className='mb-0'/> */}
												</PaginationItem>
											);
										}
										return null;
									})}

									<PaginationItem>
										<PaginationNext
											onClick={() => table.nextPage()}
											className={!table.getCanNextPage() ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
