'use client';

import { useState } from 'react';
import Link from 'next/link';

const Dashboard = () => {
	const [activePage, setActivePage] = useState<keyof typeof pages>('home');

	const pages = {
		home: <h2 className="text-xl font-semibold">Welcome to the Test Dashboard</h2>,
		tests: <h2 className="text-xl font-semibold">Test Page: Select a test</h2>,
		results: <h2 className="text-xl font-semibold">Results Page: View your scores</h2>,
		settings: <h2 className="text-xl font-semibold">Settings Page: Adjust preferences</h2>,
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<aside className="w-64 bg-white shadow-lg p-6 flex flex-col space-y-4">
				<h1 className="text-xl font-bold text-gray-700">Test Dashboard</h1>
				<nav className="flex flex-col space-y-2">
					{(Object.keys(pages) as Array<keyof typeof pages>).map((page) => (
						<button
							key={page}
							className={`p-2 text-left rounded-lg transition ${
								activePage === page ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-200'
							}`}
							onClick={() => setActivePage(page)}
						>
							{page.charAt(0).toUpperCase() + page.slice(1)}
						</button>
					))}
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6">
				<header className="bg-white shadow-md p-4 rounded-md mb-4 flex justify-between items-center">
					<h2 className="text-lg font-medium">Dashboard</h2>
					<Link href="/logout" className="text-red-500 hover:underline">
						Logout
					</Link>
				</header>
				<section className="bg-white p-6 rounded-md shadow-md">{pages[activePage]}</section>
			</main>
		</div>
	);
};

export default Dashboard;
