interface StreakCounterProps {
	streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
	return (
		<div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 rounded-full px-3 py-1">
			<span className="text-xl leading-none" aria-hidden="true">
				🔥
			</span>
			<span className="text-2xl font-extrabold leading-none">{streak}</span>
			<span className="text-sm font-medium">dias</span>
		</div>
	);
}
