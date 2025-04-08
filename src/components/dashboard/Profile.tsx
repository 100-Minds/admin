'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VerifiedIcon } from '../common';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function Profile() {
	const { user } = useSession((state) => state);
	const [profileImage, setProfileImage] = useState(user && user[0].photo);
	const router = useRouter();

	useEffect(() => {
		if (user && user[0]) {
			setProfileImage(user[0].photo || '');
		}
	}, [user]);

	const truncateText = (text: string, maxLength: number) => {
		if (!text) return '';
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
	};

	return (
		<div className="mt-auto">
			<div
				className="flex items-center gap-2 p-2 rounded-xl bg-white cursor-pointer relative"
				onClick={() => router.push('/settings')}
			>
				{user && user[0]?.accountType === 'organization' && (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="absolute -top-1 -right-1 bg-blue-400 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
								<VerifiedIcon className="h-6 w-6" />
							</span>
						</TooltipTrigger>
						<TooltipContent side="top" className="">
							<p>{user && user[0].organizationName}</p>
						</TooltipContent>
					</Tooltip>
				)}
				<Avatar>
					<AvatarImage src={profileImage || ''} className="object-cover w-full h-full" />
					<AvatarFallback>
						<Image src="/icons/Frame 7.svg" alt="Fallback Icon" width={100} height={100} />
					</AvatarFallback>
				</Avatar>
				<div className="hidden mds:flex flex-col">
					<span className="text-sm font-semibold">{`${truncateText(`${user && user[0].firstName} ${user && user[0].lastName}`, 15)}`}</span>
					<span className="text-[12px] text-gray-400">{truncateText((user && user[0].email) || '', 20)}</span>
				</div>
			</div>
		</div>
	);
}
