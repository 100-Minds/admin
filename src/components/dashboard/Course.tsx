'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

import Modulee from './Module';
import Coursess from './Courses';

export default function Course() {
	const [isModuleOpen, setIsModuleOpen] = useState(true);
	const [isCoursesOpen, setIsCoursesOpen] = useState(false);

	return (
		<div className="flex flex-col w-full space-y-4">
			<Collapsible open={isModuleOpen} onOpenChange={setIsModuleOpen}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Module
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full mt-10">
					<Modulee />
				</CollapsibleContent>
			</Collapsible>

			<Collapsible open={isCoursesOpen} onOpenChange={setIsCoursesOpen}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Courses
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full">
					<Coursess />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
