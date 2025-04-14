import DashboardLayout from '../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import SkillEdit from '@/components/dashboard/EditPowerSkills';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: Promise<{ id: string }> }): Promise<Metadata> => {
	const params = await props.params;
	return generatePageMetadata({
		title: `Edit Skill - 100 Minds`,
		content: `Edit skill details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/power-skills/${params.id}`,
	});
};

export default async function EditPowerSkill(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;

	return (
		<DashboardLayout heading="Edit Skill">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<SkillEdit skillId={params.id} />
				</div>
			</div>
		</DashboardLayout>
	);
}
