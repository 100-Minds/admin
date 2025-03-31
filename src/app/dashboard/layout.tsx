'use client';

import { useState, type ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { MobileSidebar } from '@/components/dashboard/Sidebar';
import NavItems from '@/components/common/NavItems';

export default function DashboardLayout({ heading, children }: { heading: string; children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className="flex h-screen">
				<Sidebar />
				<main className="flex-1 bg-white p-5 overflow-auto scrollbar-hide mb-5">
					<header className="flex pb-7 p-4 pt-2 w-full sticky top-[-20px] backdrop-blur-sm z-30 bg-gray-100/70 rounded-t-xl">
						<NavItems heading={heading || 'Dashboard'} isOpen={isOpen} setIsOpen={setIsOpen} />
					</header>
					<section className="bg-[#F8F8F8] p-4 rounded-b-xl">{children}</section>
					<MobileSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
				</main>
			</div>
		</>
	);
}
