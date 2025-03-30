import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import Journeyy from '@/components/dashboard/Journey';
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
