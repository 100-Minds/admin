import DashboardLayout from '../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Modulee from '@/components/dashboard/Module';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Course Modules - 100 Minds',
		content: 'Explore and manage your course modules with 100 Minds',
		url: 'https://admin-mmyv.onrender.com/modules',
	});
};

export default function Modules() {
	return (
		<DashboardLayout heading="Modules">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Modulee />
				</div>
			</div>
		</DashboardLayout>
	);
}
