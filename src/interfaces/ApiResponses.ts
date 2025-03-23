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
}

export type SessionData = User[];
export type PowerSkillData = PowerSkill[];
export type RolePlayData = RolePlay[];

export type ApiResponse<T = Record<string, unknown>> = {
	status: string;
	message: string;
	error?: Record<string, string[]> | string;
	data?: T;
};
