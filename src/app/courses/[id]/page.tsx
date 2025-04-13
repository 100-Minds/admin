import DashboardLayout from '../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import CourseEditForm from '@/components/dashboard/CourseEditForm';
import { Metadata } from 'next';

export const generateMetadata = ({ params }: { params: { id: string } }): Metadata => {
	return generatePageMetadata({
		title: `Edit Course - 100 Minds`,
		content: `Edit course details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${params.id}`,
	});
};

export default function EditCourse({ params }: { params: { id: string } }) {
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
