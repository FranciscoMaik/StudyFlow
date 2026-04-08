import { ScheduleConfig } from "../components/schedule/ScheduleConfig";
import { CalendarClock } from "lucide-react";

export function Schedule() {
	return (
		<main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 p-3 rounded-2xl">
						<CalendarClock className="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">Agenda Semanal</h1>
						<p className="text-sm font-medium text-slate-500">Configure sua disponibilidade de estudos</p>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
				<ScheduleConfig />
			</div>
		</main>
	);
}
