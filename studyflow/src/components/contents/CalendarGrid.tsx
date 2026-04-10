import { buildCalendarGrid, getDayIndicatorType } from "../../lib/calendar";
import type { Session } from "../../types";
import { CalendarDay } from "./CalendarDay";

interface CalendarGridProps {
	year: number;
	month: number;
	sessionsByDate: Record<string, Session[]>;
	selectedDay: string | null;
	onDayClick: (dateStr: string) => void;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarGrid({
	year,
	month,
	sessionsByDate,
	selectedDay,
	onDayClick,
}: CalendarGridProps) {
	const today = new Date().toISOString().slice(0, 10);
	const weeks = buildCalendarGrid(year, month);

	return (
		<div>
			<div className="grid grid-cols-7 mb-1">
				{WEEKDAY_LABELS.map((label) => (
					<div
						key={label}
						className="text-center text-xs font-semibold text-gray-500 py-1"
					>
						{label}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-y-1">
				{weeks.flat().map((day, idx) => {
					const dateStr =
						day !== null
							? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
							: null;
					const sessions = dateStr ? (sessionsByDate[dateStr] ?? []) : [];
					const indicatorType = getDayIndicatorType(sessions);
					const isToday = dateStr === today;
					const isSelected = dateStr !== null && dateStr === selectedDay;
					const cellKey = dateStr ?? `empty-${idx}`;

					return (
						<CalendarDay
							key={cellKey}
							day={day}
							dateStr={dateStr}
							isToday={isToday}
							isSelected={isSelected}
							indicatorType={indicatorType}
							onClick={() => {
								if (dateStr) onDayClick(dateStr);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}
