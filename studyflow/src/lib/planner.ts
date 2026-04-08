import type {
	Content,
	PlannerInput,
	PlannerOutput,
	ScheduleDay,
	Session,
} from "../types";

const PRIORITY_ORDER: Record<Content["priority"], number> = {
	high: 0,
	medium: 1,
	low: 2,
};

function toDateString(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

function sortContents(contents: Content[]): Content[] {
	return [...contents].sort((a, b) => {
		// 1. Prazo mais próximo (nulos por último)
		if (a.deadline && b.deadline) {
			const diff = a.deadline.localeCompare(b.deadline);
			if (diff !== 0) return diff;
		} else if (a.deadline) {
			return -1;
		} else if (b.deadline) {
			return 1;
		}

		// 2. Prioridade: alta > média > baixa
		const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		if (pDiff !== 0) return pDiff;

		// 3. Menor horas restantes
		const aRemaining = a.estimatedHours - a.completedHours;
		const bRemaining = b.estimatedHours - b.completedHours;
		return aRemaining - bRemaining;
	});
}

export function generatePlan(input: PlannerInput): PlannerOutput {
	const { contents, schedule, existingSessions, horizonWeeks = 4 } = input;

	// Only active contents with remaining hours
	const activeContents = contents.filter(
		(c) => c.status === "active" && c.completedHours < c.estimatedHours,
	);

	if (activeContents.length === 0 || schedule.length === 0) {
		return { sessions: [] };
	}

	const sorted = sortContents(activeContents);

	// Track remaining hours per content (mutable copy)
	const remainingHours = new Map<string, number>(
		sorted.map((c) => [c.id, Math.max(0, c.estimatedHours - c.completedHours)]),
	);

	// Build a map of existing sessions: date -> contentId[]
	const existingByDate = new Map<string, string[]>();
	for (const s of existingSessions) {
		const list = existingByDate.get(s.scheduledDate) ?? [];
		list.push(s.contentId);
		existingByDate.set(s.scheduledDate, list);
	}

	// Build a map of existing allocated hours per day (from existing sessions)
	const allocatedByDate = new Map<string, number>();
	for (const s of existingSessions) {
		allocatedByDate.set(
			s.scheduledDate,
			(allocatedByDate.get(s.scheduledDate) ?? 0) + s.plannedHours,
		);
	}

	// Build schedule lookup: dayOfWeek -> availableHours (only active days)
	const scheduleMap = new Map<number, number>();
	for (const day of schedule) {
		if (day.isActive && day.availableHours > 0) {
			scheduleMap.set(day.dayOfWeek, day.availableHours);
		}
	}

	const generatedSessions: PlannerOutput["sessions"] = [];

	// Start from tomorrow
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const startDate = addDays(today, 1);
	const endDate = addDays(today, horizonWeeks * 7);

	// Track which content was allocated on the previous day (for consecutive-day rule)
	let previousDayContentIds = new Set<string>();

	let currentDate = startDate;
	while (currentDate <= endDate) {
		const dayOfWeek = currentDate.getDay();
		const dateStr = toDateString(currentDate);

		if (!scheduleMap.has(dayOfWeek)) {
			// Inactive day — carry over previous day's allocations for consecutive check
			// (no allocation happens, so reset previous day tracking)
			previousDayContentIds = new Set<string>();
			currentDate = addDays(currentDate, 1);
			continue;
		}

		const dailyLimit = scheduleMap.get(dayOfWeek) as number;
		const alreadyAllocated = allocatedByDate.get(dateStr) ?? 0;
		let availableToday = Math.max(0, dailyLimit - alreadyAllocated);

		const todayContentIds = new Set<string>();

		for (const content of sorted) {
			if (availableToday <= 0) break;

			const remaining = remainingHours.get(content.id) ?? 0;
			if (remaining <= 0) continue;

			// Consecutive-day rule: skip if allocated yesterday AND there are alternatives
			if (previousDayContentIds.has(content.id)) {
				const hasAlternative = sorted.some(
					(c) =>
						c.id !== content.id &&
						(remainingHours.get(c.id) ?? 0) > 0 &&
						!previousDayContentIds.has(c.id),
				);
				if (hasAlternative) continue;
			}

			const block = Math.round(Math.min(remaining, availableToday) * 100) / 100;
			if (block <= 0) continue;

			generatedSessions.push({
				contentId: content.id,
				scheduledDate: dateStr,
				plannedHours: block,
				status: "pending",
			});

			todayContentIds.add(content.id);
			remainingHours.set(
				content.id,
				Math.round((remaining - block) * 100) / 100,
			);
			availableToday = Math.round((availableToday - block) * 100) / 100;
		}

		previousDayContentIds = todayContentIds;
		currentDate = addDays(currentDate, 1);
	}

	return { sessions: generatedSessions };
}

export function rescheduleMissedSessions(
	missed: Session[],
	schedule: ScheduleDay[],
): Session[] {
	const scheduleMap = new Map<number, number>();
	for (const day of schedule) {
		if (day.isActive && day.availableHours > 0) {
			scheduleMap.set(day.dayOfWeek, day.availableHours);
		}
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return missed.map((session) => {
		// Find next available day within 7 days
		for (let i = 1; i <= 7; i++) {
			const candidate = addDays(today, i);
			if (scheduleMap.has(candidate.getDay())) {
				return {
					...session,
					scheduledDate: toDateString(candidate),
					status: "pending" as const,
				};
			}
		}
		// If no available day found, keep original
		return session;
	});
}
