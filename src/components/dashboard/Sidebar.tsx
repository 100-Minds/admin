'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardIcon, UsersIcon, LogoutIcon } from '../common';

const menuItems = [
	{ name: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
	{ name: 'Users', icon: UsersIcon, path: '/users' },
];

const bottomMenuItems = [{ name: 'Logout', icon: LogoutIcon, path: '/logout' }];
export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-[250px] bg-white text-[#000000] flex flex-col p-4 space-y-6 h-screen py-9 overflow-y-auto">
			<h1 className="font-bold text-[#000000] text-4xl mb-10 mt-7">Logo</h1>

			<nav className="flex flex-col gap-4 flex-grow">
				{menuItems.map((item) => (
					<Link key={item.name} href={item.path}>
						<div className="relative flex items-center">
							{pathname === item.path && (
								<div className="absolute left-[-10px] w-1 h-[70%] bg-[#509999] rounded-r-lg" />
							)}

							<span
								className={cn(
									'flex items-center justify-between p-3 rounded-lg transition cursor-pointer text-xs pl-5 w-full',
									pathname === item.path ? 'bg-[#F3F3F3]' : 'hover:bg-[#F3F3F3]'
								)}
							>
								<div className="flex items-center gap-3 text-[14px]">
									{item.icon && <item.icon className="text-black w-5 h-5" />}
									{item.name}
								</div>

								{pathname === item.path && <ChevronRight className="w-5 h-5" />}
							</span>
						</div>
					</Link>
				))}
			</nav>

			<div className="flex flex-col gap-4">
				{bottomMenuItems.map((item) => (
					<Link key={item.name} href={item.path}>
						<span
							className={cn(
								'flex items-center justify-between p-3 rounded-lg transition cursor-pointer text-xs text-red-800',
								pathname === item.path ? 'bg-[#F3F3F3]' : 'hover:bg-[#F3F3F3]'
							)}
						>
							<div className="flex items-center gap-3">
								{item.icon && <item.icon className=" w-5 h-5" />}
								{item.name}
							</div>
							{pathname === item.path && <ChevronRight className="w-5 h-5" />}
						</span>
					</Link>
				))}
			</div>
		</aside>
	);
}
