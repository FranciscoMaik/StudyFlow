import { useEffect } from "react";
import {
	type Notification,
	useNotificationStore,
} from "../../stores/notificationStore";

const ICONS: Record<Notification["type"], string> = {
	xp: "💰",
	level_up: "⬆️",
	achievement: "🏆",
};

const AUTO_DISMISS_MS = 3000;

function ToastItem({ notification }: { notification: Notification }) {
	const removeNotification = useNotificationStore((s) => s.removeNotification);

	useEffect(() => {
		const timer = setTimeout(() => {
			removeNotification(notification.id);
		}, AUTO_DISMISS_MS);
		return () => clearTimeout(timer);
	}, [notification.id, removeNotification]);

	return (
		<div
			role="alert"
			aria-live="polite"
			className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-lg border border-gray-200
                 animate-slide-in text-sm font-medium text-gray-800"
		>
			<span aria-hidden="true">{ICONS[notification.type]}</span>
			<span>{notification.message}</span>
			<button
				type="button"
				onClick={() => removeNotification(notification.id)}
				className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
				aria-label="Fechar notificação"
			>
				×
			</button>
		</div>
	);
}

export function Toast() {
	const notifications = useNotificationStore((s) => s.notifications);

	if (notifications.length === 0) return null;

	return (
		<section
			aria-label="Notificações"
			className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
		>
			{notifications.map((n) => (
				<ToastItem key={n.id} notification={n} />
			))}
		</section>
	);
}
