import { getLevelThresholds } from "../../lib/xp-engine";
import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";

interface XPBarProps {
	totalXP: number;
	level: number;
	levelName: string;
	xpToNextLevel: number;
}

export function XPBar({
	totalXP,
	level,
	levelName,
	xpToNextLevel,
}: XPBarProps) {
	const thresholds = getLevelThresholds();
	const currentThreshold = thresholds.find((t) => t.level === level);
	const nextThreshold = thresholds.find((t) => t.level === level + 1);

	let progress = 100;
	if (nextThreshold && currentThreshold) {
		const range = nextThreshold.minXP - currentThreshold.minXP;
		const earned = totalXP - currentThreshold.minXP;
		progress = Math.min(100, Math.max(0, (earned / range) * 100));
	}

	return (
		<motion.div 
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col gap-3 w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-purple-100 p-2 rounded-xl">
						<Trophy className="w-6 h-6 text-purple-600" />
					</div>
					<div>
						<h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
							Lvl {level} • {levelName}
						</h2>
						<p className="text-xs text-gray-500 font-medium">Bolsa de Estudos em Progresso</p>
					</div>
				</div>
				<div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 shadow-sm">
					<Star className="w-4 h-4 text-amber-500 fill-amber-500" />
					<span className="text-sm font-bold text-amber-700">{totalXP} XP</span>
				</div>
			</div>
			
			<div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative shadow-inner">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full relative"
					role="progressbar"
					aria-valuenow={Math.round(progress)}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={`Progresso XP: ${Math.round(progress)}%`}
				>
					<div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div>
				</motion.div>
			</div>
			{nextThreshold && (
				<p className="text-xs text-gray-400 font-medium text-right">
					Faltam <strong className="text-indigo-600">{xpToNextLevel} XP</strong> para o próximo nível
				</p>
			)}
		</motion.div>
	);
}
