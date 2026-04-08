interface LevelBadgeProps {
	level: number;
	levelName: string;
}

export function LevelBadge({ level, levelName }: LevelBadgeProps) {
	return (
		<div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 rounded-full px-3 py-1">
			<span className="text-xs font-bold uppercase tracking-wide">Nível</span>
			<span className="text-lg font-extrabold leading-none">{level}</span>
			<span className="text-sm font-medium">{levelName}</span>
		</div>
	);
}
