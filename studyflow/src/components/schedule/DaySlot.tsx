import type { ScheduleDay } from "../../types";
import { Coffee, GraduationCap } from "lucide-react";

const DAY_NAMES: Record<ScheduleDay["dayOfWeek"], string> = {
	0: "Domingo",
	1: "Segunda",
	2: "Terça",
	3: "Quarta",
	4: "Quinta",
	5: "Sexta",
	6: "Sábado",
};

interface DaySlotProps {
	day: ScheduleDay;
	onChange: (day: ScheduleDay) => void;
	error?: string;
}

export function DaySlot({ day, onChange, error }: DaySlotProps) {
	const dayName = DAY_NAMES[day.dayOfWeek];
	const checkboxId = `day-active-${day.dayOfWeek}`;
	const hoursId = `day-hours-${day.dayOfWeek}`;

	function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
		onChange({ ...day, isActive: e.target.checked });
	}

	function handleHoursChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = parseFloat(e.target.value);
		onChange({ ...day, availableHours: Number.isNaN(value) ? 0 : value });
	}

	return (
		<div
			className={`relative overflow-hidden flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-colors ${
				error 
					? "border-rose-400 bg-rose-50" 
					: day.isActive 
						? "border-indigo-200 bg-white shadow-sm" 
						: "border-gray-100 bg-gray-50 opacity-70 hover:opacity-100"
			}`}
		>
			<div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
				<label
					htmlFor={checkboxId}
					className="flex items-center gap-3 cursor-pointer select-none"
				>
					<div className="relative flex items-center justify-center">
						<input
							id={checkboxId}
							type="checkbox"
							checked={day.isActive}
							onChange={handleToggle}
							className="peer sr-only"
							aria-label={`Ativar ${dayName}`}
						/>
						<div className="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
							{day.isActive && (
								<svg aria-hidden="true" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							)}
						</div>
					</div>
					<span className={`text-base font-bold w-24 ${day.isActive ? "text-indigo-900" : "text-gray-500"}`}>
						{dayName}
					</span>
				</label>
			</div>

			<div className="flex items-center gap-4 z-10">
				{day.isActive ? (
					<div className="flex items-center gap-2">
						<div className="hidden sm:flex text-indigo-400 bg-indigo-50 p-1.5 rounded-lg">
							<GraduationCap className="w-4 h-4" />
						</div>
						<input
							id={hoursId}
							type="number"
							min={0.5}
							max={24}
							step={0.5}
							value={day.availableHours || ""}
							onChange={handleHoursChange}
							placeholder="0.0"
							className="w-20 sm:w-24 border-2 border-indigo-100 bg-indigo-50/50 rounded-xl px-3 py-2 text-center text-sm font-bold text-indigo-900 focus:outline-none focus:ring-0 focus:border-indigo-400 transition-colors"
							aria-label={`Horas disponíveis em ${dayName}`}
						/>
						<span className="text-sm font-semibold text-indigo-400">h</span>
					</div>
				) : (
					<div className="flex items-center gap-2 text-gray-400">
						<Coffee className="w-5 h-5" />
						<span className="text-sm font-semibold uppercase tracking-wider hidden sm:inline">Descanso</span>
					</div>
				)}

				{error && (
					<div className="absolute right-0 top-0 bottom-0 pr-4 flex items-center pointer-events-none">
						<span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
							{error}
						</span>
					</div>
				)}
			</div>
			
			{/* Decorative background element for active days */}
			{day.isActive && (
				<div className="absolute -right-6 -bottom-6 text-indigo-50 opacity-50 pointer-events-none">
					<GraduationCap className="w-24 h-24 stroke-[1.5]" />
				</div>
			)}
		</div>
	);
}
