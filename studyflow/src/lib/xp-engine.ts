const LEVEL_THRESHOLDS = [
	{ level: 1, name: "Iniciante", minXP: 0 },
	{ level: 2, name: "Estudante", minXP: 500 },
	{ level: 3, name: "Dedicado", minXP: 1500 },
	{ level: 4, name: "Focado", minXP: 3500 },
	{ level: 5, name: "Expert", minXP: 7500 },
	{ level: 6, name: "Mestre", minXP: 15000 },
] as const;

export function getLevelThresholds(): {
	level: number;
	name: string;
	minXP: number;
}[] {
	return LEVEL_THRESHOLDS.map((t) => ({ ...t }));
}

export function calculateLevel(totalXP: number): {
	level: number;
	levelName: string;
	xpToNextLevel: number;
} {
	let current: (typeof LEVEL_THRESHOLDS)[number] = LEVEL_THRESHOLDS[0];

	for (const threshold of LEVEL_THRESHOLDS) {
		if (totalXP >= threshold.minXP) {
			current = threshold;
		} else {
			break;
		}
	}

	const nextIndex =
		LEVEL_THRESHOLDS.findIndex((t) => t.level === current.level) + 1;
	const next = LEVEL_THRESHOLDS[nextIndex];
	const xpToNextLevel = next ? next.minXP - totalXP : 0;

	return {
		level: current.level,
		levelName: current.name,
		xpToNextLevel,
	};
}
