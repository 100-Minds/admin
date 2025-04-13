'use client';

import { ApiResponse } from '@/interfaces';
import { Chapter, LessonData, UploadLessonData } from '@/interfaces/ApiResponses';
import { AddLessonType, callApi, zodValidator } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { FormErrorMessage, ResourseIcon } from '../common';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import Image from 'next/image';
import { Input } from '../ui/input';
import { useSearchParams } from 'next/navigation';
import Quizz from './Quiz';
import { isValidUUID } from '@/lib/helpers/isValidUUID';

export default function LessonEditForm({ courseId }: { courseId: string }) {
	const [error, setError] = useState<string | null>(null);
	const [editedData, setEditedData] = useState<Partial<AddLessonType>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [chapterResources, setChapterResources] = useState<string>('');
	const [fileName, setFileName] = useState<string | null>(null);
	// const [fileType, setFileType] = useState<string | null>(null);
	// const [fileSize, setFileSize] = useState<number | null>(null);
	// const [videoLength, setVideoLength] = useState<string | null>(null);
	const [activeSection, setActiveSection] = useState<'quiz' | null>(null);
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const {
		//register,
		//handleSubmit,
		reset,
		//setValue,
		formState: { errors, isSubmitting },
	} = useForm<AddLessonType>({
		resolver: zodResolver(zodValidator('lesson')!),
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	useEffect(() => {
		const action = searchParams.get('action');
		if (action === 'addQuiz') {
			setActiveSection('quiz');
		}
	}, [searchParams]);

	const {
		data: lessons,
		isLoading: loadingLessons,
		error: lessonError,
	} = useQuery<Chapter[], Error>({
		queryKey: ['lesson', courseId],
		queryFn: async () => {
			const { data: responseData, error } = await callApi<ApiResponse<Chapter[]>>(
				`/course/get-chapters?courseId=${courseId}`
			);

			if (error) {
				throw new Error(error.message || 'Something went wrong while fetching course lessons.');
			}
			if (!responseData?.data) {
				throw new Error('No lesson data returned');
			}
			toast.success('Lessons Fetched', { description: 'Successfully fetched lessons.' });
			return responseData.data;
		},
		enabled: !!courseId && isValidUUID(courseId),
	});

	useEffect(() => {
		if (lessonError) {
			const errorMessage = lessonError.message || 'An unexpected error occurred while fetching lessons.';
			setError(errorMessage);
			toast.error('Failed to fetch lessons', {
				description: errorMessage,
			});
		}
	}, [lessonError]);

	useEffect(() => {
		if (lessons && lessons[0]) {
			if (lessons[0].chapterResources) {
				setChapterResources(lessons[0].chapterResources);
			}

			if (lessons[0].videoUrl) {
				setFileName(lessons[0].videoUrl);
			}
		}
	}, [lessons]);

	const onEditLesson = async (chapterId: string, updatedData: Partial<AddLessonType>) => {
		try {
			setIsLoading(true);

			const isResourceUpdated = !!editedData.chapterResources;
			const isVideoUpdated = updatedData.lessonVideo instanceof File;

			if (isVideoUpdated) {
				if (!updatedData.fileName || !updatedData.fileType || !updatedData.fileSize || !updatedData.videoLength) {
					toast.warning('Missing video metadata', { description: 'Please ensure all video information is provided.' });
					return false;
				}
			}

			const dataToSend = {
				title: updatedData.title,
				description: updatedData.description,
				fileName: updatedData.fileName,
				fileType: updatedData.fileType,
				fileSize: updatedData.fileSize,
				videoLength: updatedData.videoLength,
			};

			Object.keys(dataToSend).forEach((key) => {
				if (dataToSend[key as keyof typeof dataToSend] === undefined) {
					delete (dataToSend as Record<string, unknown>)[key];
				}
			});

			const isDataUpdated = Object.keys(dataToSend).length > 0;
			if (!isDataUpdated && !isResourceUpdated) {
				toast.warning('No changes to update', { description: 'No fields were modified.' });
				return false;
			}

			let lessonUpdated = false;
			let lessonResourceUpdated = false;
			if (Object.keys(dataToSend).length > 0) {
				const { data: responseData, error } = await callApi<ApiResponse<UploadLessonData>>('/course/update-lesson', {
					chapterId,
					...dataToSend,
				});

				if (error) throw new Error(error.message);
				if (responseData?.status === 'success') {
					toast.success('Lesson Updated', { description: 'Course lesson has been successfully updated.' });
					queryClient.invalidateQueries({ queryKey: ['lesson'] });
					lessonUpdated = true;
					setIsLoading(false);

					if (isVideoUpdated && updatedData.lessonVideo) {
						// Check for signedUrl and key from response
						const signedUrl = responseData?.data?.signedUrl;
						const key = responseData?.data?.key;

						if (!signedUrl || !key) {
							throw new Error('Invalid response: uploadUrl or key missing.');
						}

						const file = updatedData.lessonVideo;

						// Step 3: Upload file to r2
						let videoUploadStatus = 'failed';
						try {
							const uploadResponse = await fetch(signedUrl, {
								method: 'PUT',
								body: file,
								headers: {
									'Content-Type': file.type,
								},
							});

							if (uploadResponse.ok) {
								videoUploadStatus = 'completed';
							} else {
								toast.success('Video Uploaded Failed', {
									description: `Video for ${updatedData.title || 'lesson'} upload failed`,
								});
								//throw new Error('Failed to upload video.');
							}
						} catch (uploadError) {
							console.error('Upload error:', uploadError);
							videoUploadStatus = 'failed';
						}

						// Step 4: Send upload status to backend
						const { error: notifyError, data: notifyData } = await callApi<ApiResponse<null>>(
							'/course/video/upload-status-update',
							{
								videoUploadStatus,
								chapterId,
							}
						);

						if (notifyError) {
							throw new Error(notifyError.message || 'Failed to notify backend of video upload status.');
						}

						if (notifyData?.status === 'success') {
							toast.success('Video Uploaded', {
								description: `Video for ${updatedData.title || 'lesson'} updated successfully.`,
							});
						}
					}

					//queryClient.invalidateQueries({ queryKey: ['lesson'] });
					return true;
				}
			}

			if (updatedData.chapterResources instanceof File) {
				const resourcesFormData = new FormData();
				resourcesFormData.append('chapterResources', updatedData.chapterResources);
				resourcesFormData.append('chapterId', chapterId);

				const { data: resourceResponse, error: imageError } = await callApi<ApiResponse<LessonData>>(
					'/course/update-lesson',
					resourcesFormData
				);

				if (imageError) {
					throw new Error(imageError.message);
				}

				if (resourceResponse?.status === 'success') {
					toast.success('Lesson Updated', { description: 'Course lesson has been successfully updated.' });
					queryClient.invalidateQueries({ queryKey: ['lesson'] });
					lessonResourceUpdated = true;
				}
			}

			if (lessonUpdated || lessonResourceUpdated) {
				reset();
			}
		} catch (err) {
			toast.error('Lesson Update Failed', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
			return false;
		} finally {
			reset();
			setEditedData({});
			setIsLoading(false);
		}
	};

	if (loadingLessons || !lessons) {
		return <div className="w-full bg-white rounded-md px-6 py-6">Loading...</div>;
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileName(file.name);
			// setFileType(file.type);
			// setFileSize(file.size);
			setEditedData((prevData) => ({
				...prevData,
				lessonVideo: file,
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			}));
			// Extract video length
			const video = document.createElement('video');
			video.preload = 'metadata';
			video.src = URL.createObjectURL(file);
			video.onloadedmetadata = () => {
				URL.revokeObjectURL(video.src);
				const duration = new Date(video.duration * 1000).toISOString().substr(11, 8);
				///setVideoLength(duration);
				setEditedData((prevData) => ({
					...prevData,
					videoLength: duration,
				}));
			};
		}
	};

	const removeFile = () => {
		setFileName(null);
		setEditedData({ ...editedData, lessonVideo: null });

		const fileInput = document.getElementById('lessonVideo') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	};

	const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setChapterResources(imageUrl);
			setEditedData({ ...editedData, chapterResources: file });
		} else {
			setChapterResources(lessons?.[0]?.chapterResources || '');
			setEditedData({ ...editedData, chapterResources: null });
		}
	};

	const handleOpen = (section: 'quiz') => {
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
					<h2 className="text-center text-xl font-semibold text-gray-900">{lessons[0]?.title}</h2>
				</div>
				<form className="space-y-4 relative">
					<div className="relative flex flex-col items-center justify-center">
						<label htmlFor="chapterResources" className="relative cursor-pointer">
							<div className="w-24 h-24 border flex items-center justify-center rounded bg-gray-100 overflow-hidden">
								{chapterResources ? (
									chapterResources.endsWith('.pdf') ? (
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
						</label>

						<Input
							type="file"
							id="chapterResources"
							accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
							onChange={(e) => handleResourceUpload(e)}
							className="hidden"
						/>
						{chapterResources && (
							<a
								href={chapterResources}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-600 hover:underline block text-center mt-2"
							>
								View File
							</a>
						)}
					</div>

					<div>
						<label htmlFor="course" className="text-sm font-medium text-gray-700">
							Chapter Title
						</label>
						<Input
							value={editedData.title ?? lessons[0]?.title ?? ''}
							onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
							autoFocus
							type="text"
							id="name"
							aria-label="Chapter Title"
							placeholder="Chapter Title"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.title && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.title && <FormErrorMessage error={errors.title} errorMsg={errors.title.message} />}
					</div>

					<div className="mt-4">
						<label htmlFor="course" className="text-sm font-medium text-gray-700">
							Chapter Description
						</label>
						<Input
							value={editedData.description ?? lessons[0]?.description ?? ''}
							onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
							type="text"
							id="name"
							aria-label="Chapter Description"
							placeholder="Chapter Description"
							className={`min-h-[45px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm ${
								errors.description && 'border-red-500 ring-2 ring-red-500'
							}`}
						/>
						{errors.description && (
							<FormErrorMessage error={errors.description} errorMsg={errors.description.message} />
						)}
					</div>

					<div className="mt-4">
						<label htmlFor="lessonVideo" className="text-sm font-medium text-gray-700">
							Upload Lesson Video <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<input
								type="file"
								id="lessonVideo"
								accept="video/*"
								//{...register('lessonVideo', { required: 'Lesson video is required' })}
								onChange={handleFileChange}
								className="hidden"
							/>
							<label
								htmlFor="lessonVideo"
								className="block w-full border border-gray-300 rounded-lg shadow-sm bg-[#F8F8F8] cursor-pointer p-3 text-[13px] text-gray-500 min-h-[45px] text-center"
							>
								{fileName ? fileName : 'Choose a video file'}
							</label>
						</div>

						{fileName && (
							<div className="mt-2 flex justify-end ml-auto">
								<button
									type="button"
									onClick={removeFile}
									className="bg-red-500 text-white px-3 py-1 rounded-md text-xs shadow-md hover:cursor-pointer"
								>
									Remove Video
								</button>
							</div>
						)}
						{errors.lessonVideo && (
							<FormErrorMessage error={errors.lessonVideo} errorMsg={errors.lessonVideo.message} />
						)}
					</div>

					<Button
						type="button"
						disabled={isSubmitting || isLoading}
						variant="default"
						className="w-full bg-[#509999] hover:bg-[#6fb7b7] hover:cursor-pointer text-white font-semibold py-5 rounded"
						//onClick={(e) => onEditCourse}
						onClick={() => onEditLesson(lessons[0].id, editedData)}
					>
						{isSubmitting || isLoading ? 'Editing...' : 'Edit'}
					</Button>
				</form>
			</div>

			<Collapsible open={activeSection === 'quiz'} onOpenChange={() => handleOpen('quiz')}>
				<CollapsibleTrigger className="w-full bg-[#F0F0F0] px-4 py-2 rounded-lg text-left hover:cursor-pointer">
					Create Quiz
				</CollapsibleTrigger>
				<CollapsibleContent className="w-full max-h-96 overflow-y-auto">
					<Quizz chapterId={lessons?.[0]?.id} courseId={lessons?.[0]?.courseId} />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
