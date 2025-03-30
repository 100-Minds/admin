import { type ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<div className="flex h-screen">
				<Sidebar />
				<main className="flex-1 bg-white p-5 overflow-auto scrollbar-hide">
					<section className="bg-[#F8F8F8] p-4 rounded-xl">{children}</section>
				</main>
			</div>
		</>
	);
}
