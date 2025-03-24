// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

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

//import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';
import Auth from '@/components/Protect';
import { useInitSession } from '@/store/useSession';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: "Your App",
//   description: "Your app description",
// };

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

	// function QueryProvider({ children }: { children: ReactNode }) {
	// 	const [queryClient] = useState(
	// 		() =>
	// 			new QueryClient({
	// 				defaultOptions: {
	// 					queries: {
	// 						gcTime: 5 * 60 * 1000,
	// 						staleTime: 1 * 60 * 1000,
	// 					},
	// 				},
	// 			})
	// 	);

	// 	return (
	// 		<QueryClientProvider client={queryClient}>
	// 			{children}
	// 			<ReactQueryDevtools initialIsOpen={false} />
	// 		</QueryClientProvider>
	// 	);
	// }

	return (
		<html lang="en">
			<body className={inter.className}>
				<QueryClientProvider client={queryClient}>
					{/* <QueryProvider> */}
					{/* Exclude auth protection for the main page */}
					<Auth exclude={['/']}>{children}</Auth>
					<Toaster richColors position="top-right" />
					{/* </QueryProvider> */}
				</QueryClientProvider>
			</body>
		</html>
	);
}
