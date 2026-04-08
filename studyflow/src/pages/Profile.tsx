import { useEffect, useState } from "react";
import { AchievementCard } from "../components/gamification/AchievementCard";
import { LevelBadge } from "../components/gamification/LevelBadge";
import { StreakCounter } from "../components/gamification/StreakCounter";
import { XPBar } from "../components/gamification/XPBar";
import { useUserProfile } from "../hooks/useGamification";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { AchievementKey } from "../types";

const ALL_ACHIEVEMENTS: AchievementKey[] = [
	"em_chamas",
	"devorador_de_livros",
	"maratonista",
	"pontual",
	"semana_perfeita",
	"madrugador",
];

interface UnlockedAchievement {
	achievementKey: AchievementKey;
	unlockedAt: string;
}

export function Profile() {
	const { user } = useAuthStore();
	const { data: profile, isLoading: profileLoading } = useUserProfile();
	const [unlockedAchievements, setUnlockedAchievements] = useState<
		UnlockedAchievement[]
	>([]);
	const [achievementsLoading, setAchievementsLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		async function fetchAchievements() {
			setAchievementsLoading(true);
			const { data, error } = await supabase
				.from("achievements")
				.select("achievement_key, unlocked_at")
				.eq("user_id", user!.id);

			if (!error && data) {
				setUnlockedAchievements(
					data.map((row) => ({
						achievementKey: row.achievement_key as AchievementKey,
						unlockedAt: row.unlocked_at as string,
					})),
				);
			}
			setAchievementsLoading(false);
		}

		fetchAchievements();
	}, [user]);

	const isLoading = profileLoading || achievementsLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<p className="text-gray-500">Carregando perfil...</p>
			</div>
		);
	}

	if (!profile) return null;

	const unlockedMap = new Map(
		unlockedAchievements.map((a) => [a.achievementKey, a.unlockedAt]),
	);

	return (
		<div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
			<h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

			{/* XP and Level */}
			<section className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
				<div className="flex items-center gap-3 flex-wrap">
					<LevelBadge level={profile.level} levelName={profile.levelName} />
					<StreakCounter streak={profile.currentStreak} />
					{profile.longestStreak > 0 && (
						<span className="text-sm text-gray-500">
							Maior sequência: {profile.longestStreak} dias
						</span>
					)}
				</div>
				<XPBar
					totalXP={profile.totalXP}
					level={profile.level}
					levelName={profile.levelName}
					xpToNextLevel={profile.xpToNextLevel}
				/>
			</section>

			{/* Achievements */}
			<section className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold text-gray-800">Conquistas</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{ALL_ACHIEVEMENTS.map((key) => (
						<AchievementCard
							key={key}
							achievementKey={key}
							unlockedAt={unlockedMap.get(key)}
						/>
					))}
				</div>
			</section>
		</div>
	);
}
