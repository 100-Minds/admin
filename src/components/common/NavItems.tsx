import { Input } from '@/components/ui/input';
import { SearchIcon, BellIcon } from '.';
import Profile from '../dashboard/Profile';

export default function NavItems({ heading }: { heading: string }) {
	return (
		<div className="w-full flex items-center gap-4 justify-between">
			<h1 className="text-4xl font-semibold">{heading}</h1>

			<div className="relative flex-1 max-w-xl mx-10">
				<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
				<Input
					type="text"
					placeholder="Search for anything"
					className="pl-10 pr-4 py-[26px] rounded-xl bg-white text-black border-none text-sm placeholder:text-[12px]"
				/>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative cursor-pointer bg-white rounded-xl p-3.5">
					<BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
						3
					</span>
				</div>

				<Profile />
			</div>
		</div>
	);
}
