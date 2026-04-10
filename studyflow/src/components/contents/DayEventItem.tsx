import { BookOpen, Clock } from "lucide-react";
import type { Session } from "../../types";

interface DayEventItemProps {
	session: Session;
	contentTitle: string;
}

const STATUS_STYLES: Record<Session["status"], string> = {
	pending: "text-amber-700 bg-amber-100 border border-amber-200",
	done: "text-emerald-700 bg-emerald-100 border border-emerald-200",
	skipped: "text-gray-500 bg-gray-100 border border-gray-200",
};

const STATUS_LABELS: Record<Session["status"], string> = {
	pending: "Pendente",
	done: "Concluída",
	skipped: "Pulada",
};

export function DayEventItem({ session, contentTitle }: DayEventItemProps) {
	const title = contentTitle || "Conteúdo desconhecido";

	return (
		<div className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
			<div className="flex items-center gap-3 min-w-0">
				<div className="bg-indigo-50 p-2 rounded-lg text-indigo-500 shrink-0">
					<BookOpen className="w-4 h-4" />
				</div>
				<span
					className="text-sm font-semibold text-gray-800 truncate"
					title={title}
				>
					{title}
				</span>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<span className="flex items-center gap-1 text-xs font-medium text-gray-500">
					<Clock className="w-3.5 h-3.5" />
					{session.plannedHours}h
				</span>
				<span
					className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_STYLES[session.status]}`}
				>
					{STATUS_LABELS[session.status]}
				</span>
			</div>
		</div>
	);
}
