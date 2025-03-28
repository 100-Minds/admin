export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	photo: string;
	role: string;
	isSuspended: boolean;
	isDeleted: boolean;
	created_at: string;
};

export type PowerSkill = {
	id: string;
	powerskill: string;
	userId: string;
	isDeleted: boolean;
	created_at: string;
};

export type RolePlay = {
	id: string;
	scenario: string;
	scenarioImage: string;
	userId: string;
	isDeleted: boolean;
	created_at: string;
};

export type Module = {
	id: string;
	name: string;
	userId: string;
	isDeleted: boolean;
	created_at: string;
};

export type Course = {
	id: string;
	name: string;
	courseImage: string;
	userId: string;
	moduleId: string;
	scenarioName: string | null;
	scenarioId: string | null;
	isDeleted: boolean;
	created_at: string;
};

export type UploadLesson = {
	signedUrl: string;
	key: string;
};

export type Chapter = {
	id: string;
	title: string;
	description: string;
	courseId: string;
	chapterNumber: number;
	videoUrl: string;
	isDeleted: boolean;
	created_at: string;
};

export type SessionData = User[];
export type PowerSkillData = PowerSkill[];
export type RolePlayData = RolePlay[];
export type ModuleData = Module[];
export type CourseData = Course[];
export type LessonData = Chapter[];
export type UploadLessonData = UploadLesson;

export type ApiResponse<T = Record<string, unknown>> = {
	status: string;
	message: string;
	error?: Record<string, string[]> | string;
	data?: T;
};
