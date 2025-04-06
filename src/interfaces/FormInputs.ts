export type SignUpProps = {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	role: string;
	password: string;
	confirmPassword: string;
};

export type LoginProps = {
	email: string;
	password: string;
};

export type ResetPasswordProps = {
	password: string;
	confirmPassword: string;
};

export type ForgotPasswordProps = {
	email: string;
};

export type UpdatePasswordsProps = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export type OtpVerificationProps = {
	otp: string;
};

export type AddPowerSkillProps = {
	skill: string;
};

export type AddRolePlayProps = {
	scenario: string;
	scenarioImage: File | null;
};

export type AddModuleProps = {
	name: string;
};

export type AddCourseProps = {
	name: string;
	courseImage: File | null;
	moduleId: string;
	scenario: string;
	skills: string[];
};

export type AddLessonProps = {
	courseId: string;
	title: string;
	description: string;
	lessonVideo: File | null;
	fileName: string;
	fileType: string;
	fileSize: number;
	videoLength: string;
};

export type AddJourneyProps = {
	moduleId: string;
};

export type AddTeamProps = {
	name: string;
};

export type UpdateProfileProps = {
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	username?: string | null;
	photo?: File | null;
};

export type AddQuizProps = {
	question: string;
	optionA: string;
	optionB: string;
	optionC: string | null;
	optionD: string | null;
	isCorrect: string;
	chapterId: string;
	courseId: string;
};
