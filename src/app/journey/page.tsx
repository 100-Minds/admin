import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Journeyy from '@/components/dashboard/Journey';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Learning Journey - 100 Minds',
		content: 'Track and enhance your learning journey with 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/journey',
	});
};

export default function LearningJourney() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Learning Journey" />
				</header>

				<div className="flex items-center justify-center">
					<Journeyy />
				</div>
			</div>
		</DashboardLayout>
	);
}
