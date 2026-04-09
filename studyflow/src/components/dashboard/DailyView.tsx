import { AnimatePresence, motion } from "framer-motion";
import { Target } from "lucide-react";
import { useState } from "react";
import { useContents, useMarkContentDone } from "../../hooks/useContents";
import {
	useCompleteSession,
	useSkipSession,
	useTodaySessions,
} from "../../hooks/useSessions";
import { StreakCounter } from "../gamification/StreakCounter";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SessionCard } from "./SessionCard";

interface DailyViewProps {
	streak: number;
}

function formatTodayPtBR(): string {
	return new Date().toLocaleDateString("pt-BR", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
}

export function DailyView({ streak }: DailyViewProps) {
	const { data: sessions, isLoading: sessionsLoading } = useTodaySessions();
	const { data: contents, isLoading: contentsLoading } = useContents();
	const completeSession = useCompleteSession();
	const skipSession = useSkipSession();
	const markContentDone = useMarkContentDone();
	const [pendingContentId, setPendingContentId] = useState<string | null>(null);

	const isLoading = sessionsLoading || contentsLoading;

	// Build id → title map from contents
	const contentTitleMap: Record<string, string> = {};
	if (contents) {
		for (const c of contents) {
			contentTitleMap[c.id] = c.title;
		}
	}

	return (
		<>
			<section aria-label="Visão diária" className="space-y-6">
				{/* Header: date + streak */}
				<div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
					<div>
						<h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
							<Target className="w-5 h-5 text-indigo-500" />
							Missões de Hoje
						</h2>
						<p className="text-sm font-medium capitalize text-gray-500 mt-1">
							{formatTodayPtBR()}
						</p>
					</div>
					<StreakCounter streak={streak} />
				</div>

				{/* Session list */}
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-24 animate-pulse rounded-xl bg-gray-100"
								aria-hidden="true"
							/>
						))}
						<p className="sr-only">Carregando missões...</p>
					</div>
				) : sessions && sessions.length > 0 ? (
					<motion.ul
						className="space-y-4"
						initial="hidden"
						animate="visible"
						variants={{
							hidden: { opacity: 0 },
							visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
						}}
					>
						<AnimatePresence mode="popLayout">
							{sessions.map((session) => (
								<motion.li
									key={session.id}
									layout
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{
										opacity: 0,
										scale: 0.9,
										transition: { duration: 0.2 },
									}}
								>
									<SessionCard
										session={session}
										contentTitle={
											contentTitleMap[session.contentId] ??
											"Missão Desconhecida"
										}
										onComplete={(id, elapsed) => {
											completeSession.mutate({
												sessionId: id,
												elapsedSeconds: elapsed,
											});
											setPendingContentId(session.contentId);
										}}
										onSkip={(id) => skipSession.mutate(id)}
									/>
								</motion.li>
							))}
						</AnimatePresence>
					</motion.ul>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
						<div className="text-4xl mb-3">🎉</div>
						<h3 className="text-lg font-bold text-gray-700">
							Todas as missões concluídas!
						</h3>
						<p className="text-gray-500 mt-1 max-w-sm">
							Você não tem mais estudos planejados para hoje. Bom descanso!
						</p>
					</div>
				)}
			</section>

			<ConfirmDialog
				open={!!pendingContentId}
				title="Marcar conteúdo como concluído?"
				description="Deseja marcar este conteúdo como concluído? Ele será movido para a seção de concluídos e as sessões futuras serão removidas."
				confirmLabel="Marcar como feito"
				isLoading={markContentDone.isPending}
				onConfirm={() => {
					if (pendingContentId) {
						markContentDone.mutate(pendingContentId);
					}
					setPendingContentId(null);
				}}
				onCancel={() => setPendingContentId(null)}
			/>
		</>
	);
}
