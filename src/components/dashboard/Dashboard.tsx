'use client';

import { useEffect, useState } from 'react';
import { Users, Drama, Zap, BookOpen, Book } from 'lucide-react';
import { toast } from 'sonner';
import { callApi } from '@/lib';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import React from 'react';
import { ApiResponse } from '@/interfaces';

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	selected: boolean;
	onClick: () => void;
}

interface Statistics {
	totalUsers: number;
	totalRolePlay: number;
	totalTeams: number;
	totalPowerSkill: number;
	totalLearningJourney: number;
	totalCourses: number;
}

function StatCard({ title, value, icon, selected, onClick }: StatCardProps) {
	const updatedAt = format(new Date(Date.now()), 'dd/MM/yyyy');

	return (
		<Card
			className="p-6 min-h-[160px] transition-all duration-300 cursor-pointer outline-none"
			style={
				selected
					? { background: 'linear-gradient(to right, #407878, #60B8B8)', color: 'white' }
					: { background: 'white' }
			}
			onMouseEnter={(e) =>
				!selected &&
				(e.currentTarget.style.background = 'linear-gradient(to right, #407878, #60B8B8)') &&
				(e.currentTarget.style.color = 'white')
			}
			onMouseLeave={(e) =>
				!selected && (e.currentTarget.style.background = 'white') && (e.currentTarget.style.color = '')
			}
			onClick={onClick}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick();
				}
			}}
		>
			<CardContent className="p-0">
				<div className="flex items-center space-x-2">
					<div className="p-1">{icon}</div>
					<h3 className="text-sm font-medium">{title}</h3>
				</div>
				<p className="text-2xl font-semibold mt-2">{value}</p>
				<p className="text-xs mt-1">Updated on {updatedAt}</p>
			</CardContent>
		</Card>
	);
}

export default function DashboardStats() {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalRolePlay: 0,
		totalTeams: 0,
		totalPowerSkill: 0,
		totalLearningJourney: 0,
		totalCourses: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			setError(null);

			try {
				const { data: apiData, error } = await callApi<ApiResponse<Statistics[]>>('/statistics/stats');

				if (error) {
					setError(error.message || 'Something went wrong while fetching stats.');
					toast.error('Failed to Fetch Stats', {
						description: error.message || 'Something went wrong while fetching stats.',
					});
				} else if (apiData?.data) {
					setStats(apiData?.data[0]);
					toast.success('Stats Fetched', {
						description: 'Successfully fetched statistics.',
					});
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching stats.';
				setError(errorMessage);
				toast.error('Failed to Fetch Stats', {
					description: errorMessage,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className="py-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, index) => (
						<Card key={index} className="p-4 min-h-[160px]">
							<CardContent className="p-0">
								<div className="flex items-center space-x-2">
									<div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
									<div className="h-4 w-24 bg-gray-200 animate-pulse" />
								</div>
								<div className="h-6 w-16 bg-gray-200 animate-pulse mt-2" />
								<div className="h-3 w-32 bg-gray-200 animate-pulse mt-1" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return <div className="py-6 text-center text-red-500">Error: {error}</div>;
	}

	const statItems = [
		{
			title: 'Total Users',
			value: stats.totalUsers,
			icon: <Users className="h-5 w-5 text-[#509999]" />,
		},
		{
			title: 'Total Role Play',
			value: stats.totalRolePlay,
			icon: <Drama className="h-5 w-5 text-[#509999]" />,
		},
		{
			title: 'Total Teams',
			value: stats.totalTeams,
			icon: <Users className="h-5 w-5 text-[#509999]" />,
		},
		{
			title: 'Total Power Skill',
			value: stats.totalPowerSkill,
			icon: <Zap className="h-5 w-5 text-[#509999]" />,
		},
		{
			title: 'Total Learning Journey',
			value: stats.totalLearningJourney,
			icon: <BookOpen className="h-5 w-5 text-[#509999]" />,
		},
		{
			title: 'Total Courses',
			value: stats.totalCourses,
			icon: <Book className="h-5 w-5 text-[#509999]" />,
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{statItems.map((stat, index) => {
				const isSelected = selectedCardIndex === index;
				const iconWithColor = React.cloneElement(stat.icon, {
					style: { color: isSelected ? 'white' : '#509999' },
				});

				return (
					<StatCard
						key={index}
						title={stat.title}
						value={stat.value}
						icon={iconWithColor}
						selected={isSelected}
						onClick={() => setSelectedCardIndex(index)}
					/>
				);
			})}
		</div>
	);
}
