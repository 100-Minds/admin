'use client';

import NavItems from '@/components/dashboard/NavItems';

const Dashboard = () => {
	return (
		<>
			<div className="mb-12">
				<header className="flex  my-3 p-4">
					{/* <h1 className="text-4xl font-semibold">Dashboard</h1> */}

					<NavItems />
				</header>
			</div>
		</>
	);
};

export default Dashboard;
