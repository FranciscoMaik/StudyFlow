import type { Session } from "../../types";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, FastForward, Clock } from "lucide-react";

interface SessionCardProps {
	session: Session;
	contentTitle: string;
	onComplete: (id: string) => void;
	onSkip: (id: string) => void;
}

const STATUS_LABELS: Record<Session["status"], string> = {
	pending: "Pendente",
	done: "Missão Cumprida",
	skipped: "Ignorada",
};

const STATUS_BADGE_CLASSES: Record<Session["status"], string> = {
	pending: "bg-amber-100 text-amber-700 border-amber-200",
	done: "bg-emerald-100 text-emerald-700 border-emerald-200",
	skipped: "bg-slate-100 text-slate-600 border-slate-200",
};

export function SessionCard({
	session,
	contentTitle,
	onComplete,
	onSkip,
}: SessionCardProps) {
	const { id, plannedHours, status } = session;

	const isDone = status === "done";
	const isSkipped = status === "skipped";
	const isPending = status === "pending";

	return (
		<motion.div 
			layout
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={isPending ? { y: -2, scale: 1.01 } : {}}
			className={`flex flex-col gap-4 rounded-xl border-2 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between shadow-sm relative overflow-hidden ${
				isDone ? "bg-emerald-50/50 border-emerald-100" : 
				isSkipped ? "bg-slate-50 border-slate-100 opacity-60" : 
				"bg-white border-indigo-50 hover:border-indigo-200 hover:shadow-md"
			}`}
		>
			{/* Left: content info */}
			<div className="flex items-start gap-4">
				<div className="pt-1">
					{isDone && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
					{isSkipped && <FastForward className="w-6 h-6 text-slate-400" />}
					{isPending && <CircleDashed className="w-6 h-6 text-indigo-400" />}
				</div>
				<div className="flex flex-col gap-1 min-w-0">
					<h3 className={`font-bold text-lg break-all leading-tight ${isDone ? "text-emerald-900" : isSkipped ? "text-slate-500 line-through" : "text-slate-800"}`}>
						{contentTitle}
					</h3>
					<div className="flex items-center gap-3 mt-1">
						<span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
							<Clock className="w-3.5 h-3.5" />
							{plannedHours}h {plannedHours !== 1 ? "" : ""}
						</span>
						<span
							className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${STATUS_BADGE_CLASSES[status]}`}
						>
							{STATUS_LABELS[status]}
						</span>
					</div>
				</div>
			</div>

			{/* Right: actions or status indicator */}
			<div className="flex items-center gap-2 shrink-0">
				{isPending && (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type="button"
							onClick={() => onComplete(id)}
							className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20"
						>
							Feito! +10XP
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type="button"
							onClick={() => onSkip(id)}
							className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
						>
							Pular
						</motion.button>
					</>
				)}
			</div>
		</motion.div>
	);
}
