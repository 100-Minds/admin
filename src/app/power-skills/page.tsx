import DashboardLayout from '../dashboard/layout';
import NavItems from '@/components/common/NavItems';
import PowerSkill from '@/components/dashboard/PowerSkills';
export default function PowerSkills() {
	return (
		<DashboardLayout>
			<div className="mb-5">
				<header className="flex mb-7 p-4 pt-2">
					<NavItems heading="Users" />
				</header>

				<div className="flex items-center justify-center">
					<PowerSkill />
				</div>
			</div>
		</DashboardLayout>
	);
}
