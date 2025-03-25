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
	userId: string;
	moduleId: string;
	scenarioName: string | null;
	scenarioId: string | null;
	isDeleted: boolean;
	created_at: string;
};

export type ICourseChapter = {
	id: string;
	title: string;
	courseId: string;
	chapterNumber: number;
	isDeleted: boolean;
	created_at: Date;
};

export type ICourseVideo = {
	id: string;
	chapterId: string;
	videoURL: string;
	duration: string;
	//uploadStatus: VideoUploadStatus;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
};

export type SessionData = User[];
export type PowerSkillData = PowerSkill[];
export type RolePlayData = RolePlay[];
export type ModuleData = Module[];
export type CourseData = Course[];

export type ApiResponse<T = Record<string, unknown>> = {
	status: string;
	message: string;
	error?: Record<string, string[]> | string;
	data?: T;
};
