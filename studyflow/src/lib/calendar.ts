import type { Session } from "../types";

/**
 * Builds a calendar grid for the given year and month.
 * Returns a matrix of weeks (Sun–Sat), filling with `null` before the
 * first day and after the last day of the month.
 *
 * @param year  - Full year (e.g. 2025)
 * @param month - Month index 0–11 (0 = January)
 * @returns Array of weeks, each week being an array of 7 entries (number | null)
 */
export function buildCalendarGrid(
	year: number,
	month: number,
): (number | null)[][] {
	const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const weeks: (number | null)[][] = [];
	let week: (number | null)[] = Array(firstDay).fill(null);

	for (let day = 1; day <= daysInMonth; day++) {
		week.push(day);
		if (week.length === 7) {
			weeks.push(week);
			week = [];
		}
	}

	if (week.length > 0) {
		while (week.length < 7) week.push(null);
		weeks.push(week);
	}

	return weeks;
}

/**
 * Groups an array of sessions by their `scheduledDate` field.
 *
 * @param sessions - Array of Session objects
 * @returns A record mapping each date string to the sessions on that date
 */
export function groupSessionsByDate(
	sessions: Session[],
): Record<string, Session[]> {
	return sessions.reduce<Record<string, Session[]>>((acc, session) => {
		const key = session.scheduledDate;
		if (!acc[key]) acc[key] = [];
		acc[key].push(session);
		return acc;
	}, {});
}

/**
 * Determines the visual indicator type for a day based on its sessions.
 *
 * @param sessions - Sessions for a specific day
 * @returns `null` if no sessions, `'done'` if all are done, `'pending'` if any is pending
 */
export function getDayIndicatorType(
	sessions: Session[],
): "done" | "pending" | null {
	if (sessions.length === 0) return null;
	if (sessions.every((s) => s.status === "done")) return "done";
	return "pending";
}

/**
 * Navigates to the next or previous month, wrapping correctly across year boundaries.
 *
 * @param year  - Current year
 * @param month - Current month index 0–11
 * @param delta - `1` to advance, `-1` to go back
 * @returns New `{ year, month }` after navigation
 */
export function navigateMonth(
	year: number,
	month: number,
	delta: 1 | -1,
): { year: number; month: number } {
	const date = new Date(year, month + delta, 1);
	return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * Filters sessions by exact `scheduledDate`.
 *
 * @param date     - ISO date string (YYYY-MM-DD)
 * @param sessions - Array of Session objects to filter
 * @returns Sessions whose `scheduledDate` matches `date` exactly
 */
export function getSessionsForDate(
	date: string,
	sessions: Session[],
): Session[] {
	return sessions.filter((s) => s.scheduledDate === date);
}
