interface CalendarDayProps {
	day: number | null;
	dateStr: string | null;
	isToday: boolean;
	isSelected: boolean;
	indicatorType: "done" | "pending" | null;
	onClick: () => void;
}

export function CalendarDay({
	day,
	isToday,
	isSelected,
	indicatorType,
	onClick,
}: CalendarDayProps) {
	if (day === null) {
		return <div className="h-10" />;
	}

	const baseClasses =
		"relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full cursor-pointer select-none text-sm font-medium transition-colors";

	const stateClasses = isSelected
		? "bg-indigo-600 text-white"
		: isToday
			? "ring-2 ring-indigo-500 text-indigo-700 font-bold"
			: "text-gray-700 hover:bg-gray-100";

	const dotColor =
		indicatorType === "done"
			? "bg-emerald-500"
			: indicatorType === "pending"
				? "bg-amber-400"
				: null;

	return (
		<button
			type="button"
			onClick={onClick}
			className={`${baseClasses} ${stateClasses}`}
			aria-label={`Dia ${day}`}
			aria-pressed={isSelected}
		>
			<span>{day}</span>
			{dotColor && (
				<span
					className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${dotColor}`}
				/>
			)}
		</button>
	);
}
