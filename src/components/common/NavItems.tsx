'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon, BellIcon } from '.';
import Profile from '../dashboard/Profile';
import { Hamburger } from '../common';
import { useState } from 'react';
import { MobileSidebar } from '../dashboard/Sidebar';

export default function NavItems({ heading }: { heading: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full">
			<div>
				<div className="w-full flex items-center gap-4 justify-between">
					<div className="flex items-center gap-4">
						<button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer bg-white rounded-xl p-2.5 md:hidden">
							<Hamburger className="w-6 h-6" />
						</button>
						<h1 className="text-xl sms:text-2xl sm:text-4xl font-semibold">{heading}</h1>
					</div>

					<div className="relative flex-1 max-w-xl mx-10 hidden mdd:flex">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							type="text"
							placeholder="Search for anything"
							className="pl-10 pr-4 py-[26px] rounded-xl bg-white text-black border-none text-sm placeholder:text-[12px]"
						/>
					</div>

					<div className="flex items-center gap-2">
						<div className="relative cursor-pointer bg-white rounded-xl p-2.5 lg:3.5 hidden sms:flex">
							<BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
								3
							</span>
						</div>

						<Profile />
					</div>
				</div>

				<div className="relative flex-1 w-full flex mdd:hidden mt-6">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<Input
						type="text"
						placeholder="Search for anything"
						className="pl-10 pr-4 py-[23px] rounded-xl bg-white text-black border-none text-sm placeholder:text-[12px]"
					/>
				</div>
			</div>

			{isOpen && <MobileSidebar isOpen={isOpen} setIsOpen={setIsOpen} />}
		</div>
	);
}
