import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import Teamm from '@/components/dashboard/Team';
export default function Teams() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Teams" />
				</header>

				<div className="flex items-center justify-center">
					<Teamm />
				</div>
			</div>
		</DashboardLayout>
	);
}
