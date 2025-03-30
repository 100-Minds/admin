import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
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
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2 sticky top-[-20px] z-30 backdrop-blur-sm">
					<NavItems heading="Power Skills" />
				</header>

				<div className="flex items-center justify-center">
					<PowerSkill />
				</div>
			</div>
		</DashboardLayout>
	);
}
