import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
	setUser: (user: User | null, session: Session | null) => void;
	clearUser: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	session: null,
	loading: true,
	setUser: (user, session) => set({ user, session, loading: false }),
	clearUser: () => set({ user: null, session: null, loading: false }),
	setLoading: (loading) => set({ loading }),
}));
