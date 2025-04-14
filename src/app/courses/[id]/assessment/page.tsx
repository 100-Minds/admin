import DashboardLayout from '../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import AddAssessments from '@/components/dashboard/Assessments';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: Promise<{ id: string }> }): Promise<Metadata> => {
	const params = await props.params;
	return generatePageMetadata({
		title: `Add Assessment - 100 Minds`,
		content: `Add course self assessment's with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${params.id}/assessment`,
	});
};

export default async function AddAssessment(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
    
	return (
		<DashboardLayout heading="Assessment">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<AddAssessments courseId={params.id} />
				</div>
			</div>
		</DashboardLayout>
	);
}
