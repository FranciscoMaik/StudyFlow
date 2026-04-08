import type { AchievementKey } from "../../types";

interface AchievementMeta {
	name: string;
	description: string;
	icon: string;
}

const ACHIEVEMENT_META: Record<AchievementKey, AchievementMeta> = {
	em_chamas: {
		name: "Em Chamas",
		description: "Estude por 7 dias consecutivos.",
		icon: "🔥",
	},
	devorador_de_livros: {
		name: "Devorador de Livros",
		description: "Conclua 10 conteúdos.",
		icon: "📚",
	},
	maratonista: {
		name: "Maratonista",
		description: "Registre 50 horas totais de estudo.",
		icon: "🏃",
	},
	pontual: {
		name: "Pontual",
		description: "Conclua 5 conteúdos antes do prazo.",
		icon: "⏰",
	},
	semana_perfeita: {
		name: "Semana Perfeita",
		description: "Cumpra 100% da meta semanal por 4 semanas consecutivas.",
		icon: "🏆",
	},
	madrugador: {
		name: "Madrugador",
		description: "Conclua uma sessão antes das 07h por 5 vezes distintas.",
		icon: "🌅",
	},
};

interface AchievementCardProps {
	achievementKey: AchievementKey;
	unlockedAt?: string;
}

export function AchievementCard({
	achievementKey,
	unlockedAt,
}: AchievementCardProps) {
	const meta = ACHIEVEMENT_META[achievementKey];
	const isUnlocked = unlockedAt !== undefined;

	return (
		<div
			className={`flex items-start gap-3 rounded-xl p-4 border transition-colors ${
				isUnlocked
					? "bg-white border-indigo-200 shadow-sm"
					: "bg-gray-50 border-gray-200 opacity-60"
			}`}
			aria-label={`Conquista: ${meta.name}${isUnlocked ? " (desbloqueada)" : " (bloqueada)"}`}
		>
			<span
				className={`text-3xl leading-none ${isUnlocked ? "" : "grayscale"}`}
				aria-hidden="true"
			>
				{isUnlocked ? meta.icon : "🔒"}
			</span>
			<div className="flex flex-col gap-0.5">
				<span
					className={`font-semibold text-sm ${
						isUnlocked ? "text-gray-900" : "text-gray-400"
					}`}
				>
					{meta.name}
				</span>
				<span className="text-xs text-gray-500">{meta.description}</span>
				{isUnlocked && (
					<span className="text-xs text-indigo-500 mt-1">
						Desbloqueada em{" "}
						{new Date(unlockedAt).toLocaleDateString("pt-BR", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</span>
				)}
			</div>
		</div>
	);
}
