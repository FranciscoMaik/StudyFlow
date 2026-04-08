import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
	const { user, session, clearUser } = useAuthStore();

	async function signUp(email: string, password: string) {
		const { error } = await supabase.auth.signUp({ email, password });
		return { error };
	}

	async function signIn(email: string, password: string) {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error };
	}

	async function signOut() {
		await supabase.auth.signOut();
		clearUser();
	}

	return { user, session, signUp, signIn, signOut };
}
