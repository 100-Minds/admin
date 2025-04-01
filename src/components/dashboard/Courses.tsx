'use client';

import { ApiResponse } from '@/interfaces';
import { Course, CourseData, Module, PowerSkill, RolePlay } from '@/interfaces/ApiResponses';
import { AddCourseType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage } from '../common';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export default function Coursess() {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const [selectedSkills, setSelectedSkills] = useState<{ id: string; name: string }[]>([]);
	const [selectKey, setSelectKey] = useState(0);
	const [fileName, setFileName] = useState<string | null>(null);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<Course>>({});
	const skipPageResetRef = useRef(false);
	const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<AddCourseType>({
		resolver: zodResolver(zodValidator('course')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: courses,
		isLoading: loading,
		error: queryError,
	} = useQuery<Course[], Error>({
		queryKey: ['course'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Course[]>>('/course/get-courses');
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
			formData.append('scenario', data.scenario);
			formData.append('moduleId', data.moduleId);
			formData.append('skills', JSON.stringify(data.skills));
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
			setTimeout(() => {
				setValue('moduleId', '');
				setValue('scenario', '');
				setValue('skills', []);
				setSelectedSkills([]);
				setSelectKey((prev) => prev + 1);
			}, 0);
			setIsLoading(false);
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

	const onEditCourse = async (courseId: string, updatedData: Partial<Course>) => {
		try {
			const dataToSend = {
				name: updatedData.name,
				scenario: updatedData.scenarioName,
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

	useEffect(() => {
		if (editingRowId && inputRefs.current[editingRowId]) {
			inputRefs.current[editingRowId]?.focus();
		}
	}, [editingRowId]);

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

	const {
		data: scenario,
		isLoading: scenarioLoading,
		error: scenarioQueryError,
	} = useQuery<RolePlay[], Error>({
		queryKey: ['rolePlay'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<RolePlay[]>>('/scenario/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching role plays.');
			}
			if (!responseData?.data) {
				throw new Error('No role play data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (scenarioQueryError) {
			const errorMessage = scenarioQueryError.message || 'An unexpected error occurred while fetching role plays.';
			toast.error('Failed to fetch modules', {
				description: errorMessage,
			});
		}
	}, [scenarioQueryError]);

	const {
		data: skills,
		isLoading: skillsLoading,
		error: skillsQueryError,
	} = useQuery<PowerSkill[], Error>({
		queryKey: ['skills'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<PowerSkill[]>>('/skill/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching skills.');
			}
			if (!responseData?.data) {
				throw new Error('No skill data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (skillsQueryError) {
			const errorMessage = skillsQueryError.message || 'An unexpected error occurred while fetching skills.';
			toast.error('Failed to fetch skills', {
				description: errorMessage,
			});
		}
	}, [skillsQueryError]);

	const handleSkillChange = (skillId: string) => {
		setSelectedSkills((prev) => {
			const skill = (skills ?? []).find((s) => s.id === skillId);
			if (!skill) return prev;

			const exists = prev.some((s) => s.id === skillId);
			const updatedSkills = exists
				? prev.filter((s) => s.id !== skillId)
				: [...prev, { id: skill.id, name: skill.powerskill }];

			setValue(
				'skills',
				updatedSkills.map((s) => s.id),
				{ shouldValidate: true }
			);
			return updatedSkills;
		});
	};

	const handleRemoveSkill = (skillId: string) => {
		setSelectedSkills((prev) => {
			const updatedSkills = prev.filter((skill) => skill.id !== skillId);

			setValue(
				'skills',
				updatedSkills.map((s) => s.id),
				{ shouldValidate: true }
			);
			return updatedSkills;
		});
	};

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
				const isEditing = editingRowId === row.original.id;

				if (isEditing) {
					return (
						<Input
							ref={(el) => {
								inputRefs.current[row.original.id] = el;
							}}
							value={editedData.name || name}
							onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
							className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
							autoFocus
						/>
					);
				}

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src={image} />
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
			accessorKey: 'scenarioName',
			header: 'Scenario',
			cell: ({ row }) => {
				const scenarios = row.original;
				const isEditing = editingRowId === scenarios.id;

				if (isEditing) {
					const currentScenario = scenarios.scenarioName || '';
					return (
						<Select
							value={editedData.scenarioName || currentScenario}
							onValueChange={(value) => setEditedData({ ...editedData, scenarioName: value })}
							disabled={scenarioLoading}
						>
							<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
								<SelectValue placeholder={scenarioLoading ? 'Loading Scenarios...' : 'Choose a role play scenario'} />
							</SelectTrigger>
							<SelectContent
								position="popper"
								className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
							>
								{scenario?.map((scene) => (
									<SelectItem key={scene.id} value={scene.scenario} className="w-full">
										{scene.scenario}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				}

				return <div className="lowercase">{row.getValue('scenarioName')}</div>;
			},
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
				const isEditing = editingRowId === courses.id;

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
								Copy Course ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="hover:cursor-pointer text-red-500"
								onClick={async () => {
									const success = await onDeleteCourse(row.original.id);
									if (success) await queryClient.invalidateQueries({ queryKey: ['course'] });
								}}
							>
								Delete
							</DropdownMenuItem> */}

							{!isEditing ? (
								<>
									<DropdownMenuItem
										onClick={() => navigator.clipboard.writeText(courses.id)}
										className="hover:cursor-pointer"
									>
										<CopyIcon className=" h-4 w-4" />
										Copy Course ID
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											setEditingRowId(courses.id);
											setEditedData(courses);
											skipPageResetRef.current = true;
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
											const success = await onDeleteCourse(row.original.id);
											if (success) await queryClient.invalidateQueries({ queryKey: ['course'] });
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
											const success = await onEditCourse(courses.id, editedData);
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
		autoResetPageIndex: !skipPageResetRef.current,
		autoResetExpanded: !skipPageResetRef.current,
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
							<label className="text-sm font-medium text-gray-700">
								Select Module <span className="text-red-500">*</span>
							</label>
							<Select
								onValueChange={(value) => {
									setValue('moduleId', value, { shouldValidate: true });
								}}
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

						<div className="mt-4">
							<label className="text-sm font-medium text-gray-700">
								Select scenario <span className="text-red-500">*</span>
							</label>
							<Select
								onValueChange={(value) => {
									setValue('scenario', value, { shouldValidate: true });
								}}
								disabled={scenarioLoading}
								key={selectKey}
							>
								<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
									<SelectValue
										placeholder={scenarioLoading ? 'Loading role play scenarios...' : 'Choose a role play scenario'}
									/>
								</SelectTrigger>

								<SelectContent
									position="popper"
									className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
								>
									{scenario?.map((scenario) => (
										<SelectItem key={scenario.id} value={scenario.scenario} className="w-full">
											{scenario.scenario}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.scenario && <FormErrorMessage error={errors.scenario} errorMsg={errors.scenario.message} />}
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

						<div className="relative">
							<label className="text-sm font-medium text-gray-700">
								Select Skills <span className="text-red-500">*</span>
							</label>
							<Select onValueChange={handleSkillChange} key={selectKey}>
								<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
									<SelectValue placeholder={skillsLoading ? 'Loading power skill...' : 'Choose skills'} />
								</SelectTrigger>

								<SelectContent
									position="popper"
									className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
								>
									{skills?.map((skill) => (
										<SelectItem key={skill.id} value={skill.id} className="w-full">
											{skill.powerskill}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{selectedSkills.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{selectedSkills.map((skill) => (
										<span key={skill.id} className="bg-gray-200 text-xs p-1 rounded">
											{skill.name}
											<span
												onClick={() => handleRemoveSkill(skill.id)}
												className="text-red-500 cursor-pointer text-[9px]"
											>
												❌
											</span>
										</span>
									))}
								</div>
							)}

							{selectedSkills.length === 0 && (
								<p className="text-red-500 text-xs mt-2">At least one skill is required</p>
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
