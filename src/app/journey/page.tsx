import DashboardLayout from '../dashboard/layout';
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
		<DashboardLayout heading="Learning Journey">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Journeyy />
				</div>
			</div>
		</DashboardLayout>
	);
}
