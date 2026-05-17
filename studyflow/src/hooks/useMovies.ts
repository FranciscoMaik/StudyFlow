import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Movie } from "../types";

function mapMovie(row: Record<string, unknown>): Movie {
	return {
		id: row.id as string,
		userId: row.user_id as string,
		title: row.title as string,
		description: row.description as string | undefined,
		genre: row.genre as string | undefined,
		releaseYear: row.release_year as number | undefined,
		rating: row.rating as number | undefined,
		status: row.status as Movie["status"],
		createdAt: row.created_at as string,
	};
}

export function useMovies() {
	const { user } = useAuthStore();

	return useQuery({
		queryKey: ["movies"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("movies")
				.select("*")
				.eq("user_id", user!.id)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return (data ?? []).map(mapMovie);
		},
		enabled: !!user,
	});
}

export interface CreateMovieInput {
	title: string;
	description?: string;
	genre?: string;
	releaseYear?: number;
}

export function useCreateMovie() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async (input: CreateMovieInput) => {
			const { data, error } = await supabase
				.from("movies")
				.insert({
					user_id: user!.id,
					title: input.title,
					description: input.description ?? null,
					genre: input.genre ?? null,
					release_year: input.releaseYear ?? null,
					status: "want_to_watch",
				})
				.select()
				.single();

			if (error) throw error;
			return mapMovie(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["movies"] });
		},
	});
}

export interface UpdateMovieInput {
	id: string;
	title?: string;
	description?: string;
	genre?: string;
	releaseYear?: number;
	rating?: number | null;
	status?: Movie["status"];
}

export function useUpdateMovie() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateMovieInput) => {
			const { id, ...fields } = input;
			const payload: Record<string, unknown> = {};
			if (fields.title !== undefined) payload.title = fields.title;
			if (fields.description !== undefined) payload.description = fields.description;
			if (fields.genre !== undefined) payload.genre = fields.genre;
			if (fields.releaseYear !== undefined) payload.release_year = fields.releaseYear;
			if (fields.rating !== undefined) payload.rating = fields.rating;
			if (fields.status !== undefined) payload.status = fields.status;

			const { data, error } = await supabase
				.from("movies")
				.update(payload)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;
			return mapMovie(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["movies"] });
		},
	});
}

export function useDeleteMovie() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("movies").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["movies"] });
		},
	});
}
