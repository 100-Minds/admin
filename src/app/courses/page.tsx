import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Course from '@/components/dashboard/Course';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Courses - 100 Minds',
		content: 'Explore and manage courses with 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/courses',
	});
};

export default function Courses() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Courses" />
				</header>

				<div className="flex items-center justify-center">
					<Course />
				</div>
			</div>
		</DashboardLayout>
	);
}
