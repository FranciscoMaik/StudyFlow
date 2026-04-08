import { useEffect, useState } from "react";
import { formatElapsedTime, type TimerStatus } from "../lib/timer";
import { useTimerStore } from "../stores/timerStore";

export interface UseSessionTimerReturn {
	status: TimerStatus;
	elapsedSeconds: number;
	formattedTime: string;
	isRunning: boolean;
	handlePlay: () => void;
	handlePause: () => void;
	handleComplete: () => void;
	handleSkip: () => void;
}

export function useSessionTimer(
	sessionId: string,
	onComplete: (id: string, elapsedSeconds?: number) => void,
	onSkip: (id: string) => void,
): UseSessionTimerReturn {
	const timers = useTimerStore((s) => s.timers);
	const startTimer = useTimerStore((s) => s.startTimer);
	const pauseTimer = useTimerStore((s) => s.pauseTimer);
	const resetTimer = useTimerStore((s) => s.resetTimer);
	const getElapsed = useTimerStore((s) => s.getElapsed);

	const status: TimerStatus = timers[sessionId]?.status ?? "idle";
	const isRunning = status === "running";

	const [elapsedSeconds, setElapsedSeconds] = useState<number>(() =>
		getElapsed(sessionId),
	);

	// Sync elapsed when status changes (e.g. after pause/reset)
	useEffect(() => {
		setElapsedSeconds(getElapsed(sessionId));
	}, [sessionId, getElapsed]);

	// Tick every second while running
	useEffect(() => {
		if (status !== "running") return;

		const id = setInterval(() => {
			setElapsedSeconds(getElapsed(sessionId));
		}, 1000);

		return () => clearInterval(id);
	}, [sessionId, status, getElapsed]);

	const handlePlay = () => startTimer(sessionId);

	const handlePause = () => pauseTimer(sessionId);

	const handleComplete = () => {
		pauseTimer(sessionId);
		const elapsed = getElapsed(sessionId);
		if (elapsed > 0) {
			onComplete(sessionId, elapsed);
		} else {
			onComplete(sessionId);
		}
		resetTimer(sessionId);
	};

	const handleSkip = () => {
		resetTimer(sessionId);
		onSkip(sessionId);
	};

	return {
		status,
		elapsedSeconds,
		formattedTime: formatElapsedTime(elapsedSeconds),
		isRunning,
		handlePlay,
		handlePause,
		handleComplete,
		handleSkip,
	};
}
