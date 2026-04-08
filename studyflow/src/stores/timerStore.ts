import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TimerEntry } from "../lib/timer";

interface TimerStore {
	timers: Record<string, TimerEntry>;
	startTimer: (sessionId: string) => void;
	pauseTimer: (sessionId: string) => void;
	resetTimer: (sessionId: string) => void;
	getElapsed: (sessionId: string) => number;
}

// Safe localStorage wrapper — falls back to in-memory if unavailable
function safeLocalStorage() {
	try {
		localStorage.setItem("__test__", "1");
		localStorage.removeItem("__test__");
		return createJSONStorage(() => localStorage);
	} catch {
		return createJSONStorage(() => ({
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
		}));
	}
}

export const useTimerStore = create<TimerStore>()(
	persist(
		(set, get) => ({
			timers: {},

			startTimer: (sessionId: string) => {
				set((state) => {
					const updated: Record<string, TimerEntry> = {};

					// Pause any currently running timer
					for (const [id, entry] of Object.entries(state.timers)) {
						if (id !== sessionId && entry.status === "running") {
							updated[id] = {
								...entry,
								status: "paused",
								elapsedSeconds:
									entry.startedAt != null && Number.isFinite(entry.startedAt)
										? entry.elapsedSeconds +
											Math.floor((Date.now() - entry.startedAt) / 1000)
										: entry.elapsedSeconds,
								startedAt: null,
							};
						}
					}

					const current = state.timers[sessionId];
					updated[sessionId] = {
						status: "running",
						elapsedSeconds: current?.elapsedSeconds ?? 0,
						startedAt: Date.now(),
					};

					return { timers: { ...state.timers, ...updated } };
				});
			},

			pauseTimer: (sessionId: string) => {
				set((state) => {
					const entry = state.timers[sessionId];
					if (!entry || entry.status !== "running") return state;

					const elapsed =
						entry.startedAt != null && Number.isFinite(entry.startedAt)
							? entry.elapsedSeconds +
								Math.floor((Date.now() - entry.startedAt) / 1000)
							: entry.elapsedSeconds;

					return {
						timers: {
							...state.timers,
							[sessionId]: {
								status: "paused",
								elapsedSeconds: elapsed,
								startedAt: null,
							},
						},
					};
				});
			},

			resetTimer: (sessionId: string) => {
				set((state) => {
					const { [sessionId]: _, ...rest } = state.timers;
					return { timers: rest };
				});
			},

			getElapsed: (sessionId: string) => {
				const entry = get().timers[sessionId];
				if (!entry) return 0;

				if (entry.status === "running") {
					if (entry.startedAt == null || !Number.isFinite(entry.startedAt)) {
						return Math.max(0, entry.elapsedSeconds);
					}
					return Math.max(
						0,
						entry.elapsedSeconds +
							Math.floor((Date.now() - entry.startedAt) / 1000),
					);
				}

				return Math.max(0, entry.elapsedSeconds);
			},
		}),
		{
			name: "studyflow:timers",
			storage: safeLocalStorage(),
			onRehydrateStorage: () => (state) => {
				if (!state) return;

				const now = Date.now();
				const rehydrated: Record<string, TimerEntry> = {};

				for (const [id, entry] of Object.entries(state.timers)) {
					if (entry.status === "running") {
						// Validate startedAt — if corrupted, restore as paused
						if (entry.startedAt == null || !Number.isFinite(entry.startedAt)) {
							rehydrated[id] = {
								status: "paused",
								elapsedSeconds: Math.max(0, entry.elapsedSeconds),
								startedAt: null,
							};
						} else {
							// Adjust startedAt to now, keeping accumulated elapsedSeconds
							rehydrated[id] = {
								status: "running",
								elapsedSeconds: entry.elapsedSeconds,
								startedAt: now,
							};
						}
					} else {
						rehydrated[id] = entry;
					}
				}

				state.timers = rehydrated;
			},
		},
	),
);
