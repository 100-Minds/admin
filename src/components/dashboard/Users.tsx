'use client';

import * as React from 'react';
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import debounce from 'lodash/debounce';
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
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiResponse, User } from '@/interfaces';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { callApi } from '@/lib';

const columns: ColumnDef<User>[] = [
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
			const firstName = row.original.firstName;
			const lastName = row.original.lastName;
			const photo = row.original.photo;
			return (
				<div className="flex items-center space-x-2">
					<Avatar>
						<AvatarImage src={photo} />
						<AvatarFallback>
							<Image src="/icons/Frame 7.svg" alt="Fallback Icon" width={100} height={100} />
						</AvatarFallback>
					</Avatar>
					<span className="lowercase ml-3">{`${firstName} ${lastName}`}</span>
				</div>
			);
		},
		accessorFn: (row) => `${row.firstName} ${row.lastName}`,
	},
	{
		accessorKey: 'email',
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Email
					<ArrowUpDown />
				</Button>
			);
		},
		cell: ({ row }) => <div className="lowercase ml-3">{row.getValue('email')}</div>,
	},
	{
		accessorKey: 'username',
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					User Name
					<ArrowUpDown />
				</Button>
			);
		},
		cell: ({ row }) => <div className="lowercase ml-3">{row.getValue('username')}</div>,
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => <div className="lowercase">{row.getValue('role')}</div>,
	},
	{
		accessorKey: 'isSuspended',
		header: () => <div className="ml-5">Suspended</div>,
		cell: ({ row }) => {
			const suspend = row.getValue('isSuspended') as boolean;
			return <div className="ml-5">{suspend.toString()}</div>;
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
			const user = row.original;

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
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)} className="hover:cursor-pointer">
							Copy user ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="hover:cursor-pointer">
							{user.role === 'user' ? 'Promote user' : 'Demote user'}
						</DropdownMenuItem>
						<DropdownMenuItem className="hover:cursor-pointer text-red-500">
							{user.isSuspended === true ? 'UnSuspend user' : 'Suspend user'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function DataTable() {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [users, setUsers] = React.useState<User[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			setError(null);

			try {
				const { data: apiData, error } = await callApi<ApiResponse<User[]>>('/user/all');

				if (error) {
					setError(error.message || 'Something went wrong while fetching users.');
					toast.error('Failed to Fetch Users', {
						description: error.message || 'Something went wrong while fetching users.',
					});
				} else if (apiData?.data) {
					setUsers(apiData.data);
					toast.success('Users Fetched', {
						description: 'Successfully fetched users.',
					});
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching users.';
				setError(errorMessage);
				toast.error('Failed to Fetch Users', {
					description: errorMessage,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const table = useReactTable({
		data: users,
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
				table.getColumn('email')?.setFilterValue(filterValue);
			}, 2000);
			filterFunc(value);
		},
		[table]
	);

	if (loading) {
		return (
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
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
		);
	}

	if (error) {
		return (
			<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
				<p>Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="w-full bg-white rounded-md px-6">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter emails..."
					// value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
					// onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
					defaultValue={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
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
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
				{/* <div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						className="hover:cursor-pointer"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="hover:cursor-pointer"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div> */}
				<Pagination className="ml-auto mb-0">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => table.previousPage()}
								className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'}
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
	);
}
