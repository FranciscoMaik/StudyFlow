import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

export interface WeeklyReport {
	weekStart: string;
	weekEnd: string;
	totalStudyHours: number;
	completionRate: number;
	xpEarned: number;
	sessionsByDay: { date: string; hours: number }[];
	totalSessions: number;
	completedSessions: number;
}

/** Calculates weekEnd (Sunday) given weekStart (Monday) as YYYY-MM-DD */
function getWeekEnd(weekStart: string): string {
	const [year, month, day] = weekStart.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	date.setDate(date.getDate() + 6);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Builds an array of 7 date strings (Mon–Sun) from weekStart */
function buildWeekDates(weekStart: string): string[] {
	const [year, month, day] = weekStart.split("-").map(Number);
	const dates: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(year, month - 1, day + i);
		const y = d.getFullYear();
		const mo = String(d.getMonth() + 1).padStart(2, "0");
		const da = String(d.getDate()).padStart(2, "0");
		dates.push(`${y}-${mo}-${da}`);
	}
	return dates;
}

/**
 * Requirement 11.1, 11.3 — aggregates weekly study metrics for the selected week.
 * @param weekStart - Monday of the week in YYYY-MM-DD format
 */
export function useWeeklyReport(weekStart: string) {
	const { user } = useAuthStore();
	const weekEnd = getWeekEnd(weekStart);

	return useQuery<WeeklyReport>({
		queryKey: ["weeklyReport", weekStart],
		queryFn: async () => {
			// Fetch sessions for the week
			const { data: sessions, error: sessionsError } = await supabase
				.from("sessions")
				.select("*")
				.eq("user_id", user!.id)
				.gte("scheduled_date", weekStart)
				.lte("scheduled_date", weekEnd);

			if (sessionsError) throw sessionsError;

			// Fetch XP transactions for the week
			const { data: xpTransactions, error: xpError } = await supabase
				.from("xp_transactions")
				.select("amount")
				.eq("user_id", user!.id)
				.gte("created_at", `${weekStart}T00:00:00.000Z`)
				.lte("created_at", `${weekEnd}T23:59:59.999Z`);

			if (xpError) throw xpError;

			const allSessions = sessions ?? [];
			const doneSessions = allSessions.filter((s) => s.status === "done");

			const totalSessions = allSessions.length;
			const completedSessions = doneSessions.length;

			const totalStudyHours = doneSessions.reduce(
				(sum, s) => sum + (s.planned_hours as number),
				0,
			);

			const completionRate =
				totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

			const xpEarned = (xpTransactions ?? []).reduce(
				(sum, t) => sum + (t.amount as number),
				0,
			);

			// Build sessionsByDay for bar chart (7 days, Mon–Sun)
			const weekDates = buildWeekDates(weekStart);
			const hoursByDate: Record<string, number> = {};
			for (const date of weekDates) {
				hoursByDate[date] = 0;
			}
			for (const s of doneSessions) {
				const date = s.scheduled_date as string;
				if (date in hoursByDate) {
					hoursByDate[date] += s.planned_hours as number;
				}
			}
			const sessionsByDay = weekDates.map((date) => ({
				date,
				hours: hoursByDate[date],
			}));

			return {
				weekStart,
				weekEnd,
				totalStudyHours,
				completionRate,
				xpEarned,
				sessionsByDay,
				totalSessions,
				completedSessions,
			};
		},
		enabled: !!user && !!weekStart,
	});
}
