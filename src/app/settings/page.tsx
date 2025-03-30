import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
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
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Settings" />
				</header>

				<div className="flex items-center justify-center">
					<Settings />
				</div>
			</div>
		</DashboardLayout>
	);
}
