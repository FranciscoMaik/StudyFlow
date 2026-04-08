import { type ReactNode, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { setUser, clearUser } = useAuthStore();

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				setUser(session.user, session);
			} else {
				clearUser();
			}
		});

		// Listen for auth state changes (handles token refresh automatically)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				setUser(session.user, session);
			} else {
				clearUser();
			}
		});

		return () => subscription.unsubscribe();
	}, [setUser, clearUser]);

	return <>{children}</>;
}
