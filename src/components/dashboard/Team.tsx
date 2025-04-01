'use client';

import { ApiResponse } from '@/interfaces';
import { Team, TeamData } from '@/interfaces/ApiResponses';
import { AddTeamType, callApi, zodValidator } from '@/lib';
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
import { EditIcon, CopyIcon, DeleteIcon, SaveIcon, XIcon } from '../common';

export default function Teamm() {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<Team>>({});
	const skipPageResetRef = useRef(false);
	const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddTeamType>({
		resolver: zodResolver(zodValidator('team')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: teams,
		isLoading: loading,
		error: queryError,
	} = useQuery<Team[], Error>({
		queryKey: ['team'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Team[]>>('/team/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching teams.');
			}
			if (!responseData?.data) {
				throw new Error('No team data returned');
			}
			toast.success('Teams Fetched', { description: 'Successfully fetched teams.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching teams.';
			setError(errorMessage);
			toast.error('Failed to Teams', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<AddTeamType> = async (data: AddTeamType) => {
		try {
			setIsLoading(true);

			const { data: responseData, error } = await callApi<ApiResponse<TeamData>>('/team/create-team', {
				name: data.name,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Team Created', { description: 'The team has been created successfully.' });
				queryClient.invalidateQueries({ queryKey: ['team'] });
			}
		} catch (err) {
			toast.error('Team Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	const onDeleteTeam = async (teamId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/team/delete-team`, {
				teamId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Team Deleted', { description: 'Team has been successfully deleted.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Team Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onEditTeam = async (teamId: string, updatedData: Partial<Team>) => {
		try {
			const dataToSend = {
				name: updatedData.name,
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

			const { data: responseData, error } = await callApi<ApiResponse<TeamData>>(`/team/update-team`, {
				teamId,
				...dataToSend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Team Updated', { description: 'Team has been successfully updated.' });
				queryClient.invalidateQueries({ queryKey: ['team'] });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Team Update Failed', {
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

	const columns: ColumnDef<Team>[] = [
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
						Name
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const team = row.original;
				const isEditing = editingRowId === team.id;

				if (isEditing) {
					return (
						<Input
							ref={(el) => {
								inputRefs.current[team.id] = el;
							}}
							value={editedData.name || team.name}
							onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
							className="min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
							autoFocus
						/>
					);
				}

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src="/icons/Team.svg" />
							<AvatarFallback>TD</AvatarFallback>
						</Avatar>
						<span className="lowercase ml-3">{`${team.name} `}</span>
					</div>
				);
			},
			accessorFn: (row) => `${row.name}`,
		},
		{
			id: 'owner',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Created By
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const team = row.original;

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src="/icons/Frame 7.svg" />
							<AvatarFallback>TD</AvatarFallback>
						</Avatar>
						<span className="lowercase ml-3">{`${team.firstName} ${team.lastName} `}</span>
					</div>
				);
			},
			accessorFn: (row) => `${row.firstName} ${row.lastName}`,
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
				const team = row.original;
				const isEditing = editingRowId === team.id;

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
										onClick={() => navigator.clipboard.writeText(team.id)}
										className="hover:cursor-pointer"
									>
										<CopyIcon className=" h-4 w-4" />
										Copy Team ID
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											setEditingRowId(team.id);
											setEditedData(team);
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
											const success = await onDeleteTeam(row.original.id);
											if (success) await queryClient.invalidateQueries({ queryKey: ['team'] });
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
											const success = await onEditTeam(team.id, editedData);
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
		data: teams ?? [],
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
			<div className="flex flex-col w-full">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">Create A Team</h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Team Name<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('name')}
								autoFocus
								type="text"
								id="name"
								aria-label="Team Name"
								placeholder="Team Name"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.name && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.name && <FormErrorMessage error={errors.name} errorMsg={errors.name.message} />}
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
								placeholder="Filter Teams..."
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
