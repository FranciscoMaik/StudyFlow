export type TimerStatus = "idle" | "running" | "paused";

export interface TimerEntry {
	status: TimerStatus;
	elapsedSeconds: number;
	startedAt: number | null;
}

/**
 * Formats elapsed seconds into MM:SS (< 3600) or HH:MM:SS (>= 3600).
 * All segments are zero-padded.
 */
export function formatElapsedTime(seconds: number): string {
	const s = seconds % 60;
	const m = Math.floor(seconds / 60) % 60;
	const h = Math.floor(seconds / 3600);

	const mm = String(m).padStart(2, "0");
	const ss = String(s).padStart(2, "0");

	if (seconds < 3600) {
		return `${mm}:${ss}`;
	}

	const hh = String(h).padStart(2, "0");
	return `${hh}:${mm}:${ss}`;
}
