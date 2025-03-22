'use client';

import NavItems from '@/components/common/NavItems';

const Dashboard = () => {
	return (
		<>
			<div className="mb-5">
				<header className="flex my-3 p-4">
					{/* <h1 className="text-4xl font-semibold">Dashboard</h1> */}

					<NavItems heading="Dashboard" />
				</header>
			</div>
		</>
	);
};

export default Dashboard;
