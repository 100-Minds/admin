import DashboardLayout from '../../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import QuizEditForm from '@/components/dashboard/QuizEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: { courseId: string; quizId: string } }): Promise<Metadata> => {
	const { courseId, quizId } = await props.params;

	return generatePageMetadata({
		title: `Edit QuizId - 100 Minds`,
		content: `Edit Quiz details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${courseId}/lesson/${quizId}`,
	});
};

export default async function EditQuiz(props: { params: { courseId: string; quizId: string } }) {
	const { quizId } = await props.params;

	return (
		<DashboardLayout heading="Edit Quiz">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<QuizEditForm quizId={quizId} />
				</div>
			</div>
		</DashboardLayout>
	);
}
