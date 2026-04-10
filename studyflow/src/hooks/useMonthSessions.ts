import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Session } from "../types";
import { mapSession } from "./useSessions";

/** Requirements 2.1, 2.4, 2.5, 5.2, 5.3 — sessions for a given month */
export function useMonthSessions(
	year: number,
	month: number,
): UseQueryResult<Session[]> {
	const { user } = useAuthStore();

	return useQuery<Session[]>({
		queryKey: ["sessions", "month", year, month],
		queryFn: async () => {
			const firstDay = new Date(year, month, 1);
			const lastDay = new Date(year, month + 1, 0);

			const fmt = (d: Date) => {
				const y = d.getFullYear();
				const m = String(d.getMonth() + 1).padStart(2, "0");
				const day = String(d.getDate()).padStart(2, "0");
				return `${y}-${m}-${day}`;
			};

			const { data, error } = await supabase
				.from("sessions")
				.select("*")
				.eq("user_id", user!.id)
				.gte("scheduled_date", fmt(firstDay))
				.lte("scheduled_date", fmt(lastDay))
				.in("status", ["pending", "done"])
				.order("scheduled_date", { ascending: true });

			if (error) throw error;

			return (data ?? []).map(mapSession);
		},
		enabled: !!user,
	});
}
