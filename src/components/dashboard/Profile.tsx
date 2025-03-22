'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/store';

export default function Profile() {
	const { user } = useSession((state) => state);
	if (!user) return null;

	const truncateText = (text: string, maxLength: number) => {
		if (!text) return '';
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
	};

	return (
		<>
			<div className="flex items-center gap-2 p-2 rounded-xl bg-[#ffffff] mt-auto">
				<Avatar>
					<AvatarImage src={`${user[0].photo}`} />
					<AvatarFallback>{`${user[0].firstName[0]} ${user[0].lastName[0]}`}</AvatarFallback>
				</Avatar>

				<div className="flex flex-col">
					<span className="text-sm font-semibold">{`${truncateText(`${user[0].firstName} ${user[0].lastName}`, 15)}`}</span>
					<span className="text-[12px] text-gray-400">{truncateText(user[0]?.email, 20)}</span>
				</div>
			</div>
		</>
	);
}
