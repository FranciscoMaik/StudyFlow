import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, Library, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { CalendarView } from "../components/contents/CalendarView";
import { ContentCard } from "../components/contents/ContentCard";
import { ContentForm } from "../components/contents/ContentForm";
import { ContentList } from "../components/contents/ContentList";
import { DailyView } from "../components/dashboard/DailyView";
import { WeeklyView } from "../components/dashboard/WeeklyView";
import { XPBar } from "../components/gamification/XPBar";
import { useRecordDailyLogin, useUserProfile } from "../hooks/useGamification";
import { useSchedule } from "../hooks/useSchedule";
import { useDoneContents, useReopenContent } from "../hooks/useContents";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Content } from "../types";

type Tab = "hoje" | "semana";

export function Contents() {
	const [showForm, setShowForm] = useState(false);
	const [editingContent, setEditingContent] = useState<Content | undefined>();
	const [activeTab, setActiveTab] = useState<Tab>("hoje");

	const { data: doneContents = [] } = useDoneContents();
	const reopenMutation = useReopenContent();

	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { data: userProfile, isLoading } = useUserProfile();
	const recordDailyLogin = useRecordDailyLogin();

	const { data: schedule } = useSchedule();
	const weeklyCapacityHours = schedule
		? schedule
				.filter((d) => d.isActive)
				.reduce((sum, d) => sum + d.availableHours, 0)
		: undefined;

	// Credit daily login XP on mount — intentionally run once
	const mutate = recordDailyLogin.mutate;
	useEffect(() => {
		mutate();
	}, [mutate]);

	// Supabase Realtime: invalidate userProfile when xp_transactions or streaks change
	useEffect(() => {
		if (!user) return;

		const channel = supabase
			.channel("contents-dashboard-realtime")
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

	function handleEdit(content: Content) {
		setEditingContent(content);
		setShowForm(true);
	}

	function handleClose() {
		setShowForm(false);
		setEditingContent(undefined);
	}

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
		<main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
			{/* XP Bar */}
			{userProfile && (
				<XPBar
					totalXP={userProfile.totalXP}
					level={userProfile.level}
					levelName={userProfile.levelName}
					xpToNextLevel={userProfile.xpToNextLevel}
				/>
			)}

			{/* Tab navigation */}
			<nav aria-label="Visualização do progresso" className="flex justify-center">
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
			<div className="relative">
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

			<hr className="border-gray-100" />

			{/* Content Catalog header */}
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 p-3 rounded-2xl">
						<Library className="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">
							Cursos & Módulos
						</h1>
						<p className="text-sm font-medium text-slate-500">
							Gerencie sua trilha de aprendizagem
						</p>
					</div>
				</div>
				{!showForm && (
					<button
						type="button"
						onClick={() => setShowForm(true)}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/20"
					>
						<Plus className="w-4 h-4" />
						Criar Módulo
					</button>
				)}
			</div>

			{showForm && (
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
					<div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
						<h2 className="text-lg font-bold text-slate-800">
							{editingContent ? "Editar Módulo" : "Novo Módulo"}
						</h2>
						<button
							type="button"
							onClick={handleClose}
							className="bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
							aria-label="Fechar formulário"
						>
							×
						</button>
					</div>
					<ContentForm content={editingContent} onSuccess={handleClose} />
				</div>
			)}

			<CalendarView />

			<hr className="border-gray-100" />

			<ContentList
				onEdit={handleEdit}
				weeklyCapacityHours={weeklyCapacityHours}
			/>

			<section className="space-y-4">
				<div className="flex items-center gap-3 border-b border-gray-100 pb-4">
					<div className="bg-slate-50 p-3 rounded-2xl">
						<Archive className="w-6 h-6 text-slate-500" />
					</div>
					<div>
						<h2 className="text-xl font-bold text-slate-700">
							Concluídos & Arquivados
						</h2>
						<p className="text-sm font-medium text-slate-400">
							Módulos finalizados ou arquivados
						</p>
					</div>
				</div>

				{doneContents.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
						<Archive className="w-10 h-10 mb-3 opacity-40" />
						<p className="font-semibold text-slate-500">
							Nenhum conteúdo concluído ainda
						</p>
						<p className="text-sm mt-1">
							Módulos marcados como feitos ou arquivados aparecerão aqui.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{doneContents.map((content) => (
							<div key={content.id} className="flex flex-col gap-2">
								<ContentCard content={content} />
								<button
									type="button"
									onClick={() => reopenMutation.mutate(content.id)}
									disabled={reopenMutation.isPending}
									className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-50"
								>
									<RotateCcw className="w-4 h-4" />
									Reabrir
								</button>
							</div>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
