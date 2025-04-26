import DashboardLayout from '../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import LessonEditForm from '@/components/dashboard/LessonEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: Promise<{ id: string }> }): Promise<Metadata> => {
	const params = await props.params;
	return generatePageMetadata({
		title: `Edit Lesson - 100 Minds`,
		content: `Edit course details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${params.id}/lesson`,
	});
};

export default async function EditLesson(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;

	return (
		<DashboardLayout heading="Edit Lesson">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<LessonEditForm courseId={params.id} />
				</div>
			</div>
		</DashboardLayout>
	);
}
