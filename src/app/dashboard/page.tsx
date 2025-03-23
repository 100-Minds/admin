'use client';

import NavItems from '@/components/common/NavItems';
import DashboardStats from '@/components/dashboard/Dashboard';

const Dashboard = () => {
	return (
		<>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2">
					<NavItems heading="Dashboard" />
				</header>

				<div className="p-4 pt-0">
					<DashboardStats />
				</div>
			</div>
		</>
	);
};

export default Dashboard;
