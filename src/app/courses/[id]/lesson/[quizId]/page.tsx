import DashboardLayout from '../../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import QuizEditForm from '@/components/dashboard/QuizEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: {
	params: Promise<{ id: string; lessonId: string; quizId: string }>;
}): Promise<Metadata> => {
	const { id, quizId, lessonId } = await props.params;

	return generatePageMetadata({
		title: `Edit QuizId - 100 Minds`,
		content: `Edit Quiz details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${id}/lesson/${lessonId}/quiz/${quizId}`,
	});
};

export default async function EditQuiz(props: { params: Promise<{ id: string; lessonId: string; quizId: string }> }) {
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
