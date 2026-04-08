import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { calculateLevel } from "../lib/xp-engine";
import { useAuthStore } from "../stores/authStore";
import type { UserProfile } from "../types";

export function useUserProfile() {
	const { user } = useAuthStore();

	return useQuery<UserProfile>({
		queryKey: ["userProfile"],
		queryFn: async () => {
			const userId = user!.id;

			// Fetch total XP from xp_transactions
			const { data: xpData, error: xpError } = await supabase
				.from("xp_transactions")
				.select("amount")
				.eq("user_id", userId);

			if (xpError) throw xpError;

			const totalXP = (xpData ?? []).reduce(
				(sum, row) => sum + (row.amount as number),
				0,
			);

			// Fetch streak data
			const { data: streakData, error: streakError } = await supabase
				.from("streaks")
				.select("current_streak, longest_streak")
				.eq("user_id", userId)
				.maybeSingle();

			if (streakError) throw streakError;

			const currentStreak = streakData?.current_streak ?? 0;
			const longestStreak = streakData?.longest_streak ?? 0;

			const { level, levelName, xpToNextLevel } = calculateLevel(totalXP);

			return {
				totalXP,
				level,
				levelName,
				xpToNextLevel,
				currentStreak,
				longestStreak,
			};
		},
		enabled: !!user,
	});
}

export function useRecordDailyLogin() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async () => {
			const userId = user!.id;
			const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

			// Check if a login XP transaction already exists for today
			const { data: existing, error: checkError } = await supabase
				.from("xp_transactions")
				.select("id")
				.eq("user_id", userId)
				.eq("source_type", "login")
				.gte("created_at", `${today}T00:00:00.000Z`)
				.maybeSingle();

			if (checkError) throw checkError;

			// Only insert if no login transaction exists for today
			if (!existing) {
				const { error: insertError } = await supabase
					.from("xp_transactions")
					.insert({
						user_id: userId,
						amount: 15,
						reason: "Login diário",
						source_type: "login",
					});

				if (insertError) throw insertError;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
		},
	});
}
