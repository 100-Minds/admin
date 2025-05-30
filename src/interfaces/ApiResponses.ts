export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	photo: string;
	role: string;
	accountType: string;
	organizationLogo: string;
	organizationName: string;
	organizationWebsite: string;
	organizationDescription: string;
	bio: string;
	careerGoals: string;
	opportunities: string;
	strengths: string;
	assessment: string;
	isSuspended: boolean;
	isDeleted: boolean;
	created_at: string;
};

export type PowerSkill = {
	id: string;
	powerskill: string;
	category: string;
	skillImage: string;
	isDeleted: boolean;
	created_at: string;
};

export type RolePlay = {
	id: string;
	scenario: string;
	scenarioImage: string;
	isDeleted: boolean;
	created_at: string;
};

export type Module = {
	id: string;
	name: string;
	isDeleted: boolean;
	created_at: string;
};

export type Course = {
	id: string;
	name: string;
	courseImage: string;
	courseResources: string | null;
	status: string;
	moduleId: string;
	scenarioName: string | null;
	scenarioId: string | null;
	isDeleted: boolean;
	created_at: string;
};

export type AdminCourse = {
	course: Course;
	scenarios: {
		scenarioId: string;
		scenarioName: string;
	}[];
	skills: {
		powerSkillId: string;
		powerSkillName: string;
	}[];
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
	chapterResources: string | null;
	videoUrl: string;
	isDeleted: boolean;
	created_at: string;
};

export type Journey = {
	moduleId: string;
	moduleName: string;
	courseId: string;
	courseName: string;
	scenarioId: string;
	scenarioName: string;
};

export type Team = {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	created_at: string;
};

export type QuizOption = 'optionA' | 'optionB' | 'optionC' | 'optionD' | 'optionE';
export type Quiz = {
	id: string;
	question: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	optionE: string;
	isCorrect: QuizOption[];
	chapterId: string;
	courseId: string;
	created_at: Date;
};

export type Assessment = {
	id: string;
	question: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	optionE: string;
	isCorrect: QuizOption[];
	courseId: string;
	created_at: Date;
};

export type SessionData = User[];
export type PowerSkillData = PowerSkill[];
export type RolePlayData = RolePlay[];
export type ModuleData = Module[];
export type CourseData = Course[];
export type LessonData = Chapter[];
export type UploadLessonData = UploadLesson;
export type JourneyData = Journey[];
export type TeamData = Team[];
export type QuizData = Quiz[];
export type AssessmentData = Assessment[];
export type AdminCourseData = AdminCourse[];

export type ApiResponse<T = Record<string, unknown>> = {
	status: string;
	message: string;
	error?: Record<string, string[]> | string;
	data?: T;
};
