import DashboardLayout from '../dashboard/layout';
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
		<DashboardLayout heading="Teams">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Teamm />
				</div>
			</div>
		</DashboardLayout>
	);
}
