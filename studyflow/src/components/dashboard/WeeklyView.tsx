import { motion } from "framer-motion";
import { CalendarDays, Flag } from "lucide-react";
import { useContents } from "../../hooks/useContents";
import {
	useCompleteSession,
	useSkipSession,
	useWeeklySessions,
} from "../../hooks/useSessions";
import type { Session } from "../../types";
import { SessionCard } from "./SessionCard";

const WEEKDAY_NAMES = [
	"Domingo",
	"Segunda-feira",
	"Terça-feira",
	"Quarta-feira",
	"Quinta-feira",
	"Sexta-feira",
	"Sábado",
];

function getCurrentWeekDates(): string[] {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(now);
	monday.setDate(now.getDate() - daysToMonday);

	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	});
}

function formatDayLabel(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	const d = new Date(year, month - 1, day);
	const weekday = WEEKDAY_NAMES[d.getDay()].slice(0, 3);
	return `${weekday}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

function calcWeeklyProgress(sessions: Session[]): {
	completedHours: number;
	totalHours: number;
	percent: number;
} {
	let completedHours = 0;
	let totalHours = 0;

	for (const s of sessions) {
		totalHours += s.plannedHours;
		if (s.status === "done") {
			completedHours += s.plannedHours;
		}
	}

	const percent = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
	return { completedHours, totalHours, percent };
}

export function WeeklyView() {
	const { data: sessions, isLoading: sessionsLoading } = useWeeklySessions();
	const { data: contents, isLoading: contentsLoading } = useContents();
	const completeSession = useCompleteSession();
	const skipSession = useSkipSession();

	const isLoading = sessionsLoading || contentsLoading;
	const weekDates = getCurrentWeekDates();

	const contentTitleMap: Record<string, string> = {};
	if (contents) {
		for (const c of contents) {
			contentTitleMap[c.id] = c.title;
		}
	}

	const sessionsByDate: Record<string, Session[]> = {};
	if (sessions) {
		for (const s of sessions) {
			if (!sessionsByDate[s.scheduledDate]) {
				sessionsByDate[s.scheduledDate] = [];
			}
			sessionsByDate[s.scheduledDate].push(s);
		}
	}

	const { completedHours, totalHours, percent } = calcWeeklyProgress(
		sessions ?? [],
	);

	return (
		<section aria-label="Visão semanal" className="space-y-6">
			<div className="flex items-center gap-2 border-b border-gray-100 pb-4">
				<CalendarDays className="w-5 h-5 text-indigo-500" />
				<h2 className="text-xl font-bold text-gray-800">Esta semana</h2>
			</div>

			{/* Weekly goal progress */}
			<div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
				<div className="absolute right-0 top-0 text-indigo-100/50 -mt-4 -mr-4">
					<Flag className="w-32 h-32" />
				</div>
				<div className="relative z-10">
					<div className="mb-3 flex items-center justify-between text-sm font-semibold text-indigo-900">
						<span>Progresso da Jornada</span>
						<span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-md">
							{completedHours.toFixed(1)}h / {totalHours.toFixed(1)}h
						</span>
					</div>
					<div
						className="h-4 w-full overflow-hidden rounded-full bg-indigo-100 shadow-inner"
						role="progressbar"
						aria-valuenow={Math.round(percent)}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="Progresso da meta semanal"
					>
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${Math.min(percent, 100)}%` }}
							transition={{ duration: 1, ease: "easeOut" }}
							className="h-full rounded-full bg-indigo-500 transition-all shadow-md relative"
						>
							<div
								className="absolute inset-0 bg-white/20"
								style={{
									backgroundImage:
										"repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
								}}
							></div>
						</motion.div>
					</div>
					<p className="mt-2 text-right text-xs font-bold uppercase tracking-wider text-indigo-600">
						{Math.round(percent)}% concluído
					</p>
				</div>
			</div>

			{/* Days */}
			{isLoading ? (
				<div className="space-y-6">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-32 animate-pulse rounded-2xl bg-gray-100"
							aria-hidden="true"
						/>
					))}
					<p className="sr-only">Carregando missões da semana...</p>
				</div>
			) : (
				<div className="space-y-6">
					{weekDates.map((date) => {
						const daySessions = sessionsByDate[date] ?? [];
						if (daySessions.length === 0) return null;

						return (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								key={date}
								className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-1.5 h-6 bg-indigo-400 rounded-full"></div>
									<h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">
										{formatDayLabel(date)}
									</h3>
								</div>
								<ul className="space-y-3">
									{daySessions.map((session) => (
										<li key={session.id}>
											<SessionCard
												session={session}
												contentTitle={
													contentTitleMap[session.contentId] ??
													"Missão Desconhecida"
												}
												onComplete={(id, elapsed) =>
													completeSession.mutate({
														sessionId: id,
														elapsedSeconds: elapsed,
													})
												}
												onSkip={(id) => skipSession.mutate(id)}
											/>
										</li>
									))}
								</ul>
							</motion.div>
						);
					})}

					{sessions && sessions.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
							<div className="text-4xl mb-3">🏖️</div>
							<p className="text-gray-500 font-medium">
								Nenhum estudo planejado para esta semana.
							</p>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
