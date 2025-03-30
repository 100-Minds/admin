import type { ReactNode } from 'react';

interface AuthLayoutProps {
	children: ReactNode;
	heading: string;
	greeting: string;
	withHeader?: boolean;
	hasSuccess?: boolean;
}

export default function AuthLayout({
	children,
	heading,
	greeting,
	withHeader = false,
	hasSuccess = false,
}: AuthLayoutProps) {
	return (
		<main className="flex w-full items-center justify-center bg-white mb-auto mt-20" role="main">
			<section className="w-full max-w-md bg-white p-8" aria-label="Authentication form">
				<div className="flex flex-col items-center space-y-4">
					{withHeader && (
						<>
							<div className="bg-[#509999] text-white rounded-full w-12 h-12 flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="#FFFFFF"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									className="w-6 h-6"
								>
									<path
										stroke="#509999"
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
									/>
								</svg>
							</div>

							<div className="text-center space-y-2">
								<h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{heading}</h2>
								<p className="text-sm text-gray-600">{greeting}</p>
							</div>
						</>
					)}
					{/* <LogoBanner /> Reintroduced LogoBanner */}

					{hasSuccess && <p className="text-green-600 text-sm text-center">Success!</p>}
					{children}
				</div>
			</section>
		</main>
	);
}
