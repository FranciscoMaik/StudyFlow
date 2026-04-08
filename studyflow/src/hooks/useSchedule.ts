import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePlan } from "../lib/planner";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Content, ScheduleDay } from "../types";

function mapScheduleDay(row: Record<string, unknown>): ScheduleDay {
	return {
		dayOfWeek: row.day_of_week as ScheduleDay["dayOfWeek"],
		isActive: row.is_active as boolean,
		availableHours: row.available_hours as number,
	};
}

function defaultDay(dayOfWeek: ScheduleDay["dayOfWeek"]): ScheduleDay {
	return {
		dayOfWeek,
		isActive: false,
		availableHours: 0,
	};
}

export function useSchedule() {
	const { user } = useAuthStore();

	return useQuery({
		queryKey: ["schedule"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("schedules")
				.select("*")
				.eq("user_id", user!.id)
				.order("day_of_week", { ascending: true });

			if (error) throw error;

			const rows = (data ?? []).map(mapScheduleDay);
			const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));

			return Array.from({ length: 7 }, (_, i) => {
				const day = i as ScheduleDay["dayOfWeek"];
				return byDay.get(day) ?? defaultDay(day);
			});
		},
		enabled: !!user,
	});
}

export function useSaveSchedule() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async (days: ScheduleDay[]) => {
			const rows = days.map((day) => ({
				user_id: user!.id,
				day_of_week: day.dayOfWeek,
				is_active: day.isActive,
				available_hours: day.isActive ? day.availableHours : null,
			}));

			const { error } = await supabase
				.from("schedules")
				.upsert(rows, { onConflict: "user_id,day_of_week" });

			if (error) throw error;
		},
		onSuccess: async (_data, savedDays) => {
			queryClient.invalidateQueries({ queryKey: ["schedule"] });

			const userId = user?.id;
			if (!userId) return;

			const today = new Date().toISOString().split("T")[0];

			// Fetch active contents
			const { data: contentsData } = await supabase
				.from("contents")
				.select("*")
				.eq("user_id", userId)
				.eq("status", "active");

			const contents: Content[] = (contentsData ?? []).map(
				(row: Record<string, unknown>) => ({
					id: row.id as string,
					userId: row.user_id as string,
					title: row.title as string,
					description: row.description as string | undefined,
					estimatedHours: row.estimated_hours as number,
					completedHours: row.completed_hours as number,
					priority: row.priority as Content["priority"],
					deadline: row.deadline as string | undefined,
					categoryId: row.category_id as string | undefined,
					status: row.status as Content["status"],
					createdAt: row.created_at as string,
				}),
			);

			// Generate fresh plan (no existing sessions — we replace all future pending ones)
			const { sessions: newSessions } = generatePlan({
				contents,
				schedule: savedDays,
				existingSessions: [],
			});

			if (newSessions.length === 0) return;

			// Delete all future pending sessions for this user
			await supabase
				.from("sessions")
				.delete()
				.eq("user_id", userId)
				.eq("status", "pending")
				.gt("scheduled_date", today);

			// Insert newly generated sessions
			const rows = newSessions.map((s) => ({
				user_id: userId,
				content_id: s.contentId,
				scheduled_date: s.scheduledDate,
				planned_hours: s.plannedHours,
				status: s.status,
			}));

			await supabase.from("sessions").insert(rows);

			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}
