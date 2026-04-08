export interface Content {
	id: string;
	userId: string;
	title: string; // max 120 chars
	description?: string; // max 500 chars
	estimatedHours: number; // min 0.5
	completedHours: number;
	priority: "low" | "medium" | "high";
	deadline?: string; // ISO date
	categoryId?: string;
	status: "active" | "done" | "archived";
	createdAt: string;
}

export interface Session {
	id: string;
	userId: string;
	contentId: string;
	scheduledDate: string; // ISO date
	plannedHours: number;
	status: "pending" | "done" | "skipped";
	completedAt?: string;
}

export interface ScheduleDay {
	dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=domingo
	isActive: boolean;
	availableHours: number; // min 0.5, max 24
}

export interface Category {
	id: string;
	userId: string;
	name: string; // max 50 chars
	color: string; // hex da paleta predefinida
}

export interface XPTransaction {
	id: string;
	userId: string;
	amount: number;
	reason: string;
	sourceType:
		| "session"
		| "content"
		| "streak"
		| "weekly_goal"
		| "login"
		| "content_creation"
		| "early_completion";
	sourceId?: string;
	createdAt: string;
}

export interface Achievement {
	id: string;
	userId: string;
	achievementKey: AchievementKey;
	unlockedAt: string;
}

export type AchievementKey =
	| "em_chamas"
	| "devorador_de_livros"
	| "maratonista"
	| "pontual"
	| "semana_perfeita"
	| "madrugador";

export interface UserProfile {
	totalXP: number;
	level: number;
	levelName: string;
	xpToNextLevel: number;
	currentStreak: number;
	longestStreak: number;
}

export interface PlannerInput {
	contents: Content[];
	schedule: ScheduleDay[];
	existingSessions: Session[];
	horizonWeeks?: number; // default: 4
}

export interface PlannerOutput {
	sessions: Omit<Session, "id" | "userId">[];
}

export interface AchievementCheckContext {
	userId: string;
	currentStreak: number;
	totalContentsCompleted: number;
	totalStudyHours: number;
	contentsCompletedBeforeDeadline: number;
	consecutivePerfectWeeks: number;
	earlyMorningSessions: number; // sessions completed before 07h
	unlockedAchievements: AchievementKey[];
}
