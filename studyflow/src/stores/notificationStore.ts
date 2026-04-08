import { create } from "zustand";

export interface Notification {
	id: string;
	type: "xp" | "level_up" | "achievement";
	message: string;
	xpAmount?: number;
}

interface NotificationState {
	notifications: Notification[];
	addNotification: (notification: Notification) => void;
	removeNotification: (id: string) => void;
	addXPNotification: (amount: number) => void;
	addLevelUpNotification: (levelName: string) => void;
	addAchievementNotification: (achievementName: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],

	addNotification: (notification) =>
		set((state) => ({
			notifications: [...state.notifications, notification],
		})),

	removeNotification: (id) =>
		set((state) => ({
			notifications: state.notifications.filter((n) => n.id !== id),
		})),

	addXPNotification: (amount) =>
		set((state) => ({
			notifications: [
				...state.notifications,
				{
					id: crypto.randomUUID(),
					type: "xp",
					message: `+${amount} XP`,
					xpAmount: amount,
				},
			],
		})),

	addLevelUpNotification: (levelName) =>
		set((state) => ({
			notifications: [
				...state.notifications,
				{
					id: crypto.randomUUID(),
					type: "level_up",
					message: `Subiu de nível: ${levelName}!`,
				},
			],
		})),

	addAchievementNotification: (achievementName) =>
		set((state) => ({
			notifications: [
				...state.notifications,
				{
					id: crypto.randomUUID(),
					type: "achievement",
					message: `Conquista desbloqueada: ${achievementName}!`,
				},
			],
		})),
}));
