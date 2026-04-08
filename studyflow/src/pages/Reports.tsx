import { useState } from "react";
import { WeeklyReport } from "../components/reports/WeeklyReport";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

/** Returns the Monday of the current ISO week as YYYY-MM-DD */
function getCurrentMonday(): string {
	const today = new Date();
	const day = today.getDay(); // 0 = Sun, 1 = Mon, ...
	const diff = day === 0 ? -6 : 1 - day;
	const monday = new Date(today);
	monday.setDate(today.getDate() + diff);
	const y = monday.getFullYear();
	const m = String(monday.getMonth() + 1).padStart(2, "0");
	const d = String(monday.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Adds `days` days to a YYYY-MM-DD string and returns a new YYYY-MM-DD string */
function addDays(dateStr: string, days: number): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	date.setDate(date.getDate() + days);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Formats a YYYY-MM-DD string as DD/MM */
function formatShort(dateStr: string): string {
	const [, month, day] = dateStr.split("-");
	return `${day}/${month}`;
}

/** Formats a YYYY-MM-DD string as DD/MM/YYYY */
function formatFull(dateStr: string): string {
	const [year, month, day] = dateStr.split("-");
	return `${day}/${month}/${year}`;
}

export function Reports() {
	const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentMonday);

	const thisMonday = getCurrentMonday();
	const isCurrentWeek = currentWeekStart >= thisMonday;

	const weekEnd = addDays(currentWeekStart, 6);
	const weekLabel = `${formatShort(currentWeekStart)} – ${formatFull(weekEnd)}`;

	function goToPreviousWeek() {
		setCurrentWeekStart((prev) => addDays(prev, -7));
	}

	function goToNextWeek() {
		if (!isCurrentWeek) {
			setCurrentWeekStart((prev) => addDays(prev, 7));
		}
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 p-3 rounded-2xl">
						<BarChart3 className="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">Seu Progresso</h1>
						<p className="text-sm font-medium text-slate-500">Relatórios semanais da sua jornada</p>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
					<button
						type="button"
						onClick={goToPreviousWeek}
						className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm"
					>
						<ChevronLeft className="w-4 h-4" />
						Semana Anterior
					</button>

					<div className="flex bg-white shadow-sm border border-gray-200 rounded-xl px-6 py-2.5 items-center justify-center min-w-48 text-indigo-900">
						<span className="text-sm font-black tracking-wide">
							{weekLabel}
						</span>
					</div>

					<button
						type="button"
						onClick={goToNextWeek}
						disabled={isCurrentWeek}
						className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all shadow-sm"
					>
						Próxima Semana
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>

				<WeeklyReport weekStart={currentWeekStart} />
			</div>
		</div>
	);
}
