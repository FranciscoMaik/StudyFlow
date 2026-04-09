import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkAchievements } from "../lib/achievement-engine";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import type { AchievementKey, Session } from "../types";

const ACHIEVEMENT_NAMES: Record<AchievementKey, string> = {
	em_chamas: "Em Chamas",
	devorador_de_livros: "Devorador de Livros",
	maratonista: "Maratonista",
	pontual: "Pontual",
	semana_perfeita: "Semana Perfeita",
	madrugador: "Madrugador",
};

function mapSession(row: Record<string, unknown>): Session {
	return {
		id: row.id as string,
		userId: row.user_id as string,
		contentId: row.content_id as string,
		scheduledDate: row.scheduled_date as string,
		plannedHours: row.planned_hours as number,
		status: row.status as Session["status"],
		completedAt: row.completed_at as string | undefined,
	};
}

/** Returns today's date as YYYY-MM-DD in local time */
function getTodayDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Returns ISO week bounds (Monday–Sunday) for the current week */
function getCurrentWeekBounds(): { start: string; end: string } {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	// Offset to Monday: if Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1)
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(now);
	monday.setDate(now.getDate() - daysToMonday);

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	const fmt = (d: Date) => {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	};

	return { start: fmt(monday), end: fmt(sunday) };
}

/** Requirement 5.1 — daily sessions for the current user */
export function useTodaySessions() {
	const { user } = useAuthStore();
	const today = getTodayDate();

	return useQuery<Session[]>({
		queryKey: ["sessions", "today"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("sessions")
				.select("*, contents!inner(status)")
				.eq("contents.status", "active")
				.eq("user_id", user!.id)
				.eq("scheduled_date", today)
				.order("planned_hours", { ascending: false });

			if (error) throw error;

			return (data ?? []).map(mapSession);
		},
		enabled: !!user,
	});
}

/** Requirement 5.2 — sessions for the current ISO week (Mon–Sun) */
export function useWeeklySessions() {
	const { user } = useAuthStore();
	const { start, end } = getCurrentWeekBounds();

	return useQuery<Session[]>({
		queryKey: ["sessions", "week"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("sessions")
				.select("*, contents!inner(status)")
				.eq("contents.status", "active")
				.eq("user_id", user!.id)
				.gte("scheduled_date", start)
				.lte("scheduled_date", end)
				.order("scheduled_date", { ascending: true });

			if (error) throw error;

			return (data ?? []).map(mapSession);
		},
		enabled: !!user,
	});
}

/** Requirement 6.1 — mark a session as done and trigger XP notification */
export function useCompleteSession() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const addXPNotification = useNotificationStore((s) => s.addXPNotification);
	const addAchievementNotification = useNotificationStore(
		(s) => s.addAchievementNotification,
	);

	return useMutation({
		mutationFn: async ({
			sessionId,
			elapsedSeconds: _elapsedSeconds,
		}: {
			sessionId: string;
			elapsedSeconds?: number;
		}) => {
			const { error } = await supabase
				.from("sessions")
				.update({
					status: "done",
					completed_at: new Date().toISOString(),
				})
				.eq("id", sessionId);

			if (error) throw error;
		},
		onSuccess: async () => {
			// DB trigger handles actual XP credit; notify UI immediately (Req 6.6)
			addXPNotification(50);

			queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
			queryClient.invalidateQueries({ queryKey: ["sessions", "week"] });
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });

			if (!user) return;

			// Req 10.1, 10.2, 10.3 — check achievements after session completion
			try {
				const [streakRes, contentsRes, hoursRes, earlyRes, unlockedRes] =
					await Promise.all([
						supabase
							.from("streaks")
							.select("current_streak")
							.eq("user_id", user.id)
							.maybeSingle(),
						supabase
							.from("contents")
							.select("id", { count: "exact", head: true })
							.eq("user_id", user.id)
							.eq("status", "done"),
						supabase
							.from("sessions")
							.select("planned_hours")
							.eq("user_id", user.id)
							.eq("status", "done"),
						supabase
							.from("sessions")
							.select("id", { count: "exact", head: true })
							.eq("user_id", user.id)
							.eq("status", "done")
							.lt(
								"completed_at",
								new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
							),
						supabase
							.from("achievements")
							.select("achievement_key")
							.eq("user_id", user.id),
					]);

				const currentStreak =
					(streakRes.data as { current_streak: number } | null)
						?.current_streak ?? 0;
				const totalContentsCompleted = contentsRes.count ?? 0;
				const totalStudyHours = (
					(hoursRes.data ?? []) as { planned_hours: number }[]
				).reduce((sum, s) => sum + s.planned_hours, 0);
				const earlyMorningSessions = earlyRes.count ?? 0;
				const unlockedAchievements = (
					(unlockedRes.data ?? []) as { achievement_key: AchievementKey }[]
				).map((r) => r.achievement_key);

				const ctx = {
					userId: user.id,
					currentStreak,
					totalContentsCompleted,
					totalStudyHours,
					contentsCompletedBeforeDeadline: 0,
					consecutivePerfectWeeks: 0,
					earlyMorningSessions,
					unlockedAchievements,
				};

				const newAchievements = checkAchievements(ctx);

				for (const key of newAchievements) {
					await supabase.from("achievements").insert({
						user_id: user.id,
						achievement_key: key,
						unlocked_at: new Date().toISOString(),
					});

					addAchievementNotification(ACHIEVEMENT_NAMES[key]);
				}

				if (newAchievements.length > 0) {
					queryClient.invalidateQueries({ queryKey: ["achievements"] });
				}
			} catch {
				// Achievement check is non-critical; silently ignore errors
			}
		},
	});
}

/** Requirement 6.5 — mark a session as skipped (no XP credited) */
export function useSkipSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionId: string) => {
			const { error } = await supabase
				.from("sessions")
				.update({ status: "skipped" })
				.eq("id", sessionId);

			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
			queryClient.invalidateQueries({ queryKey: ["sessions", "week"] });
		},
	});
}
