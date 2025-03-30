'use client';

import NavItems from '@/components/common/NavItems';
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
				<header className="flex mb-7 p-4 pt-2 w-full sticky top-[-20px] z-30 backdrop-blur-sm">
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
