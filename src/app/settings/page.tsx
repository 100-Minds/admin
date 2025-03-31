import DashboardLayout from '../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Settings from '@/components/dashboard/Settings';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Settings - 100 Minds',
		content: 'Customize your preferences and account settings in 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/settings',
	});
};

export default function Setting() {
	return (
		<DashboardLayout heading="Settings">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Settings />
				</div>
			</div>
		</DashboardLayout>
	);
}
