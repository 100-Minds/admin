export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isProfileComplete: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  photo: string;
  phoneNumber: string;
};

export type SessionData = {
  user: User;
  // campaigns: Campaign[];
};

export type ApiResponse<T = Record<string, unknown>> = {
  status: string;
  message: string;
  error?: Record<string, string[]> | string;
  data?: T;
};
