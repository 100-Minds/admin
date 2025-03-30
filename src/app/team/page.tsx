import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Teamm from '@/components/dashboard/Team';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Teams - 100 Minds',
		content: 'Manage your teams and collaborate effectively with 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/team',
	});
};

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
