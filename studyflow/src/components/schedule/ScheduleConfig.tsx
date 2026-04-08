import { useEffect, useState } from "react";
import { useSaveSchedule, useSchedule } from "../../hooks/useSchedule";
import type { ScheduleDay } from "../../types";
import { DaySlot } from "./DaySlot";
import { Save, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DayErrors = Partial<Record<ScheduleDay["dayOfWeek"], string>>;

export function ScheduleConfig() {
	const { data: scheduleData, isLoading } = useSchedule();
	const saveSchedule = useSaveSchedule();

	const [days, setDays] = useState<ScheduleDay[]>([]);
	const [errors, setErrors] = useState<DayErrors>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	// Sync local state when query data arrives
	useEffect(() => {
		if (scheduleData) {
			setDays(scheduleData);
		}
	}, [scheduleData]);

	function handleDayChange(updated: ScheduleDay) {
		setDays((prev) =>
			prev.map((d) => (d.dayOfWeek === updated.dayOfWeek ? updated : d)),
		);
		// Clear error for this day when user changes it
		setErrors((prev) => {
			const next = { ...prev };
			delete next[updated.dayOfWeek];
			return next;
		});
	}

	function validate(): boolean {
		const newErrors: DayErrors = {};
		for (const day of days) {
			if (day.isActive && (!day.availableHours || day.availableHours <= 0)) {
				newErrors[day.dayOfWeek] = "Sem horas";
			}
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSuccessMsg(null);
		if (!validate()) return;

		try {
			await saveSchedule.mutateAsync(days);
			setSuccessMsg("Sua jornada foi salva!");
		} catch {
			// error shown via saveSchedule.error
		}
	}

	const totalWeeklyHours = days
		.filter((d) => d.isActive)
		.reduce((sum, d) => sum + (d.availableHours || 0), 0);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				{days.map((day, ix) => (
					<motion.div 
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: ix * 0.05 }}
						key={day.dayOfWeek}
					>
						<DaySlot
							day={day}
							onChange={handleDayChange}
							error={errors[day.dayOfWeek]}
						/>
					</motion.div>
				))}
			</div>

			<div className="bg-indigo-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-100">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
						Capacidade Total
					</p>
					<div className="flex items-baseline gap-1 mt-1">
						<span className="text-3xl font-black text-indigo-700">{totalWeeklyHours}</span>
						<span className="text-indigo-500 font-medium">horas / semana</span>
					</div>
				</div>

				<button
					type="submit"
					disabled={saveSchedule.isPending}
					className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-bold shadow hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all focus:ring-4 focus:ring-indigo-500/20"
				>
					<Save className="w-4 h-4" />
					{saveSchedule.isPending ? "Configurando..." : "Atualizar Agenda"}
				</button>
			</div>

			<AnimatePresence>
				{saveSchedule.error && (
					<motion.p 
						initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
						className="text-rose-500 text-sm font-medium bg-rose-50 p-3 rounded-xl border border-rose-100" role="alert"
					>
						⚠️ {(saveSchedule.error as Error).message}
					</motion.p>
				)}

				{successMsg && (
					<motion.div 
						initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
						className="text-emerald-700 text-sm font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2"
					>
						<CheckCircle2 className="w-5 h-5 text-emerald-500" />
						{successMsg}
					</motion.div>
				)}
			</AnimatePresence>
		</form>
	);
}
