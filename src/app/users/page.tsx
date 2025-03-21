import { DataTable } from '@/components/dashboard/Users';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/dashboard/NavItems';

type Payment = {
	id: string;
	amount: number;
	status: 'pending' | 'processing' | 'success' | 'failed';
	email: string;
};

const payments: Payment[] = [
	{
		id: '728ed52f',
		amount: 100,
		status: 'pending',
		email: 'm@example.com',
	},
	{
		id: '489e1d42',
		amount: 125,
		status: 'processing',
		email: 'example@gmail.com',
	},
	{
		id: '728ed52f',
		amount: 100,
		status: 'pending',
		email: 'm@example.com',
	},
	{
		id: '489e1d42',
		amount: 125,
		status: 'processing',
		email: 'example@gmail.com',
	},
	{
		id: '728ed52f',
		amount: 100,
		status: 'pending',
		email: 'm@example.com',
	},
	{
		id: '489e1d42',
		amount: 125,
		status: 'processing',
		email: 'example@gmail.com',
	},
	// ...
];

const columns: ColumnDef<Payment>[] = [
	{
		accessorKey: 'status',
		header: 'Status',
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
	{
		accessorKey: 'amount',
		header: 'Amount',
	},
];

export default function Users() {
	return (
		<DashboardLayout>
			<div className="mb-12">
				<header className="flex  my-3 p-4">
					<NavItems heading="Users" />
				</header>

				<div className="flex items-center justify-center">
					<DataTable columns={columns} data={payments} />
				</div>
			</div>
		</DashboardLayout>
	);
}
