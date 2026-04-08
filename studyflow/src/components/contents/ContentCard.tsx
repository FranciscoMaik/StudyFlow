import type { Category, Content } from "../../types";
import { motion } from "framer-motion";
import { Calendar, Edit, Archive, BookOpen } from "lucide-react";

interface ContentCardProps {
	content: Content;
	category?: Category;
	onEdit?: (content: Content) => void;
	onArchive?: (id: string) => void;
}

const PRIORITY_LABELS: Record<Content["priority"], string> = {
	low: "Baixa Prio.",
	medium: "Média",
	high: "Alta Prio.",
};

const PRIORITY_COLORS: Record<Content["priority"], string> = {
	low: "text-emerald-700 bg-emerald-100",
	medium: "text-amber-700 bg-amber-100",
	high: "text-rose-700 bg-rose-100",
};

export function ContentCard({
	content,
	category,
	onEdit,
	onArchive,
}: ContentCardProps) {
	const progressPercent =
		content.estimatedHours > 0
			? Math.min(
					100,
					Math.round((content.completedHours / content.estimatedHours) * 100),
				)
			: 0;

	const formattedDeadline = content.deadline
		? new Date(content.deadline + "T00:00:00").toLocaleDateString("pt-BR")
		: null;

	return (
		<motion.div 
			whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
			className="bg-white rounded-2xl border-2 border-gray-100 p-5 transition-all flex flex-col justify-between"
		>
			<div>
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="flex items-center gap-3 min-w-0 w-full">
						<div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-500 shrink-0">
							<BookOpen className="w-5 h-5" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-bold text-gray-800 truncate text-lg leading-tight" title={content.title}>
								{content.title}
							</h3>
							{category && (
								<p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
									<span
										className="w-2.5 h-2.5 rounded-full shrink-0"
										style={{ backgroundColor: category.color }}
									/>
									<span className="truncate">{category.name}</span>
								</p>
							)}
						</div>
					</div>
				</div>

				{content.description && (
					<p className="mt-2 text-sm text-gray-500 line-clamp-2">
						{content.description}
					</p>
				)}

				<div className="mt-5">
					<div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
						<span className="uppercase tracking-wider">Mestria</span>
						<span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
							{content.completedHours}h / {content.estimatedHours}h
						</span>
					</div>
					<div
						className="w-full bg-gray-100 shadow-inner rounded-full h-2.5"
						role="progressbar"
						aria-valuenow={progressPercent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progresso: ${progressPercent}%`}
					>
						<motion.div
							initial={{ width: 0 }}
							whileInView={{ width: `${progressPercent}%` }}
							viewport={{ once: true }}
							className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full relative"
						>
							<div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div>
						</motion.div>
					</div>
				</div>
			</div>

			<div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span
						className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${PRIORITY_COLORS[content.priority]}`}
					>
						{PRIORITY_LABELS[content.priority]}
					</span>
					{formattedDeadline && (
						<span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
							<Calendar className="w-3 h-3" />
							{formattedDeadline}
						</span>
					)}
				</div>
				<div className="flex gap-1.5">
					{onEdit && (
						<button
							type="button"
							onClick={() => onEdit(content)}
							className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
							aria-label="Editar"
						>
							<Edit className="w-4 h-4" />
						</button>
					)}
					{onArchive && (
						<button
							type="button"
							onClick={() => onArchive(content.id)}
							className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
							aria-label="Arquivar"
						>
							<Archive className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</motion.div>
	);
}
