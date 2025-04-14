import DashboardLayout from '../../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import AssessmentEditForm from '@/components/dashboard/AssessmentEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: {
	params: { id: string; assessmentId: string };
}): Promise<Metadata> => {
	const { id, assessmentId } = await props.params;

	return generatePageMetadata({
		title: `Edit Assessment - 100 Minds`,
		content: `Edit assessment details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${id}/assessment/${assessmentId}`,
	});
};

export default async function EditAssessment(props: { params: { id: string; assessmentId: string } }) {
	const { assessmentId } = await props.params;

	return (
		<DashboardLayout heading="Edit">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<AssessmentEditForm assessmentId={assessmentId} />
				</div>
			</div>
		</DashboardLayout>
	);
}
