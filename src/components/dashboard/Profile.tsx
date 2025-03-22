'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/store';
import Image from 'next/image';

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
					<AvatarFallback>
						<Image src="/icons/Frame 7.svg" alt="Fallback Icon" width={100} height={100} />
					</AvatarFallback>
				</Avatar>

				<div className="flex flex-col">
					<span className="text-sm font-semibold">{`${truncateText(`${user[0].firstName} ${user[0].lastName}`, 15)}`}</span>
					<span className="text-[12px] text-gray-400">{truncateText(user[0]?.email, 20)}</span>
				</div>
			</div>
		</>
	);
}
