'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	const router = useRouter();

	return (
		<html>
			<body>
				<div className="flex min-h-screen w-full flex-col justify-center px-6 md:px-[9vw]">
					<div className="mb-12 flex w-fit items-center justify-center space-x-1 rounded-lg border px-[10px] py-1 md:mb-4">
						<div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#dcfae7]">
							<div className="h-[6px] w-[6px] rounded-full bg-abeg-primary" />
						</div>
						<p className="text-sm font-medium">500 error</p>
					</div>
					<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
						<div className="order-2 flex-1 md:order-1">
							<h1 className="mb-6 text-4xl font-bold text-primary md:text-6xl">Uh oh, an error occurred...</h1>
							<h3 className="text-lg md:max-w-[90%] md:text-xl">
								An error occurred: {error.message || 'Unknown server error'}
							</h3>
							<div className="my-12 flex flex-col gap-4 md:flex-row">
								<Button
									size="lg"
									className="cursor-pointer rounded-md border bg-[#509999] px-6 py-4 font-semibold text-white hover:bg-[#6fb7b7] md:text-lg"
									onClick={() => router.back()}
								>
									<div className="flex items-center space-x-2">
										<ArrowLeft size={24} />
										<span>Go back</span>
									</div>
								</Button>
								<Button
									size="lg"
									className="cursor-pointer rounded-md bg-[#509999] px-6 py-4 font-semibold text-white hover:bg-[#6fb7b7] md:text-lg"
									onClick={() => router.push('/dashboard')}
								>
									Go home
								</Button>
								<Button
									size="lg"
									className="cursor-pointer rounded-md bg-[#509999] px-6 py-4 font-semibold text-white hover:bg-[#6fb7b7] md:text-lg"
									onClick={reset}
								>
									Try again
								</Button>
							</div>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
