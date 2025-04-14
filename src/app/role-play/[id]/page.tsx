import DashboardLayout from '../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import RolePlayEdit from '@/components/dashboard/EditRolePlay';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: Promise<{ id: string }> }): Promise<Metadata> => {
	const params = await props.params;
	return generatePageMetadata({
		title: `Edit Role Play Scenario - 100 Minds`,
		content: `Edit role play with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/role-play/${params.id}`,
	});
};

export default async function EditRolePlay(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;

	return (
		<DashboardLayout heading="Edit Role Play">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<RolePlayEdit rolePlayId={params.id} />
				</div>
			</div>
		</DashboardLayout>
	);
}
