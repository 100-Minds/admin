import DashboardLayout from '../dashboard/layout';
import { generatePageMetadata } from '@/components/common/PageMetaData';
import Quizz from '@/components/dashboard/Quiz';
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
	return generatePageMetadata({
		title: 'Quiz - 100 Minds',
		content: 'Manage quizzes and collaborate effectively with 100 Minds Dashboard',
		url: 'https://admin-mmyv.onrender.com/quiz',
	});
};

export default function Quiz() {
	return (
		<DashboardLayout heading="Quiz">
			<div className="mb-5">
				<div className="flex items-center justify-center">
					<Quizz />
				</div>
			</div>
		</DashboardLayout>
	);
}
