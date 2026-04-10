import { CalendarDays } from "lucide-react";
import type { Session } from "../../types";
import { DayEventItem } from "./DayEventItem";

interface DayEventListProps {
	date: string;
	sessions: Session[];
	contentTitles: Record<string, string>;
}

function formatDatePtBR(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("pt-BR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function DayEventList({
	date,
	sessions,
	contentTitles,
}: DayEventListProps) {
	const formattedDate = formatDatePtBR(date);
	const capitalizedDate =
		formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

	return (
		<div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
			<div className="flex items-center gap-2 mb-3">
				<CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
				<h3 className="text-sm font-semibold text-gray-700">
					{capitalizedDate}
				</h3>
			</div>

			{sessions.length === 0 ? (
				<p className="text-sm text-gray-400 text-center py-4">
					Nenhuma sessão neste dia.
				</p>
			) : (
				<div className="flex flex-col gap-2">
					{sessions.map((session) => (
						<DayEventItem
							key={session.id}
							session={session}
							contentTitle={contentTitles[session.contentId] ?? ""}
						/>
					))}
				</div>
			)}
		</div>
	);
}
