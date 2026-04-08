import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DailyView } from "../components/dashboard/DailyView";
import { WeeklyView } from "../components/dashboard/WeeklyView";
import { XPBar } from "../components/gamification/XPBar";
import { useRecordDailyLogin, useUserProfile } from "../hooks/useGamification";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "hoje" | "semana";

export function Dashboard() {
	const [activeTab, setActiveTab] = useState<Tab>("hoje");
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { data: userProfile, isLoading } = useUserProfile();
	const recordDailyLogin = useRecordDailyLogin();

	// Credit daily login XP on mount — intentionally run once
	const mutate = recordDailyLogin.mutate;
	useEffect(() => {
		mutate();
	}, [mutate]);

	// Supabase Realtime: invalidate userProfile when xp_transactions or streaks change
	useEffect(() => {
		if (!user) return;

		const channel = supabase
			.channel("dashboard-realtime")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "xp_transactions",
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					queryClient.invalidateQueries({ queryKey: ["userProfile"] });
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "streaks",
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					queryClient.invalidateQueries({ queryKey: ["userProfile"] });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, queryClient]);

	if (isLoading) {
		return (
			<div
				className="flex items-center justify-center min-h-64"
				aria-live="polite"
			>
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
				<span className="sr-only">Carregando dashboard...</span>
			</div>
		);
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
			{/* Header and XP Bar */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-slate-800">Seu Progresso</h1>
				</div>
				{userProfile && (
					<XPBar
						totalXP={userProfile.totalXP}
						level={userProfile.level}
						levelName={userProfile.levelName}
						xpToNextLevel={userProfile.xpToNextLevel}
					/>
				)}
			</section>

			{/* Tab navigation */}
			<nav aria-label="Visualização do dashboard" className="flex justify-center">
				<div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-full w-full max-w-sm backdrop-blur-sm shadow-inner relative">
					<button
						type="button"
						onClick={() => setActiveTab("hoje")}
						className={`relative flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors z-10 ${
							activeTab === "hoje"
								? "text-white"
								: "text-gray-500 hover:text-gray-700"
						}`}
						aria-pressed={activeTab === "hoje"}
					>
						{activeTab === "hoje" && (
							<motion.div
								layoutId="activeTabBadge"
								className="absolute inset-0 bg-indigo-500 rounded-full shadow-md -z-10"
								initial={false}
								transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
							/>
						)}
						Missão Diária
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("semana")}
						className={`relative flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors z-10 ${
							activeTab === "semana"
								? "text-white"
								: "text-gray-500 hover:text-gray-700"
						}`}
						aria-pressed={activeTab === "semana"}
					>
						{activeTab === "semana" && (
							<motion.div
								layoutId="activeTabBadge"
								className="absolute inset-0 bg-indigo-500 rounded-full shadow-md -z-10"
								initial={false}
								transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
							/>
						)}
						Visão Semanal
					</button>
				</div>
			</nav>

			{/* Tab content */}
			<div className="relative mt-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						{activeTab === "hoje" ? (
							<DailyView streak={userProfile?.currentStreak ?? 0} />
						) : (
							<WeeklyView />
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</main>
	);
}
