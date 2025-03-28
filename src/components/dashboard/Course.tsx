'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

import Modulee from './Module';
import Coursess from './Courses';
import Lesson from './Lessons';

export default function Course() {
	const [activeSection, setActiveSection] = useState<'module' | 'courses' | 'lesson' | null>('module');

	const handleOpen = (section: 'module' | 'courses' | 'lesson') => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	return (
		<div className="flex flex-col w-full space-y-4">
			<Collapsible open={activeSection === 'module'} onOpenChange={() => handleOpen('module')}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Module
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full mt-10">
					<Modulee />
				</CollapsibleContent>
			</Collapsible>

			<Collapsible open={activeSection === 'courses'} onOpenChange={() => handleOpen('courses')}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Courses
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full">
					<Coursess />
				</CollapsibleContent>
			</Collapsible>

			<Collapsible open={activeSection === 'lesson'} onOpenChange={() => handleOpen('lesson')}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Lesson
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full max-h-96 overflow-y-auto">
					<Lesson />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
