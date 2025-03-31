import DashboardLayout from '../dashboard/layout';
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
		<DashboardLayout heading="Courses">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Course />
				</div>
			</div>
		</DashboardLayout>
	);
}
