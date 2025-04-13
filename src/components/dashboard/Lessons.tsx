'use client';

import { ApiResponse } from '@/interfaces';
import { Chapter, UploadLessonData } from '@/interfaces/ApiResponses';
import { AddLessonType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { isValidUUID } from '@/lib/helpers/isValidUUID';
import { EditIcon, CopyIcon, DeleteIcon, SaveIcon, XIcon } from '../common';

export default function Lessonn({
	courseId,
	courseName,
	activeSection,
}: {
	courseId: string;
	courseName: string;
	activeSection: string | null;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [fileName, setFileName] = useState<string | null>(null);
	const [fileType, setFileType] = useState<string | null>(null);
	const [fileSize, setFileSize] = useState<number | null>(null);
	const [videoLength, setVideoLength] = useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	//const [courseId, setCourseId] = useState<string>('');
	//const [selectKey, setSelectKey] = useState(0);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddLessonType>>({});
	const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
	const titleInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<AddLessonType>({
		resolver: zodResolver(zodValidator('lesson')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	useEffect(() => {
		if (activeSection === 'lesson' && titleInputRef.current) {
			// Add a slight delay to ensure the collapsible has opened
			setTimeout(() => {
				titleInputRef.current?.focus();
			}, 100);
		}
	}, [activeSection]);

	const {
		data: lessons,
		isLoading: loadingLessons,
		error: lessonError,
	} = useQuery<Chapter[], Error>({
		queryKey: ['lesson', courseId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Chapter[]>>(
				`/course/get-chapters?courseId=${courseId}`
			);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course lessons.');
			}
			if (!responseData?.data) {
				throw new Error('No lesson data returned');
			}
			toast.success('Lessons Fetched', { description: 'Successfully fetched lessons.' });
			return responseData.data;
		},
		enabled: !!courseId && isValidUUID(courseId),
	});

	useEffect(() => {
		if (lessonError) {
			const errorMessage = lessonError.message || 'An unexpected error occurred while fetching lessons.';
			setError(errorMessage);
			toast.error('Failed to fetch lessons', {
				description: errorMessage,
			});
		}
	}, [lessonError]);

	const onSubmit: SubmitHandler<AddLessonType> = async (data: AddLessonType) => {
		try {
			setIsLoading(true);
			if (!fileName || !fileType || !fileSize || !videoLength) {
				setFileName(null);
				throw new Error('Please upload a valid video file.');
			}

			const { data: responseData, error } = await callApi<ApiResponse<UploadLessonData>>('/course/create-lesson', {
				courseId,
				title: data.title,
				description: data.description,
				fileName,
				fileType,
				fileSize,
				videoLength,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				//Step 1
				toast.success('Lesson Created', { description: 'The lesson for this course has been added successfully.' });
				setFileName(null);
				setFileType(null);
				setFileSize(null);
				setVideoLength(null);
				reset();
				//setSelectKey((prev) => prev + 1);
				setIsLoading(false);

				// Step 2: Extract uploadUrl and key from responseData
				const signedUrl = responseData?.data?.signedUrl;
				const key = responseData?.data?.key;

				if (!signedUrl || !key) {
					throw new Error('Invalid response: uploadUrl or key missing.');
				}

				const file = data.lessonVideo;
				if (!file) {
					throw new Error('No video file found to upload.');
				}

				//Step 3: Upload file to r2
				let videoUploadStatus = 'failed';
				try {
					const uploadResponse = await fetch(signedUrl, {
						method: 'PUT',
						body: file,
						headers: {
							'Content-Type': file.type,
						},
					});

					if (uploadResponse.ok) {
						videoUploadStatus = 'completed';
					} else {
						throw new Error('Failed to upload video.');
					}
				} catch (uploadError) {
					console.error('Upload error:', uploadError);
					videoUploadStatus = 'failed';
				}

				//Step 4: Send upload status to user
				const { error: notifyError, data: notifyData } = await callApi<ApiResponse<null>>(
					'/course/video/upload-status',
					{
						videoUploadStatus,
						key,
					}
				);

				if (notifyError) {
					throw new Error(notifyError.message || 'Failed to notify backend of video upload status.');
				}

				if (notifyData?.status === 'success') {
					toast.success('Video Uploaded', {
						description: `Course title ${data.title} added successfully.`,
					});
				}

				queryClient.invalidateQueries({ queryKey: ['lesson', courseId] });
			}
		} catch (err) {
			toast.error('Lesson Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
			setFileName(null);
		} finally {
			setIsLoading(false);
			//setSelectKey((prev) => prev + 1);
			//reset();
		}
	};

	const onDeleteLesson = async (chapterId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/course/delete-lesson`, {
				chapterId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Lesson Deleted', { description: 'The Lesson has been successfully deleted.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Lesson Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onEditLesson = async (chapterId: string, updatedData: Partial<AddLessonType>) => {
		try {
			const dataToSend = {
				title: updatedData.title,
				description: updatedData.description,
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

			const { data: responseData, error } = await callApi<ApiResponse<AddLessonType>>(`/course/update-lesson`, {
				chapterId,
				...dataToSend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Lesson Updated', { description: 'Lesson has been successfully updated.' });
				queryClient.invalidateQueries({ queryKey: ['lesson'] });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Lesson Update Failed', {
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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileName(file.name);
			setFileType(file.type);
			setFileSize(file.size);
			setValue('lessonVideo', file, { shouldValidate: true });

			setValue('fileName', file.name, { shouldValidate: true });
			setValue('fileType', file.type, { shouldValidate: true });
			setValue('fileSize', file.size, { shouldValidate: true });

			// Extract video length
			const video = document.createElement('video');
			video.preload = 'metadata';
			video.src = URL.createObjectURL(file);
			video.onloadedmetadata = () => {
				URL.revokeObjectURL(video.src);
				const duration = new Date(video.duration * 1000).toISOString().substr(11, 8);
				setVideoLength(duration);
				setValue('videoLength', duration, { shouldValidate: true });
			};
		}
	};

	// const handleCourseChange = debounce((value: string) => {
	// 	if (value !== courseId) {
	// 		setCourseId(value);
	// 	}
	// }, 300);

	const removeFile = () => {
		setFileName(null);
		setValue('lessonVideo', null, { shouldValidate: true });

		const fileInput = document.getElementById('lessonVideo') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	};

	const columns: ColumnDef<Chapter>[] = React.useMemo(
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
				id: 'title',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Title
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const title = row.original.title;
					const isEditing = editingRowId === row.original.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[row.original.id] = el;
								}}
								value={editedData.title || title}
								onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								autoFocus
							/>
						);
					}

					return (
						<div className="flex items-center space-x-2">
							<Avatar>
								<AvatarImage src="/icons/Course.svg" />
								<AvatarFallback>L</AvatarFallback>
							</Avatar>
							<span className="lowercase ml-3">{`${title}`}</span>
						</div>
					);
				},
				accessorFn: (row) => `${row.title}`,
			},

			{
				id: 'description',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Description
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => {
					const description = row.original.description;
					const isEditing = editingRowId === row.original.id;

					if (isEditing) {
						return (
							<Input
								ref={(el) => {
									inputRefs.current[row.original.id] = el;
								}}
								value={editedData.description || description}
								onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
								className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
								autoFocus
							/>
						);
					}

					return <div className="lowercase">{row.getValue('description')}</div>;
				},
				accessorFn: (row) => `${row.description}`,
			},
			{
				accessorKey: 'chapterNumber',
				header: 'Chapter Number',
				cell: ({ row }) => (
					<div className="lowercase flex items-center justify-center">{row.getValue('chapterNumber')}</div>
				),
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
				id: 'videoUrl',
				header: 'Video',
				cell: ({ row }) => {
					const video = row.original.videoUrl;

					return (
						<div className="flex items-center justify-center">
							<video src={video} controls className="w-20 h-12 rounded-md shadow-md" />
						</div>
					);
				},
				accessorFn: (row) => `${row.videoUrl}`,
			},
			{
				id: 'actions',
				enableHiding: false,
				cell: ({ row }) => {
					const lesson = row.original;
					const isEditing = editingRowId === lesson.id;

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
											onClick={() => navigator.clipboard.writeText(lesson.id)}
											className="hover:cursor-pointer"
										>
											<CopyIcon className=" h-4 w-4" />
											Copy Course ID
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setEditingRowId(lesson.id);
												setEditedData(lesson);
											}}
											className="hover:cursor-pointer"
										>
											<EditIcon className=" h-4 w-4" />
											Edit
										</DropdownMenuItem>

										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="hover:cursor-pointer text-red-500"
											onClick={async () => {
												const success = await onDeleteLesson(row.original.id);
												if (success) await queryClient.invalidateQueries({ queryKey: ['lesson'] });
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
												const success = await onEditLesson(lesson.id, editedData);
												if (success) {
													setEditedData({});
													setEditingRowId(null);
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
		data: lessons ?? [],
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
		autoResetPageIndex: false,
		autoResetExpanded: false,
	});

	const debouncedFilter = React.useCallback(
		(value: string) => {
			const filterFunc = debounce((filterValue: string) => {
				table.getColumn('title')?.setFilterValue(filterValue);
			}, 2000);
			filterFunc(value);
		},
		[table]
	);

	return (
		<>
			<div className="flex flex-col w-full mt-10">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">{`Create A Lesson For ${courseName}`}</h2>
					</div>
					<form className="space-y-4 relative" onSubmit={handleSubmit(onSubmit)}>
						<div className="mt-4">
							<label htmlFor="title" className="text-sm font-medium text-gray-700">
								Chapter title<span className="text-red-500">*</span>
							</label>
							{/* <Input
								{...register('title')}
								//autoFocus
								type="text"
								id="title"
								aria-label="Title"
								placeholder="Title"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.title && 'border-red-500 ring-2 ring-red-500'
								}`}
							/> */}
							<Input
								{...register('title')}
								ref={(e) => {
									// This handles both react-hook-form's ref and our own ref
									register('title').ref(e);
									titleInputRef.current = e;
								}}
								type="text"
								id="title"
								aria-label="Title"
								placeholder="Title"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.title && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.title && <FormErrorMessage error={errors.title} errorMsg={errors.title.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="description" className="text-sm font-medium text-gray-700">
								Chapter description<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('description')}
								type="text"
								id="description"
								aria-label="Description"
								placeholder="Description"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.description && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.description && (
								<FormErrorMessage error={errors.description} errorMsg={errors.description.message} />
							)}
						</div>

						<div className="mt-4">
							<label htmlFor="lessonVideo" className="text-sm font-medium text-gray-700">
								Upload Lesson Video <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									type="file"
									id="lessonVideo"
									accept="video/*"
									//{...register('lessonVideo', { required: 'Lesson video is required' })}
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="lessonVideo"
									className="block w-full border border-gray-300 rounded-lg shadow-sm bg-[#F8F8F8] cursor-pointer p-3 text-[13px] text-gray-500 min-h-[45px] text-center"
								>
									{fileName ? fileName : 'Choose a video file'}
								</label>
							</div>

							{fileName && (
								<div className="mt-2 flex justify-end ml-auto">
									<button
										type="button"
										onClick={removeFile}
										className="bg-red-500 text-white px-3 py-1 rounded-md text-xs shadow-md hover:cursor-pointer"
									>
										Remove Video
									</button>
								</div>
							)}
							{errors.lessonVideo && (
								<FormErrorMessage error={errors.lessonVideo} errorMsg={errors.lessonVideo.message} />
							)}
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

				{/* <div className="mb-2 bg-white lg:w-[50%] md:w-full">
					<Select onValueChange={handleCourseChange} disabled={courseLoading} key={selectKey}>
						<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
							<SelectValue placeholder={courseLoading ? 'Loading courses...' : 'Choose a course'} />
						</SelectTrigger>

						<SelectContent
							position="popper"
							className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
						>
							{courses?.map((course) => (
								<SelectItem key={course.id} value={course.id} className="w-full">
									{course.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div> */}

				{loadingLessons ? (
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
								placeholder="Filter Lesson by title..."
								defaultValue={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
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
