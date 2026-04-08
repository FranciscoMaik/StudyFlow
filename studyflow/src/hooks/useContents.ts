import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePlan } from "../lib/planner";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Content, ScheduleDay } from "../types";

function mapContent(row: Record<string, unknown>): Content {
	return {
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
	};
}

export function useContents() {
	const { user } = useAuthStore();

	return useQuery({
		queryKey: ["contents"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("contents")
				.select("*")
				.eq("user_id", user!.id)
				.eq("status", "active")
				.order("created_at", { ascending: false });

			if (error) throw error;

			return (data ?? []).map(mapContent);
		},
		enabled: !!user,
	});
}

export function useContent(id: string) {
	const { user } = useAuthStore();

	return useQuery({
		queryKey: ["contents", id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("contents")
				.select("*")
				.eq("id", id)
				.eq("user_id", user!.id)
				.single();

			if (error) throw error;

			return mapContent(data);
		},
		enabled: !!user && !!id,
	});
}

export interface CreateContentInput {
	title: string;
	description?: string;
	estimatedHours: number;
	priority: Content["priority"];
	deadline?: string;
	categoryId?: string;
}

export function useCreateContent() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async (input: CreateContentInput) => {
			const { data, error } = await supabase
				.from("contents")
				.insert({
					user_id: user!.id,
					title: input.title,
					description: input.description ?? null,
					estimated_hours: input.estimatedHours,
					completed_hours: 0,
					priority: input.priority,
					deadline: input.deadline ?? null,
					category_id: input.categoryId ?? null,
					status: "active",
				})
				.select()
				.single();

			if (error) throw error;

			// Credit 10 XP for content creation (Requirement 2.1)
			const { error: xpError } = await supabase.from("xp_transactions").insert({
				user_id: user!.id,
				amount: 10,
				reason: "Conteúdo criado",
				source_type: "content_creation",
				source_id: data.id,
			});

			if (xpError) throw xpError;

			return mapContent(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contents"] });
		},
	});
}

export interface UpdateContentInput {
	id: string;
	title?: string;
	description?: string;
	estimatedHours?: number;
	priority?: Content["priority"];
	deadline?: string;
	categoryId?: string;
}

export function useUpdateContent() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async (input: UpdateContentInput) => {
			const { id, ...fields } = input;

			const updatePayload: Record<string, unknown> = {};
			if (fields.title !== undefined) updatePayload.title = fields.title;
			if (fields.description !== undefined)
				updatePayload.description = fields.description;
			if (fields.estimatedHours !== undefined)
				updatePayload.estimated_hours = fields.estimatedHours;
			if (fields.priority !== undefined)
				updatePayload.priority = fields.priority;
			if (fields.deadline !== undefined)
				updatePayload.deadline = fields.deadline;
			if (fields.categoryId !== undefined)
				updatePayload.category_id = fields.categoryId;

			const { data, error } = await supabase
				.from("contents")
				.update(updatePayload)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;

			return mapContent(data);
		},
		onSuccess: async (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["contents"] });
			queryClient.invalidateQueries({ queryKey: ["contents", variables.id] });

			const userId = user?.id;
			if (!userId) return;

			// Fetch active contents, schedule, and existing sessions
			const today = new Date().toISOString().split("T")[0];

			const [{ data: contentsData }, { data: scheduleData }] =
				await Promise.all([
					supabase
						.from("contents")
						.select("*")
						.eq("user_id", userId)
						.eq("status", "active"),
					supabase
						.from("schedules")
						.select("*")
						.eq("user_id", userId)
						.order("day_of_week", { ascending: true }),
				]);

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

			const schedule: ScheduleDay[] = (scheduleData ?? []).map(
				(row: Record<string, unknown>) => ({
					dayOfWeek: row.day_of_week as ScheduleDay["dayOfWeek"],
					isActive: row.is_active as boolean,
					availableHours: row.available_hours as number,
				}),
			);

			const { sessions: newSessions } = generatePlan({
				contents,
				schedule,
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

export function useArchiveContent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			// Set content status to archived (Requirement 2.5)
			const { error: archiveError } = await supabase
				.from("contents")
				.update({ status: "archived" })
				.eq("id", id);

			if (archiveError) throw archiveError;

			// Delete future pending sessions for this content (Requirement 2.5)
			const today = new Date().toISOString().split("T")[0];
			const { error: sessionsError } = await supabase
				.from("sessions")
				.delete()
				.eq("content_id", id)
				.eq("status", "pending")
				.gt("scheduled_date", today);

			if (sessionsError) throw sessionsError;
		},
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: ["contents"] });
			queryClient.invalidateQueries({ queryKey: ["contents", id] });
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}
