/**
 * Streak calculation logic (client-side).
 * The authoritative DB update is handled by the PostgreSQL trigger `update_streak()` (Task 2.3).
 * This module provides client-side logic for display/optimistic updates.
 *
 * Req 8.1: Increment streak when lastStudyDate = yesterday.
 * Req 8.1: No change when lastStudyDate = today (already counted).
 * Req 8.2: Reset streak to 1 when lastStudyDate is more than 1 day ago (or null).
 */

export interface StreakState {
	currentStreak: number;
	longestStreak: number;
	lastStudyDate: string | null; // ISO date YYYY-MM-DD
}

/**
 * Returns the difference in calendar days between two ISO date strings (YYYY-MM-DD).
 * Positive when `a` is after `b`.
 */
function daysDiff(a: string, b: string): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay);
}

/**
 * Given the current streak state and today's ISO date, returns the new streak state
 * after a study session is completed today.
 *
 * Rules (Req 8.1, 8.2):
 * - lastStudyDate === today  → no change (session already counted today)
 * - lastStudyDate === yesterday → increment currentStreak by 1
 * - lastStudyDate is null or more than 1 day ago → reset currentStreak to 1
 * - longestStreak is updated whenever currentStreak exceeds it
 */
export function calculateNewStreak(
	state: StreakState,
	today: string,
): StreakState {
	const { lastStudyDate, currentStreak, longestStreak } = state;

	// Already studied today — nothing changes
	if (lastStudyDate === today) {
		return { ...state };
	}

	let newStreak: number;

	if (lastStudyDate !== null && daysDiff(today, lastStudyDate) === 1) {
		// Studied yesterday → continue the streak
		newStreak = currentStreak + 1;
	} else {
		// No study date recorded, or gap > 1 day → start fresh
		newStreak = 1;
	}

	const newLongest = newStreak > longestStreak ? newStreak : longestStreak;

	return {
		currentStreak: newStreak,
		longestStreak: newLongest,
		lastStudyDate: today,
	};
}

/**
 * Returns true if the streak should be reset to 0.
 *
 * The streak must be reset when the user had a study date recorded but skipped
 * at least one full calendar day (i.e., the gap between lastStudyDate and today
 * is greater than 1 day). (Req 8.2)
 *
 * Returns false when:
 * - lastStudyDate is null (no streak to reset)
 * - lastStudyDate is today (studied today, streak intact)
 * - lastStudyDate is yesterday (streak continues)
 */
export function shouldResetStreak(
	lastStudyDate: string | null,
	today: string,
): boolean {
	if (lastStudyDate === null) return false;
	return daysDiff(today, lastStudyDate) > 1;
}
