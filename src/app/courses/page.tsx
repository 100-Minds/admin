import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import Course from '@/components/dashboard/Course';
export default function Courses() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2">
					<NavItems heading="Courses" />
				</header>

				<div className="flex items-center justify-center">
					<Course />
				</div>
			</div>
		</DashboardLayout>
	);
}
