'use client';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import ForgotPasswordPage from './ForgotPassword';
import UpdateProfile from './UpdateProfile';
import UpdateOrganization from './UpdateOrganization';
import { useState } from 'react';
import { useSession } from '@/store';

export default function Settings() {
	const { user } = useSession((state) => state);
	const [activeSection, setActiveSection] = useState<'updateProfile' | 'updateOrganization' | 'ForgotPassword' | null>(
		'updateProfile'
	);

	const handleOpen = (section: 'updateProfile' | 'updateOrganization' | 'ForgotPassword') => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	return (
		<>
			<div className="flex flex-col w-full space-y-4">
				<Collapsible open={activeSection === 'updateProfile'} onOpenChange={() => handleOpen('updateProfile')}>
					<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
						Update Profile
					</CollapsibleTrigger>
					<CollapsibleContent className="w-full">
						<UpdateProfile />
					</CollapsibleContent>
				</Collapsible>

				{user && user[0]?.accountType === 'organization' && (
					<Collapsible
						open={activeSection === 'updateOrganization'}
						onOpenChange={() => handleOpen('updateOrganization')}
					>
						<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
							Update Organization
						</CollapsibleTrigger>
						<CollapsibleContent className="w-full">
							<UpdateOrganization />
						</CollapsibleContent>
					</Collapsible>
				)}

				<Collapsible open={activeSection === 'ForgotPassword'} onOpenChange={() => handleOpen('ForgotPassword')}>
					<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer mb-10">
						Forgot Password
					</CollapsibleTrigger>
					<CollapsibleContent className="w-full max-h-96 overflow-y-auto ">
						<ForgotPasswordPage />
					</CollapsibleContent>
				</Collapsible>
			</div>
		</>
	);
}
