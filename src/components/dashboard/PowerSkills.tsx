'use client';

import { ApiResponse } from '@/interfaces';
import { PowerSkill, PowerSkillData } from '@/interfaces/ApiResponses';
import { AddPowerSkillType, callApi, zodValidator } from '@/lib';
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

export default function PowerSkilll() {
	const [isLoading, setIsLoading] = useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddPowerSkillType>({
		resolver: zodResolver(zodValidator('powerSkill')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: skills,
		isLoading: loading,
		error: queryError,
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
			toast.success('Skills Fetched', { description: 'Successfully fetched power skills.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching skills.';
			setError(errorMessage);
			toast.error('Failed to Fetch Skills', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<AddPowerSkillType> = async (data: AddPowerSkillType) => {
		try {
			setIsLoading(true);
			const { data: responseData, error } = await callApi<ApiResponse<PowerSkillData>>('/skill/create-skill', {
				skill: data.skill,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Power Skill Created', { description: 'The power skill has been added successfully.' });
				queryClient.invalidateQueries({ queryKey: ['skills'] });
			}
		} catch (err) {
			toast.error('Skill Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	const onDeleteSkill = async (skillId: string) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/skill/delete-skill`, {
				skillId,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				toast.success('Skill Deleted', { description: 'The skill has been successfully removed.' });
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Skill Deletion Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const columns: ColumnDef<PowerSkill>[] = [
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
			id: 'powerskill',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Skill
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const powerskill = row.original.powerskill;

				return (
					<div className="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src="/icons/Skill.svg" />
							<AvatarFallback>SK</AvatarFallback>
						</Avatar>
						<span className="lowercase ml-3">{`${powerskill}`}</span>
					</div>
				);
			},
			accessorFn: (row) => `${row.powerskill}`,
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
				const skill = row.original;

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
							<DropdownMenuItem
								onClick={() => navigator.clipboard.writeText(skill.id)}
								className="hover:cursor-pointer"
							>
								Copy Skill ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="hover:cursor-pointer text-red-500"
								onClick={async () => {
									const success = await onDeleteSkill(row.original.id);
									if (success) await queryClient.invalidateQueries({ queryKey: ['skills'] });
								}}
							>
								Delete
							</DropdownMenuItem>
							{/* <DropdownMenuItem className="hover:cursor-pointer">View Skill details</DropdownMenuItem> */}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: skills ?? [],
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
				table.getColumn('powerskill')?.setFilterValue(filterValue);
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
						<h2 className="text-center text-xl font-semibold text-gray-900">Create Power Skill</h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="powerskill" className="text-sm font-medium text-gray-700">
								Power Skill <span className="text-red-500">*</span>
							</label>
							<Input
								{...register('skill')}
								autoFocus
								type="text"
								id="skill"
								aria-label="Power Skill"
								placeholder="Skill"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.skill && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.skill && <FormErrorMessage error={errors.skill} errorMsg={errors.skill.message} />}
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
								placeholder="Filter power skills..."
								defaultValue={(table.getColumn('powerskill')?.getFilterValue() as string) ?? ''}
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
