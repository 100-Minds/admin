import { DataTable } from '@/components/dashboard/Users';
import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Users - 100 Minds',
		content: 'View and manage user accounts in 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/users',
	});
};

export default function Users() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Users" />
				</header>

				<div className="flex items-center justify-center">
					<DataTable />
				</div>
			</div>
		</DashboardLayout>
	);
}
