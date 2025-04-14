'use client';

import { ApiResponse } from '@/interfaces';
import { RolePlay, RolePlayData } from '@/interfaces/ApiResponses';
import { AddRolePlayType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EditIcon, CopyIcon, DeleteIcon, SaveIcon, XIcon } from '../common';

export default function RolePlays() {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<RolePlay>>({});
	const skipPageResetRef = useRef(false);
	const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<AddRolePlayType>({
		resolver: zodResolver(zodValidator('rolePlay')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: scenario,
		isLoading: loading,
		error: queryError,
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
			toast.success('Role plays Fetched', { description: 'Successfully fetched role plays.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching role plays.';
			setError(errorMessage);
			toast.error('Failed to Role plays', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<AddRolePlayType> = async (data: AddRolePlayType) => {
		try {
			setIsLoading(true);

			const formData = new FormData();
			formData.append('scenario', data.scenario);
			if (data.scenarioImage instanceof File) {
				formData.append('scenarioImage', data.scenarioImage);
			}

			const { data: responseData, error } = await callApi<ApiResponse<RolePlayData>>(
				'/scenario/create-scenario',
				formData
			);

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Role Play Created', { description: 'The role play scenario has been added successfully.' });
				setFileName(null);
				queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
			}
		} catch (err) {
			toast.error('Role Play Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	const onDeleteRolePlay = async (scenarioId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/scenario/delete-scenario`, {
				scenarioId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Role Play Deleted', { description: 'The Role play has been successfully removed.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Role Play Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onEditRolePlay = async (scenarioId: string, updatedData: Partial<RolePlay>) => {
		try {
			const dataToSend = {
				scenario: updatedData.scenario,
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

			const { data: responseData, error } = await callApi<ApiResponse<RolePlayData>>(`/scenario/update-scenario`, {
				scenarioId,
				...dataToSend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Role Play Updated', { description: 'Role Play has been successfully updated.' });
				queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Role Play Update Failed', {
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

	const columns: ColumnDef<RolePlay>[] = [
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
			id: 'scenario',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Scenario
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const scenario = row.original.scenario;
				const scenarioImage = row.original.scenarioImage;
				const isEditing = editingRowId === row.original.id;

				if (isEditing) {
					return (
						<Input
							ref={(el) => {
								inputRefs.current[row.original.id] = el;
							}}
							value={editedData.scenario || scenario}
							onChange={(e) => setEditedData({ ...editedData, scenario: e.target.value })}
							className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
							autoFocus
						/>
					);
				}

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src={scenarioImage} className="object-cover w-full h-full" />
							<AvatarFallback>RP</AvatarFallback>
						</Avatar>
						<span className="lowercase ml-3">{`${scenario}`}</span>
					</div>
				);
			},
			accessorFn: (row) => `${row.scenario} ${row.scenarioImage}`,
		},
		{
			accessorKey: 'id',
			header: 'Id',
			cell: ({ row }) => <div className="lowercase">{row.getValue('id')}</div>,
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
				const roleplay = row.original;
				const isEditing = editingRowId === roleplay.id;

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
								onClick={() => navigator.clipboard.writeText(roleplay.id)}
								className="hover:cursor-pointer"
							>
								Copy Role Play ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="hover:cursor-pointer text-red-500"
								onClick={async () => {
									const success = await onDeleteRolePlay(row.original.id);
									if (success) await queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
								}}
							>
								Delete
							</DropdownMenuItem> */}
							{!isEditing ? (
								<>
									<DropdownMenuItem
										onClick={() => navigator.clipboard.writeText(roleplay.id)}
										className="hover:cursor-pointer"
									>
										<CopyIcon className=" h-4 w-4" />
										Copy Role Play ID
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											router.push(`/role-play/${roleplay.id}`);
										}}
										className="hover:cursor-pointer"
									>
										<EditIcon className=" h-4 w-4" />
										Edit Role Play
									</DropdownMenuItem>

									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="hover:cursor-pointer text-red-500"
										onClick={async () => {
											const success = await onDeleteRolePlay(row.original.id);
											if (success) await queryClient.invalidateQueries({ queryKey: ['rolePlay'] });
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
											const success = await onEditRolePlay(roleplay.id, editedData);
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
		data: scenario ?? [],
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
				table.getColumn('scenario')?.setFilterValue(filterValue);
			}, 2000);
			filterFunc(value);
		},
		[table]
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setValue('scenarioImage', file);
			setFileName(file.name);
		}
	};

	const removeImage = () => {
		setValue('scenarioImage', null);
		setFileName(null);
	};

	return (
		<>
			<div className="flex flex-col w-full">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">Create A Scenario For a Role Play</h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="scenario" className="text-sm font-medium text-gray-700">
								Scenario<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('scenario')}
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

						<div className="mt-4">
							<label htmlFor="scenarioImage" className="text-sm font-medium text-gray-700">
								Scenario Image<span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									type="file"
									id="scenarioImage"
									accept="image/*"
									{...register('scenarioImage', { required: 'Scenario image is required' })}
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="scenarioImage"
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
							{errors.scenarioImage && (
								<FormErrorMessage error={errors.scenarioImage} errorMsg={errors.scenarioImage.message} />
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
								placeholder="Filter Role Play Scenarios..."
								defaultValue={(table.getColumn('scenario')?.getFilterValue() as string) ?? ''}
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
