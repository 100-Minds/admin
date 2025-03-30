'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	DashboardIcon,
	UsersIcon,
	LogoutIcon,
	ThunderIcon,
	RolePlayIcon,
	BookIcon,
	OpenBookIcon,
	SettingsIcon,
	XIcon,
} from '../common';
import Image from 'next/image';

const menuItems = [
	{ name: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
	{ name: 'Users', icon: UsersIcon, path: '/users' },
	{ name: 'Power Skills', icon: ThunderIcon, path: '/power-skills' },
	{ name: 'Role Play', icon: RolePlayIcon, path: '/role-play' },
	{ name: 'Courses', icon: BookIcon, path: '/courses' },
	{ name: 'Journey', icon: OpenBookIcon, path: '/journey' },
	{ name: 'Teams', icon: UsersIcon, path: '/team' },
	{ name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const bottomMenuItems = [{ name: 'Logout', icon: LogoutIcon, path: '/logout' }];
export default function Sidebar() {
	const pathname = usePathname();

	return (
		<>
			<aside className="w-[220px] bg-white text-[#000000] flex-col p-4 space-y-6 h-screen py-5 overflow-y-auto hidden md:flex">
				<div className="flex items-center mb-11 mdd:mb-8 mt-7">
					<Image src="/icons/100minds-logo.png" alt="Logo" className="w-32 h-auto" width={100} height={100} />
				</div>

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
									pathname === item.path ? 'bg-[#F8F8F8]' : 'hover:bg-[#F8F8F8]'
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
		</>
	);
}

export function MobileSidebar({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const pathname = usePathname();

	return (
		<>
			<aside
				className={cn(
					'fixed top-0 left-0 h-screen bg-white text-[#000000] flex-col p-4 space-y-6 py-5 overflow-y-auto z-40 transition-transform duration-300 ease-in-out',
					isOpen ? 'translate-x-0 w-[70%] sms:w-[220px]' : '-translate-x-full delay-200',
					'md:hidden'
				)}
			>
				<div className="flex items-center justify-between mb-14">
					<div className="flex items-center mt-7">
						<Image src="/icons/100minds-logo.png" alt="Logo" className="w-28 h-auto" width={100} height={100} />
					</div>
					<button
						className="cursor-pointer bg-[#F3F3F3] rounded-xl p-2 md:hidden mt-5"
						onClick={() => setIsOpen(false)}
					>
						<XIcon className="w-5 h-5" />
					</button>
				</div>

				<nav className="flex flex-col gap-4 flex-grow">
					{menuItems.map((item) => (
						<Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}>
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
						<Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}>
							<span
								className={cn(
									'flex items-center justify-between p-3 rounded-lg transition cursor-pointer text-xs text-red-800',
									pathname === item.path ? 'bg-[#F8F8F8]' : 'hover:bg-[#F8F8F8]'
								)}
							>
								<div className="flex items-center gap-3">
									{item.icon && <item.icon className="w-5 h-5" />}
									{item.name}
								</div>
								{pathname === item.path && <ChevronRight className="w-5 h-5" />}
							</span>
						</Link>
					))}
				</div>
			</aside>

			{isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
		</>
	);
}
