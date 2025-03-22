import { DataTable } from '@/components/dashboard/Users';
import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
export default function Users() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex my-3 p-4">
					<NavItems heading="Users" />
				</header>

				<div className="flex items-center justify-center">
					<DataTable />
				</div>
			</div>
		</DashboardLayout>
	);
}
