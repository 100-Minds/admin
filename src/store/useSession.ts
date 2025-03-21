import type { ApiResponse, User } from '@/interfaces';
import type { SessionData } from '@/interfaces/ApiResponses';
import { callApi } from '@/lib/helpers/callApi';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SelectorFn } from './store-types';

type Session = {
	isFirstMount: boolean;
	loading: boolean;
	user: User[] | null;

	actions: {
		clearSession: () => void;
		updateUser: (data: { user: User }) => void;
		getSession: (isInitialLoad?: boolean) => Promise<void>;
	};
};

const initialState = {
	loading: true,
	user: null,
	isFirstMount: false,
};

export const useInitSession = create<Session>()((set, get) => ({
	...initialState,

	actions: {
		getSession: async (isInitialLoad) => {
			if (typeof isInitialLoad === 'boolean') {
				set({ isFirstMount: true });
			}

			const { data, error } = await callApi<ApiResponse<SessionData>>('/user');
			if (error) {
				console.error('Session error:', error);
			}

			set({
				user: data?.data || null, 
				loading: false,
			});
		},

		updateUser: (data) => set({ user: [data.user] }),

		clearSession: () => {
			set((state) => ({
				...initialState,
				loading: false,
				isFirstMount: state.isFirstMount,
			}));

			const currentPageUrl = window.location.pathname;

			if (currentPageUrl !== '/' && currentPageUrl !== '/signup' && !get().isFirstMount) {
				window.location.replace('/?unauthorized=true');
			}
		},
	} satisfies Session['actions'],
}));

export const useSession = <TResult>(selector: SelectorFn<Session, TResult>) => {
	const state = useInitSession(useShallow(selector));

	return state;
};
