import { cn } from '@/lib/utils';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className={cn('space-y-5 divide-y-2 divide-gray-400 bg-abeg-primary p-10 text-white md:p-20')}>
			<div className="text-center">
				<h3 className="text-2xl font-semibold">100minds</h3>
			</div>
			<div className="pt-5 text-center text-sm text-gray-300">&copy; {currentYear} 100minds. All rights reserved.</div>
		</footer>
	);
};

export default Footer;