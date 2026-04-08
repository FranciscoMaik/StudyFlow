import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { HoursBarChart } from "./HoursBarChart";
import { motion } from "framer-motion";
import { Zap, Clock, Target, CheckSquare } from "lucide-react";

interface WeeklyReportProps {
	weekStart: string;
}

export function WeeklyReport({ weekStart }: WeeklyReportProps) {
	const { data, isLoading } = useWeeklyReport(weekStart);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex items-center justify-center py-12 text-gray-500">
				Nenhum dado disponível para esta semana.
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Metrics grid */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<motion.div 
					initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0 }}
					className="rounded-2xl bg-linear-to-b from-indigo-50 to-white p-5 shadow-sm border border-indigo-100 flex flex-col items-center text-center relative overflow-hidden"
				>
					<div className="bg-indigo-100 text-indigo-500 p-2.5 rounded-xl mb-3">
						<Clock className="w-5 h-5" />
					</div>
					<p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
						Horas Focadas
					</p>
					<p className="text-3xl font-black text-indigo-700">
						{data.totalStudyHours.toFixed(1)}h
					</p>
				</motion.div>

				<motion.div 
					initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
					className="rounded-2xl bg-linear-to-b from-emerald-50 to-white p-5 shadow-sm border border-emerald-100 flex flex-col items-center text-center relative overflow-hidden"
				>
					<div className="bg-emerald-100 text-emerald-500 p-2.5 rounded-xl mb-3">
						<Target className="w-5 h-5" />
					</div>
					<p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
						Taxa de Conclusão
					</p>
					<p className="text-3xl font-black text-emerald-600">
						{data.completionRate.toFixed(0)}%
					</p>
					<div className="absolute right-0 top-0 opacity-10 -mr-4 -mt-4 pointer-events-none">
						<Target className="w-24 h-24 stroke-3" />
					</div>
				</motion.div>

				<motion.div 
					initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
					className="rounded-2xl bg-linear-to-b from-amber-50 to-white p-5 shadow-sm border border-amber-100 flex flex-col items-center text-center relative overflow-hidden"
				>
					<div className="bg-amber-100 text-amber-500 p-2.5 rounded-xl mb-3">
						<Zap className="w-5 h-5" />
					</div>
					<p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
						XP Obtido
					</p>
					<p className="text-3xl font-black text-amber-500">
						+{data.xpEarned}
					</p>
				</motion.div>

				<motion.div 
					initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
					className="rounded-2xl bg-linear-to-b from-gray-50 to-white p-5 shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden"
				>
					<div className="bg-gray-100 text-gray-500 p-2.5 rounded-xl mb-3">
						<CheckSquare className="w-5 h-5" />
					</div>
					<p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
						Missões
					</p>
					<p className="text-3xl font-black text-gray-700">
						{data.completedSessions}
						<span className="text-lg text-gray-400 font-bold ml-1">/ {data.totalSessions}</span>
					</p>
				</motion.div>
			</div>

			{/* Bar chart */}
			<motion.div 
				initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
				className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100"
			>
				<div className="flex items-center gap-3 mb-6">
					<div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
					<h3 className="text-lg font-bold text-gray-800">
						Horas por Dia
					</h3>
				</div>
				<HoursBarChart data={data.sessionsByDay} />
			</motion.div>
		</div>
	);
}
