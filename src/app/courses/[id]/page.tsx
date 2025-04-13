import DashboardLayout from '../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import CourseEditForm from '@/components/dashboard/CourseEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: Promise<{ id: string }> }): Promise<Metadata> => {
    const params = await props.params;
    return generatePageMetadata({
		title: `Edit Course - 100 Minds`,
		content: `Edit course details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${params.id}`,
	});
};

export default async function EditCourse(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return (
		<DashboardLayout heading="Edit Course">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<CourseEditForm courseId={params.id} />
				</div>
			</div>
		</DashboardLayout>
	);
}
