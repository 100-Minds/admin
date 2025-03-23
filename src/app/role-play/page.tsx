import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import RolePlays from '@/components/dashboard/RolePlay';
export default function RolePlay() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2">
					<NavItems heading="Role Play" />
				</header>

				<div className="flex items-center justify-center">
					<RolePlays />
				</div>
			</div>
		</DashboardLayout>
	);
}
