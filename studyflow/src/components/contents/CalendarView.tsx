import { useState } from "react";
import { useContents } from "../../hooks/useContents";
import { useMonthSessions } from "../../hooks/useMonthSessions";
import {
	getSessionsForDate,
	groupSessionsByDate,
	navigateMonth,
} from "../../lib/calendar";
import { CalendarGrid } from "./CalendarGrid";
import { DayEventList } from "./DayEventList";
import { MonthNavigator } from "./MonthNavigator";

export function CalendarView() {
	const [currentMonth, setCurrentMonth] = useState<{
		year: number;
		month: number;
	}>(() => {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() };
	});
	const [selectedDay, setSelectedDay] = useState<string | null>(null);

	const { year, month } = currentMonth;
	const {
		data: sessions = [],
		isLoading,
		isError,
	} = useMonthSessions(year, month);
	const { data: contents = [] } = useContents();

	const contentTitles: Record<string, string> = Object.fromEntries(
		contents.map((c) => [c.id, c.title]),
	);

	const sessionsByDate = groupSessionsByDate(sessions);

	function handleDayClick(dateStr: string) {
		const daySessions = sessionsByDate[dateStr] ?? [];
		if (daySessions.length === 0 || dateStr === selectedDay) {
			setSelectedDay(null);
		} else {
			setSelectedDay(dateStr);
		}
	}

	function handlePrev() {
		setSelectedDay(null);
		setCurrentMonth((m) => navigateMonth(m.year, m.month, -1));
	}

	function handleNext() {
		setSelectedDay(null);
		setCurrentMonth((m) => navigateMonth(m.year, m.month, 1));
	}

	function handleToday() {
		const now = new Date();
		setSelectedDay(null);
		setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
	}

	const selectedDaySessions = selectedDay
		? getSessionsForDate(selectedDay, sessions)
		: [];

	return (
		<div>
			<MonthNavigator
				year={year}
				month={month}
				onPrev={handlePrev}
				onNext={handleNext}
				onToday={handleToday}
			/>

			{isLoading && (
				<div className="flex justify-center items-center py-12">
					<div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
				</div>
			)}

			{isError && (
				<p className="text-sm text-red-500 text-center py-4">
					Não foi possível carregar as sessões.
				</p>
			)}

			{!isLoading && !isError && (
				<CalendarGrid
					year={year}
					month={month}
					sessionsByDate={sessionsByDate}
					selectedDay={selectedDay}
					onDayClick={handleDayClick}
				/>
			)}

			{selectedDay && selectedDaySessions.length > 0 && (
				<DayEventList
					date={selectedDay}
					sessions={selectedDaySessions}
					contentTitles={contentTitles}
				/>
			)}
		</div>
	);
}
