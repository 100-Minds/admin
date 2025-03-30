// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Auth from '@/components/Protect';
import { useInitSession } from '@/store/useSession';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 5 * 60 * 1000,
			staleTime: 1 * 60 * 1000,
		},
	},
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const { getSession } = useInitSession((state) => state.actions);

	useEffect(() => {
		void getSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// useEffect(() => {
	//   console.log("Calling getSession");
	//   getSession(true);
	// }, []);

	return (
		<html lang="en">
			<body className={inter.className}>
				<QueryClientProvider client={queryClient}>
					{/* Exclude auth protection for the main page */}
					<Auth exclude={['/']}>{children}</Auth>
					<Toaster richColors position="top-right" />
					{/* <ReactQueryDevtools initialIsOpen={false} /> */}
				</QueryClientProvider>
			</body>
		</html>
	);
}
