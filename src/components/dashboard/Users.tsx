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
import { FormErrorMessage } from '../common';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { SessionData } from '@/interfaces/ApiResponses';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SignUpType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function DataTable() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [error, setError] = React.useState<string | null>(null);
	const [selectKey, setSelectKey] = React.useState(0);
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SignUpType>({
		resolver: zodResolver(zodValidator('signup')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		data: users,
		isLoading: loading,
		error: queryError,
	} = useQuery<User[], Error>({
		queryKey: ['users'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<User[]>>('/user/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching users.');
			}
			if (!responseData?.data) {
				throw new Error('No user data returned');
			}
			toast.success('Users Fetched', { description: 'Successfully fetched users.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching users.';
			setError(errorMessage);
			toast.error('Failed to Fetch Users', { description: errorMessage });
		}
	}, [queryError]);

	const onSubmit: SubmitHandler<SignUpType> = async (data: SignUpType) => {
		try {
			setIsLoading(true);

			const { data: responseData, error } = await callApi<ApiResponse<SessionData>>('/auth/sign-up', {
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				password: data.password,
				role: data.role,
				username: data.username,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('User Created', { description: 'The user has been registered successfully.' });
				queryClient.invalidateQueries({ queryKey: ['users'] });
			}
		} catch (err) {
			toast.error('User Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			reset();
			setSelectKey((prev) => prev + 1);
		}
	};

	const onSuspendUser = async (userId: string, suspend: boolean) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/user/suspend-user`, {
				userId,
				suspend,
			});

			if (error) throw new Error(error.message);
			if (responseData?.status === 'success') {
				const action = suspend ? 'Suspended' : 'Unsuspended';
				toast.success(`User ${action}`, {
					description: responseData.message || `The user has been ${action.toLowerCase()} successfully.`,
				});
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Suspend Operation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

	const onPromoteUser = async (userId: string, makeAdmin: boolean) => {
		try {
			const { data: responseData, error } = await callApi<ApiResponse<null>>(`/user/make-admin`, {
				userId,
				makeAdmin,
			});

			if (error) throw new Error(error.message);

			if (responseData?.status === 'success') {
				const action = makeAdmin ? 'Promoted' : 'Demoted';
				toast.success(`User ${action}`, {
					description: responseData.message || `The user has been ${action.toLowerCase()} successfully.`,
				});
				return true;
			}
			return false;
		} catch (err) {
			toast.error('Promotion Operation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		}
	};

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
							<AvatarImage src={photo} className="object-cover w-full h-full"/>
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
							<DropdownMenuItem
								className="hover:cursor-pointer"
								onClick={async () => {
									const success = await onPromoteUser(row.original.id, row.original.role !== 'admin');
									if (success) await queryClient.invalidateQueries({ queryKey: ['users'] });
								}}
							>
								{row.original.role === 'user' ? 'Promote User' : 'Demote User'}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="hover:cursor-pointer text-red-500"
								onClick={async () => {
									const success = await onSuspendUser(row.original.id, !row.original.isSuspended);
									if (success) await queryClient.invalidateQueries({ queryKey: ['users'] });
								}}
							>
								{row.original.isSuspended ? 'Unsuspend User' : 'Suspend User'}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: users ?? [],
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

	return (
		<>
			<div className="flex flex-col w-full">
				<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
					<div className="flex flex-col items-center space-y-2">
						<h2 className="text-center text-xl font-semibold text-gray-900">Register A User</h2>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label htmlFor="email" className="text-sm font-medium text-gray-700">
								Email<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('email')}
								autoFocus
								type="email"
								id="email"
								aria-label="Email"
								placeholder="Email Address"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.email && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.email && <FormErrorMessage error={errors.email} errorMsg={errors.email.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								First Name<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('firstName')}
								type="text"
								id="firstName"
								aria-label="First Name"
								placeholder="First Name"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.firstName && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.firstName && <FormErrorMessage error={errors.firstName} errorMsg={errors.firstName.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Last Name<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('lastName')}
								type="text"
								id="name"
								aria-label="Last Name"
								placeholder="Last Name"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.lastName && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.lastName && <FormErrorMessage error={errors.lastName} errorMsg={errors.lastName.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								User Name<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('username')}
								type="text"
								id="username"
								aria-label="User Name"
								placeholder="User Name"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.username && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.username && <FormErrorMessage error={errors.username} errorMsg={errors.username.message} />}
						</div>

						<div className="mt-4">
							<label className="text-sm font-medium text-gray-700">
								Select Role <span className="text-red-500">*</span>
							</label>
							<Select onValueChange={(value) => setValue('role', value, { shouldValidate: true })} key={selectKey}>
								<SelectTrigger className="w-full min-h-[40px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
									<SelectValue placeholder="Choose a role" />
								</SelectTrigger>
								<SelectContent
									position="popper"
									className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md w-full"
								>
									<SelectItem value="user" className="w-full">
										User
									</SelectItem>
									<SelectItem value="admin" className="w-full">
										Admin
									</SelectItem>
								</SelectContent>
							</Select>
							{errors.role && <FormErrorMessage error={errors.role} errorMsg={errors.role.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Password<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('password')}
								type="password"
								id="password"
								aria-label="Password"
								placeholder="password"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.password && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.password && <FormErrorMessage error={errors.password} errorMsg={errors.password.message} />}
						</div>

						<div className="mt-4">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Confirm Password<span className="text-red-500">*</span>
							</label>
							<Input
								{...register('confirmPassword')}
								type="password"
								id="confirmPassword"
								aria-label="confirmPassword"
								placeholder="Confirm Password"
								className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
									errors.confirmPassword && 'border-red-500 ring-2 ring-red-500'
								}`}
							/>
							{errors.confirmPassword && (
								<FormErrorMessage error={errors.confirmPassword} errorMsg={errors.confirmPassword.message} />
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
