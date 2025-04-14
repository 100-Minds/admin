'use client';

import { ApiResponse } from '@/interfaces';
import { Course, CourseData, Module, ModuleData } from '@/interfaces/ApiResponses';
import { AddCourseType, AddModuleType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage, OpenBookIcon, QuizIcon } from '../common';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { ArrowUpDown, BookIcon, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useRouter } from 'next/navigation';
import { EditIcon, DeleteIcon } from '../common';

export default function Coursess() {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [error, setError] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const {
		//register: registerModule,
		handleSubmit: handleSubmitModule,
		reset: resetModule,
		setValue: setModuleValue,
		formState: { isSubmitting: submittingModule },
	} = useForm<AddModuleType>({
		resolver: zodResolver(zodValidator('module')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<AddCourseType>({
		resolver: zodResolver(zodValidator('course')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});
	const moduleId = watch('moduleId');

	const {
		data: courses,
		isLoading: loading,
		error: queryError,
	} = useQuery<Course[], Error>({
		queryKey: ['course'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Course[]>>('/course/get-admin-courses');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching courses.');
			}
			if (!responseData?.data) {
				throw new Error('No course data returned');
			}
			toast.success('Courses Fetched', { description: 'Successfully fetched courses.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching courses.';
			setError(errorMessage);
			toast.error('Failed to Fetch Courses', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<AddCourseType> = async (data: AddCourseType) => {
		try {
			setIsLoading(true);

			const formData = new FormData();
			formData.append('name', data.name);
			//formData.append('scenario', data.scenario);
			formData.append('moduleId', data.moduleId);
			//formData.append('skills', JSON.stringify(data.skills));
			if (data.courseImage instanceof File) {
				formData.append('courseImage', data.courseImage);
			}

			const { data: responseData, error } = await callApi<ApiResponse<CourseData>>('/course/create-course', formData);

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Course Created', { description: 'The course has been added successfully.' });
				setFileName(null);
				queryClient.invalidateQueries({ queryKey: ['course'] });
			}
		} catch (err) {
			toast.error('Course Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
			setFileName(null);
		} finally {
			reset();
			setValue('moduleId', '');
			//setValue('scenario', []);
			//setValue('skills', []);
			//setSelectedSkills([]);
			setIsLoading(false);
		}
	};

	const onSubmitModule: SubmitHandler<AddModuleType> = async (data: AddModuleType) => {
		try {
			setIsLoading(true);
			const { data: responseData, error } = await callApi<ApiResponse<ModuleData>>('/course/create-module', {
				name: data.name,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Course Module Created', { description: 'The module has been added successfully.' });
				queryClient.invalidateQueries({ queryKey: ['module'] });
			}
		} catch (err) {
			toast.error('Module Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			resetModule();
		}
	};

	const onEditCourse = async (courseId: string, updatedData: Partial<Course>) => {
		try {
			const dataToSend = {
				status: updatedData.status,
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

			const { data: responseData, error } = await callApi<ApiResponse<CourseData>>(`/course/update-course`, {
				courseId,
				...dataToSend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Course Updated', { description: 'Course has been successfully updated.' });
				queryClient.invalidateQueries({ queryKey: ['course'] });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Course Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onDeleteCourse = async (courseId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/course/delete-course`, {
				courseId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Course Deleted', { description: 'The course has been successfully removed.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Course Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setValue('courseImage', file);
			setFileName(file.name);
		}
	};

	const removeImage = () => {
		setValue('courseImage', null);
		setFileName(null);
	};

	const columns: ColumnDef<Course>[] = [
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
			id: 'name',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Course
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const name = row.original.name;
				const image = row.original.courseImage;

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src={image} className="object-cover w-full h-full" />
							<AvatarFallback>{'/icons/Course.svg'}</AvatarFallback>
						</Avatar>
						<span className="lowercase ml-3">{`${name}`}</span>
					</div>
				);
			},
			accessorFn: (row) => `${row.name} ${row.courseImage}`,
		},
		{
			accessorKey: 'id',
			header: 'Id',
			cell: ({ row }) => <div className="lowercase">{row.getValue('id')}</div>,
		},
		{
			accessorKey: 'moduleName',
			header: 'Module Name',
			cell: ({ row }) => <div className="lowercase">{row.getValue('moduleName')}</div>,
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => <div className="lowercase">{row.getValue('status')}</div>,
		},
		{
			accessorKey: 'created_at',
			header: () => <div>Created At</div>,
			cell: ({ row }) => {
				const date = row.getValue('created_at');

				if (!date) return <div className="text-right">—</div>;

				const formattedDate =
					typeof date === 'string' || typeof date === 'number' ? format(new Date(date), 'EEE do, MMM') : 'Invalid Date';

				return <div className="">{formattedDate}</div>;
			},
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => {
				const courses = row.original;

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
							{/* <DropdownMenuItem
								onClick={() => navigator.clipboard.writeText(courses.id)}
								className="hover:cursor-pointer"
							>
								<CopyIcon className=" h-4 w-4" />
								Copy Course ID
							</DropdownMenuItem> */}
							<DropdownMenuItem
								className="hover:cursor-pointer"
								onClick={async () => {
									await onEditCourse(courses.id, {
										status: row.original.status === 'draft' ? 'published' : 'draft',
									});
									//if (success) await queryClient.invalidateQueries({ queryKey: ['course'] });
								}}
							>
								<BookIcon className="h-4 w-4" />
								{row.original.status === 'published' ? 'Draft Course' : 'Publish Course'}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									router.push(`/courses/${courses.id}`);
								}}
								className="hover:cursor-pointer"
							>
								<EditIcon className=" h-4 w-4" />
								Edit Course
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									router.push(`/courses/${courses.id}?action=addLesson`);
								}}
								className="hover:cursor-pointer"
							>
								<OpenBookIcon className="h-4 w-4" />
								Add Lesson
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									router.push(`/courses/${courses.id}/assessment`);
								}}
								className="hover:cursor-pointer"
							>
								<QuizIcon className="h-4 w-4" />
								Add assessment
							</DropdownMenuItem>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="hover:cursor-pointer text-red-500"
								onClick={async () => {
									const success = await onDeleteCourse(row.original.id);
									if (success) await queryClient.invalidateQueries({ queryKey: ['course'] });
								}}
							>
								<DeleteIcon className=" h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: courses ?? [],
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
	});

	const debouncedFilter = React.useCallback(
		(value: string) => {
			const filterFunc = debounce((filterValue: string) => {
				table.getColumn('name')?.setFilterValue(filterValue);
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
						<h2 className="text-center text-xl font-semibold text-gray-900">Create a Course </h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="course" className="text-sm font-medium text-gray-700">
								Course Name <span className="text-red-500">*</span>
							</label>
							<Input
								{...register('name')}
								autoFocus
								type="text"
								id="name"
								aria-label="Course Name"
								placeholder="Course Name"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.name && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.name && <FormErrorMessage error={errors.name} errorMsg={errors.name.message} />}
						</div>

						<div className="mt-4">
							<label className="text-sm font-medium text-gray-700 bg-yellow">
								Select Module <span className="text-red-500">*</span>
							</label>

							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild className="bg-[#F8F8F8]">
									<Button
										variant="outline"
										role="combobox"
										className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer justify-between text-gray-500"
										disabled={moduleLoading}
									>
										{moduleId
											? (modules?.find((module) => module.id === moduleId)?.name ?? 'Select module')
											: moduleLoading
												? 'Loading modules...'
												: 'Choose a module'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command>
										<CommandInput
											placeholder="Find or create a new module"
											onValueChange={(value) => setSearchTerm(value)}
										/>

										<CommandList>
											<CommandEmpty className="px-4 py-3">
												{searchTerm && (
													<Button
														variant="ghost"
														className="hover:underline hover:cursor-pointer p-0 h-auto"
														disabled={submittingModule || isLoading}
														onClick={() => {
															setModuleValue('name', searchTerm, { shouldValidate: true });
															handleSubmitModule(async (data) => {
																await onSubmitModule(data);
																setSearchTerm('');
																setOpen(false);
															})();
														}}
													>
														{submittingModule || isLoading ? 'Creating...' : `+ Create new module: ${searchTerm}`}
													</Button>
												)}
											</CommandEmpty>
											<CommandGroup>
												{modules
													?.filter((module) => module.name.toLowerCase().includes(searchTerm.toLowerCase()))
													.map((module) => (
														<CommandItem
															key={module.id}
															value={module.name}
															onSelect={() => {
																setValue('moduleId', module.id, { shouldValidate: true });
																setSearchTerm('');
																setOpen(false);
															}}
															className="w-full"
														>
															<Check
																className={`mr-2 h-4 w-4 ${moduleId === module.id ? 'opacity-100' : 'opacity-0'}`}
															/>
															{module.name}
														</CommandItem>
													))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							{errors.moduleId && <FormErrorMessage error={errors.moduleId} errorMsg={errors.moduleId.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="courseImage" className="text-sm font-medium text-gray-700">
								Course Image<span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									type="file"
									id="courseImage"
									accept="image/*"
									{...register('courseImage', { required: 'Course image is required' })}
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="courseImage"
									className="block w-full border border-gray-300 rounded-lg shadow-sm bg-[#F8F8F8] cursor-pointer p-3 text-[13px] text-gray-500 min-h-[45px] text-center"
								>
									{fileName ? fileName : 'Choose a file'}
								</label>
							</div>
							{fileName && (
								<div className="mt-2 flex justify-end ml-auto">
									<button
										type="button"
										onClick={removeImage}
										className="bg-red-500 text-white px-3 py-1 rounded-md text-xs shadow-md hover:cursor-pointer"
									>
										Remove Image
									</button>
								</div>
							)}
							{errors.courseImage && (
								<FormErrorMessage error={errors.courseImage} errorMsg={errors.courseImage.message} />
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
								placeholder="Filter course names..."
								defaultValue={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
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
