import type { AchievementCheckContext, AchievementKey } from "../types";

const ACHIEVEMENT_CONDITIONS: Record<
	AchievementKey,
	(ctx: AchievementCheckContext) => boolean
> = {
	em_chamas: (ctx) => ctx.currentStreak >= 7,
	devorador_de_livros: (ctx) => ctx.totalContentsCompleted >= 10,
	maratonista: (ctx) => ctx.totalStudyHours >= 50,
	pontual: (ctx) => ctx.contentsCompletedBeforeDeadline >= 5,
	semana_perfeita: (ctx) => ctx.consecutivePerfectWeeks >= 4,
	madrugador: (ctx) => ctx.earlyMorningSessions >= 5,
};

/**
 * Checks which achievements are newly unlocked given the current context.
 * Returns only achievements that are NOT already unlocked and whose conditions are now met.
 *
 * Validates: Requirements 10.1, 10.3, 10.4
 */
export function checkAchievements(
	ctx: AchievementCheckContext,
): AchievementKey[] {
	const newlyUnlocked: AchievementKey[] = [];

	for (const [key, condition] of Object.entries(ACHIEVEMENT_CONDITIONS) as [
		AchievementKey,
		(ctx: AchievementCheckContext) => boolean,
	][]) {
		if (!ctx.unlockedAchievements.includes(key) && condition(ctx)) {
			newlyUnlocked.push(key);
		}
	}

	return newlyUnlocked;
}
