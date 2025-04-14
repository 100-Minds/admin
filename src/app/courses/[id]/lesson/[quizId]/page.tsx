import DashboardLayout from '../../../../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import QuizEditForm from '@/components/dashboard/QuizEditForm';
import { Metadata } from 'next';

export const generateMetadata = async (props: { params: { id: string; quizId: string } }): Promise<Metadata> => {
	const { id, quizId } = await props.params;

	return generatePageMetadata({
		title: `Edit QuizId - 100 Minds`,
		content: `Edit Quiz details with 100 Minds Dashboard`,
		url: `https://admin-mmyv.onrender.com/courses/${id}/lesson/${quizId}`,
	});
};

export default async function EditQuiz(props: { params: { id: string; quizId: string } }) {
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
