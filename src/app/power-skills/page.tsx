import DashboardLayout from '../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import PowerSkill from '@/components/dashboard/PowerSkills';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Power Skills - 100 Minds',
		content: 'Explore and develop your power skills with 100 Minds',
		url: 'https://admin-mmyv.onrender.com/power-skills',
	});
};

export default function PowerSkills() {
	return (
		<DashboardLayout heading="Power Skills">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<PowerSkill />
				</div>
			</div>
		</DashboardLayout>
	);
}
