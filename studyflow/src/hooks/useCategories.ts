import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Category } from "../types";

export function useCategories() {
	const { user } = useAuthStore();

	return useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("categories")
				.select("*")
				.eq("user_id", user!.id)
				.order("name");

			if (error) throw error;

			return (data ?? []).map((row) => ({
				id: row.id,
				userId: row.user_id,
				name: row.name,
				color: row.color,
			})) as Category[];
		},
		enabled: !!user,
	});
}

export function useCreateCategory() {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	return useMutation({
		mutationFn: async (input: { name: string; color: string }) => {
			const { data, error } = await supabase
				.from("categories")
				.insert({ user_id: user!.id, name: input.name, color: input.color })
				.select()
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			id: string;
			name?: string;
			color?: string;
		}) => {
			const { id, ...fields } = input;
			const { data, error } = await supabase
				.from("categories")
				.update(fields)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("categories").delete().eq("id", id);

			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}
