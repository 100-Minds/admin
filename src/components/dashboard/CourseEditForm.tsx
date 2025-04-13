'use client';

import { ApiResponse, AdminCourse } from '@/interfaces';
import { CourseData, Module, ModuleData, PowerSkill, RolePlay } from '@/interfaces/ApiResponses';
import { AddCourseType, AddModuleType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CameraIcon, FormErrorMessage, ResourseIcon } from '../common';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import Image from 'next/image';
import { Input } from '../ui/input';
import Lessonn from './Lessons';
import { useSearchParams } from 'next/navigation';

export default function CourseEditForm({ courseId }: { courseId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddCourseType>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [selectKey, setSelectKey] = useState(0);
	const [selectedSkills, setSelectedSkills] = useState<{ id: string; name: string }[]>([]);
	const [selectedScenarios, setSelectedScenarios] = useState<{ id: string; scenario: string }[]>([]);
	const [courseImage, setCourseImage] = useState<string>('');
	const [courseResources, setCourseResources] = useState<string>('');
	const [moduleId, setModuleId] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const [activeSection, setActiveSection] = useState<'lesson' | null>(null);
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AddCourseType>({
		resolver: zodResolver(zodValidator('course')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		//register: registerModule,
		handleSubmit: handleSubmitModule,
		reset: resetModule,
		setValue: setModuleValue,
		formState: { isSubmitting: submittingModule },
	} = useForm<AddModuleType>({
		resolver: zodResolver(zodValidator('module')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	useEffect(() => {
		const action = searchParams.get('action');
		if (action === 'addLesson') {
			setActiveSection('lesson');
		}
	}, [searchParams]);

	const {
		data: course,
		isLoading: loading,
		error: queryError,
	} = useQuery<AdminCourse[], Error>({
		queryKey: ['coursee', courseId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<AdminCourse[]>>(
				`/course/get-admin-course?courseId=${courseId}`
			);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course data.');
			}
			if (!responseData?.data) {
				throw new Error('course data not returned');
			}
			toast.success('Course Fetched', { description: 'Successfully fetched course.' });
			return responseData.data;
		},
	});

	useEffect(() => {
		if (queryError) {
			const errorMessage = queryError.message || 'An unexpected error occurred while fetching course.';
			setError(errorMessage);
			toast.error('Failed to Fetch Course', {
				description: errorMessage,
			});
		}
	}, [queryError]);

	useEffect(() => {
		if (course && course[0]) {
			if (course[0].scenarios?.length > 0) {
				setSelectedScenarios(
					course[0].scenarios.map((s) => ({
						id: s.scenarioId,
						scenario: s.scenarioName,
					}))
				);
			}

			if (course[0].skills?.length > 0) {
				setSelectedSkills(
					course[0].skills.map((skill) => ({
						id: skill.powerSkillId,
						name: skill.powerSkillName,
					}))
				);
			}

			if (course[0].course?.courseImage) {
				setCourseImage(course[0].course.courseImage);
			}

			if (course[0].course?.moduleId) {
				setModuleId(course[0].course.moduleId);
			}

			if (course[0].course?.courseResources) {
				setCourseResources(course[0].course.courseResources);
			}
		}
	}, [course]);

	const {
		data: modules,
		isLoading: moduleLoading,
		error: moduleQueryError,
	} = useQuery<Module[], Error>({
		queryKey: ['module'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Module[]>>('/course/get-modules');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course modules.');
			}
			if (!responseData?.data) {
				throw new Error('No module data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (moduleQueryError) {
			const errorMessage = moduleQueryError.message || 'An unexpected error occurred while fetching modules.';
			toast.error('Failed to fetch modules', {
				description: errorMessage,
			});
		}
	}, [moduleQueryError]);

	const {
		data: scenario,
		isLoading: scenarioLoading,
		error: scenarioQueryError,
	} = useQuery<RolePlay[], Error>({
		queryKey: ['rolePlay'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<RolePlay[]>>('/scenario/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching role plays.');
			}
			if (!responseData?.data) {
				throw new Error('No role play data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (scenarioQueryError) {
			const errorMessage = scenarioQueryError.message || 'An unexpected error occurred while fetching role plays.';
			toast.error('Failed to fetch modules', {
				description: errorMessage,
			});
		}
	}, [scenarioQueryError]);

	const {
		data: skills,
		isLoading: skillsLoading,
		error: skillsQueryError,
	} = useQuery<PowerSkill[], Error>({
		queryKey: ['skills'],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<PowerSkill[]>>('/skill/all');
			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching skills.');
			}
			if (!responseData?.data) {
				throw new Error('No skill data returned');
			}
			return responseData.data;
		},
	});

	useEffect(() => {
		if (skillsQueryError) {
			const errorMessage = skillsQueryError.message || 'An unexpected error occurred while fetching skills.';
			toast.error('Failed to fetch skills', {
				description: errorMessage,
			});
		}
	}, [skillsQueryError]);

	const onEditCourse = async (courseId: string, updatedData: Partial<AddCourseType>) => {
		try {
			setIsLoading(true);

			const isImageUpdated = !!editedData.courseImage;
			const isResourceUpdated = !!editedData.courseResource;
			const dataToSend = {
				name: updatedData.name,
				scenario: JSON.stringify(updatedData.scenario),
				skills: JSON.stringify(updatedData.skills),
				moduleId: updatedData.moduleId,
				status: updatedData.status,
			};

			Object.keys(dataToSend).forEach((key) => {
				if (dataToSend[key as keyof typeof dataToSend] === undefined) {
					delete (dataToSend as Record<string, unknown>)[key];
				}
			});

			const isDataUpdated = Object.keys(dataToSend).length > 0;
			if (!isDataUpdated && !isImageUpdated && !isResourceUpdated) {
				toast.warning('No changes to update', { description: 'No fields were modified.' });
				return false;
			}

			let courseUpdated = false;
			let courseImageUpdated = false;
			if (Object.keys(dataToSend).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<CourseData>>('/course/update-course', {
					courseId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Course Updated', { description: 'Course has been successfully updated.' });
					queryClient.invalidateQueries({ queryKey: ['coursee'] });
					courseUpdated = true;
					return true;
				}
			}

			if (updatedData.courseImage || updatedData.courseResource instanceof File) {
				const imageFormData = new FormData();
				if (updatedData.courseImage) {
					imageFormData.append('courseImage', updatedData.courseImage);
				}
				if (updatedData.courseResource instanceof File) {
					imageFormData.append('courseResources', updatedData.courseResource);
				}
				imageFormData.append('courseId', courseId);

				const { data: imageResponse, error: imageError } = await callApi<ApiResponse<CourseData>>(
					'/course/update-course',
					imageFormData
				);

				if (imageError) {
					throw new Error(imageError.message);
				}

				if (imageResponse?.status === 'success') {
					toast.success('Course Updated', { description: 'Course has been successfully updated.' });
					queryClient.invalidateQueries({ queryKey: ['coursee'] });
					courseImageUpdated = true;
				}
			}

			if (courseUpdated || courseImageUpdated) {
				reset();
			}
		} catch (err) {
			toast.error('Course Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			setSelectKey((prev) => prev + 1);
			setIsLoading(false);
		}
	};
	const onSubmitModule: SubmitHandler<AddModuleType> = async (data: AddModuleType) => {
		try {
			setIsLoading(true);
			const { data: responseData, error } = await callApi<ApiResponse<ModuleData>>('/course/create-module', {
				name: data.name,
			});

			if (error) {
				throw new Error(error.message);
			}

			if (responseData?.status === 'success') {
				toast.success('Course Module Created', { description: 'The module has been added successfully.' });
				queryClient.invalidateQueries({ queryKey: ['module'] });
			}
		} catch (err) {
			toast.error('Module Creation Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
			resetModule();
		}
	};

	const handleSkillChange = (skillId: string) => {
		setSelectedSkills((prev) => {
			const skill = (skills ?? []).find((s) => s.id === skillId);
			if (!skill) return prev;

			const exists = prev.some((s) => s.id === skillId);
			const updatedSkills = exists
				? prev.filter((s) => s.id !== skillId)
				: [...prev, { id: skill.id, name: skill.powerskill }];

			setEditedData({ ...editedData, skills: updatedSkills.map((s) => s.id) });
			return updatedSkills;
		});
	};

	const handleRemoveSkill = (skillId: string) => {
		setSelectedSkills((prev) => {
			const updatedSkills = prev.filter((skill) => skill.id !== skillId);

			setEditedData({ ...editedData, skills: updatedSkills.map((s) => s.id) });
			return updatedSkills;
		});
	};

	const handleScenariosChange = (scenarioName: string) => {
		setSelectedScenarios((prev) => {
			const scenarios = (scenario ?? []).find((s) => s.scenario === scenarioName);
			if (!scenarios) return prev;

			const exists = prev.some((s) => s.scenario === scenarioName);
			const updatedScenario = exists
				? prev.filter((s) => s.scenario !== scenarioName)
				: [...prev, { id: scenarios.id, scenario: scenarios.scenario }];

			// setValue(
			// 	'skills',
			// 	updatedSkills.map((s) => s.id),
			// 	{ shouldValidate: true }
			// );

			setEditedData({ ...editedData, scenario: updatedScenario.map((s) => s.scenario) });
			return updatedScenario;
		});
	};

	const handleRemoveScenarios = (scenarioName: string) => {
		setSelectedScenarios((prev) => {
			const updatedScenario = prev.filter((scenario) => scenario.scenario !== scenarioName);

			// setValue(
			// 	'skills',
			// 	updatedSkills.map((s) => s.id),
			// 	{ shouldValidate: true }
			// );
			setEditedData({ ...editedData, scenario: updatedScenario.map((s) => s.scenario) });
			return updatedScenario;
		});
	};

	// const handleRemoveScenarios = (scenarioId: string) => {
	// 	setSelectedScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
	// };

	if (loading || !course) {
		return <div className="w-full bg-white rounded-md px-6 py-6">Loading...</div>;
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setCourseImage(imageUrl);
			setEditedData({ ...editedData, courseImage: file });
		} else {
			setCourseImage(course[0].course.courseImage);
			setEditedData({ ...editedData, courseImage: null });
		}
	};

	const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setCourseResources(imageUrl);
			setEditedData({ ...editedData, courseResource: file });
		} else {
			setCourseResources(course[0].course.courseImage);
			setEditedData({ ...editedData, courseResource: null });
		}
	};

	const handleOpen = (section: 'lesson') => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	if (error) {
		<div className="w-full bg-white rounded-md px-6 py-4 text-center text-red-500">
			<p>Error: {error}</p>
		</div>;
	}

	return (
		<div className="flex flex-col w-full mt-10">
			<div className="w-full max-w-md space-y-6 px-6 mb-20 mx-auto">
				<div className="flex flex-col items-center space-y-2">
					<h2 className="text-center text-xl font-semibold text-gray-900">{course[0]?.course?.name}</h2>
				</div>
				<form className="space-y-4 relative">
					<div className="flex justify-center gap-8 mt-4">
						<div className="relative">
							<label htmlFor="courseImage" className="relative cursor-pointer">
								<Avatar className="w-24 h-24 border">
									<AvatarImage src={courseImage || ''} className="object-cover w-full h-full" />
									<AvatarFallback>
										<Image src="/icons/Course.svg" alt="Fallback Icon" width={100} height={100} />
									</AvatarFallback>
								</Avatar>
								<span className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1 rounded-full">
									<CameraIcon className="text-black w-5 h-5" />
								</span>
							</label>
							<Input
								type="file"
								id="courseImage"
								accept="image/*"
								onChange={(e) => handleImageChange(e)}
								className="hidden"
							/>
						</div>

						<div className="relative">
							<label htmlFor="courseResources" className="relative cursor-pointer">
								<div className="w-24 h-24 border flex items-center justify-center rounded bg-gray-100 overflow-hidden">
									{courseResources ? (
										courseResources.endsWith('.pdf') ? (
											<Image src="/icons/pdf.png" alt="PDF Icon" width={64} height={64} className="object-contain" />
										) : (
											<Image
												src="/icons/google-docs.png"
												alt="DOC Icon"
												width={64}
												height={64}
												className="object-contain"
											/>
										)
									) : (
										<ResourseIcon className="w-24 h-24" />
									)}
								</div>

								{/* <span className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1 rounded-full">
									<CameraIcon className="text-black w-5 h-5" />
								</span> */}
							</label>

							<Input
								type="file"
								id="courseResources"
								accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
								onChange={(e) => handleResourceUpload(e)}
								className="hidden"
							/>
							{courseResources && (
								<a
									href={courseResources}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:underline block text-center mt-2"
								>
									View File
								</a>
							)}
						</div>
					</div>

					<div>
						<label htmlFor="course" className="text-sm font-medium text-gray-700">
							Course Name
						</label>
						<Input
							value={editedData.name ?? course[0]?.course?.name ?? ''}
							onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
							autoFocus
							type="text"
							id="name"
							aria-label="Course Name"
							placeholder="Course Name"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.name && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.name && <FormErrorMessage error={errors.name} errorMsg={errors.name.message} />}
					</div>

					<div className="mt-4">
						<label className="text-sm font-medium text-gray-700 bg-yellow">Select Module</label>

						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild className="bg-[#F8F8F8]">
								<Button
									variant="outline"
									role="combobox"
									className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer justify-between text-gray-500"
									disabled={moduleLoading}
								>
									{(editedData.moduleId ?? moduleId)
										? (modules?.find((module) => module.id === (editedData.moduleId ?? moduleId))?.name ??
											'Select module')
										: moduleLoading
											? 'Loading modules...'
											: 'Choose a module'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput
										placeholder="Find or create a new module"
										onValueChange={(value) => setSearchTerm(value)}
									/>

									<CommandList>
										<CommandEmpty className="px-4 py-3">
											{searchTerm && (
												<Button
													variant="ghost"
													className="hover:underline hover:cursor-pointer p-0 h-auto"
													disabled={isLoading}
													onClick={() => {
														setModuleValue('name', searchTerm, { shouldValidate: true });
														handleSubmitModule(async (data) => {
															await onSubmitModule(data);
															setSearchTerm('');
															setOpen(false);
														})();
													}}
												>
													{submittingModule || isLoading ? 'Creating...' : `+ Create new module: ${searchTerm}`}
												</Button>
											)}
										</CommandEmpty>
										<CommandGroup>
											{modules
												?.filter((module) => module.name.toLowerCase().includes(searchTerm.toLowerCase()))
												.map((module) => (
													<CommandItem
														key={module.id}
														value={module.name}
														onSelect={() => {
															// setValue('moduleId', module.id, { shouldValidate: true });
															setEditedData({ ...editedData, moduleId: module.id });
															setSearchTerm('');
															setOpen(false);
														}}
														className="w-full"
													>
														<Check className={`mr-2 h-4 w-4 ${moduleId === module.id ? 'opacity-100' : 'opacity-0'}`} />
														{module.name}
													</CommandItem>
												))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{errors.moduleId && <FormErrorMessage error={errors.moduleId} errorMsg={errors.moduleId.message} />}
					</div>

					<div className="relative">
						<label className="text-sm font-medium text-gray-700">Select Scenarios</label>
						<Select onValueChange={handleScenariosChange} key={selectKey}>
							<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
								<SelectValue placeholder={scenarioLoading ? 'Loading role play...' : 'Choose role play scenario'} />
							</SelectTrigger>

							<SelectContent
								position="popper"
								className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
							>
								{scenario?.map((scenario) => (
									<SelectItem key={scenario.id} value={scenario.scenario} className="w-full">
										{scenario.scenario}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{selectedScenarios.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{selectedScenarios.map((scenario) => (
									<span key={scenario.id} className="bg-gray-200 text-xs p-1 rounded">
										{scenario.scenario}
										<span
											onClick={() => handleRemoveScenarios(scenario.scenario)}
											className="text-red-500 cursor-pointer text-[9px]"
										>
											❌
										</span>
									</span>
								))}
							</div>
						)}

						{selectedScenarios.length === 0 && <p className="text-red-500 text-xs mt-2">Add one or more scenarios</p>}
					</div>

					<div className="relative">
						<label className="text-sm font-medium text-gray-700">Select Skills</label>
						<Select onValueChange={handleSkillChange} key={selectKey}>
							<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
								<SelectValue placeholder={skillsLoading ? 'Loading power skill...' : 'Choose skills'} />
							</SelectTrigger>

							<SelectContent
								position="popper"
								className="max-h-60 overflow-y-auto z-50 bg-white shadow-md border border-gray-300 rounded-md"
							>
								{skills?.map((skill) => (
									<SelectItem key={skill.id} value={skill.id} className="w-full">
										{skill.powerskill}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{selectedSkills.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{selectedSkills.map((skill) => (
									<span key={skill.id} className="bg-gray-200 text-xs p-1 rounded">
										{skill.name}
										<span
											onClick={() => handleRemoveSkill(skill.id)}
											className="text-red-500 cursor-pointer text-[9px]"
										>
											❌
										</span>
									</span>
								))}
							</div>
						)}

						{selectedSkills.length === 0 && <p className="text-red-500 text-xs mt-2">Add one or more skills</p>}
					</div>

					<div className="mt-4">
						<label htmlFor="isCorrect" className="text-sm font-medium text-gray-700">
							Course Status
						</label>
						<Select
							value={editedData.status || course[0].course.status}
							onValueChange={(value) => setEditedData({ ...editedData, status: value as 'published' | 'draft' })}

							//disabled={scenarioLoading}
						>
							<SelectTrigger className="w-full min-h-[45px] border-gray-300 focus:ring-blue-500 hover:cursor-pointer">
								<SelectValue placeholder="Course status" />
							</SelectTrigger>
							<SelectContent
								position="popper"
								className="max-h-60 overflow-y-auto z-0 bg-white shadow-md border border-gray-300 rounded-md"
								avoidCollisions={false}
							>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="published">Publish</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						//onClick={(e) => onEditCourse}
						onClick={() => onEditCourse(courseId, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>

			<Collapsible open={activeSection === 'lesson'} onOpenChange={() => handleOpen('lesson')}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Create Lesson
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full max-h-96 overflow-y-auto">
					<Lessonn courseId={courseId} courseName={course[0]?.course?.name} activeSection={activeSection} />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
