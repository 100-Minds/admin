import DashboardLayout from '../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import RolePlays from '@/components/dashboard/RolePlay';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Role Play - 100 Minds',
		content: 'Engage in interactive role-playing scenarios with 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/role-play',
	});
};

export default function RolePlay() {
	return (
		<DashboardLayout heading="Role Play">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<RolePlays />
				</div>
			</div>
		</DashboardLayout>
	);
}
