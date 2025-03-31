import { generatePageMetadata } from '@/components/common/PageMetaData';
import DashboardStats from '@/components/dashboard/Dashboard';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Dashboard - 100 Minds',
		content: 'View your stats and manage your 100 Minds account',
		url: 'https://admin-mmyv.onrender.com/dashboard',
	});
};

const Dashboard = () => {
	return (
		<>
			<div className="mb-5 2xl:h-screen">
				<div className="p-4 pt-0">
					<DashboardStats />
				</div>
			</div>
		</>
	);
};

export default Dashboard;
