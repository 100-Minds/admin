export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	isSuspended: boolean;
	username: string;
	created_at: string;
	photo: string;
	isDeleted: boolean;
};

export type SessionData = User[];

export type ApiResponse<T = Record<string, unknown>> = {
	status: string;
	message: string;
	error?: Record<string, string[]> | string;
	data?: T;
};
