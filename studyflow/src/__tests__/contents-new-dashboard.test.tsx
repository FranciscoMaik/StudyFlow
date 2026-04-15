/**
 * Component Tests — Contents.tsx (New Dashboard)
 *
 * Validates: Requirements 2.1, 2.3, 2.4, 2.5, 6.2
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock Supabase (must be before any module that imports it)
// ---------------------------------------------------------------------------

vi.mock("../lib/supabase", () => ({
	supabase: {
		channel: vi.fn(() => ({
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn().mockReturnThis(),
		})),
		removeChannel: vi.fn(),
	},
}));

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

vi.mock("../hooks/useGamification", () => ({
	useUserProfile: vi.fn(),
	useRecordDailyLogin: vi.fn(),
}));

vi.mock("../hooks/useContents", () => ({
	useContents: vi.fn(),
	useDoneContents: vi.fn(),
	useReopenContent: vi.fn(),
}));

vi.mock("../hooks/useSchedule", () => ({
	useSchedule: vi.fn(),
}));

vi.mock("../stores/authStore", () => ({
	useAuthStore: vi.fn(() => ({ user: { id: "user-test-1" } })),
}));

// ---------------------------------------------------------------------------
// Mock child components to avoid deep dependency chains
// ---------------------------------------------------------------------------

vi.mock("../components/gamification/XPBar", () => ({
	XPBar: ({ totalXP, level }: { totalXP: number; level: number }) => (
		<div data-testid="xp-bar">
			XPBar level={level} totalXP={totalXP}
		</div>
	),
}));

vi.mock("../components/dashboard/DailyView", () => ({
	DailyView: ({ streak }: { streak: number }) => (
		<div data-testid="daily-view">DailyView streak={streak}</div>
	),
}));

vi.mock("../components/dashboard/WeeklyView", () => ({
	WeeklyView: () => <div data-testid="weekly-view">WeeklyView</div>,
}));

vi.mock("../components/contents/CalendarView", () => ({
	CalendarView: () => <div data-testid="calendar-view">CalendarView</div>,
}));

vi.mock("../components/contents/ContentList", () => ({
	ContentList: () => <div data-testid="content-list">ContentList</div>,
}));

vi.mock("../components/contents/ContentForm", () => ({
	ContentForm: () => <div data-testid="content-form">ContentForm</div>,
}));

vi.mock("../components/contents/ContentCard", () => ({
	ContentCard: () => <div data-testid="content-card">ContentCard</div>,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import * as useGamificationModule from "../hooks/useGamification";
import * as useContentsModule from "../hooks/useContents";
import * as useScheduleModule from "../hooks/useSchedule";
import { Contents } from "../pages/Contents";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

function renderContents() {
	const queryClient = makeQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<Contents />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

const defaultProfile = {
	totalXP: 500,
	level: 3,
	levelName: "Estudante",
	xpToNextLevel: 200,
	currentStreak: 5,
	longestStreak: 10,
};

const mockMutate = vi.fn();

function setupDefaultMocks() {
	vi.mocked(useGamificationModule.useUserProfile).mockReturnValue({
		data: defaultProfile,
		isLoading: false,
	} as ReturnType<typeof useGamificationModule.useUserProfile>);

	vi.mocked(useGamificationModule.useRecordDailyLogin).mockReturnValue({
		mutate: mockMutate,
		isPending: false,
	} as unknown as ReturnType<typeof useGamificationModule.useRecordDailyLogin>);

	vi.mocked(useContentsModule.useDoneContents).mockReturnValue({
		data: [],
		isLoading: false,
	} as ReturnType<typeof useContentsModule.useDoneContents>);

	vi.mocked(useContentsModule.useReopenContent).mockReturnValue({
		mutate: vi.fn(),
		isPending: false,
	} as unknown as ReturnType<typeof useContentsModule.useReopenContent>);

	vi.mocked(useScheduleModule.useSchedule).mockReturnValue({
		data: undefined,
		isLoading: false,
	} as ReturnType<typeof useScheduleModule.useSchedule>);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
	vi.clearAllMocks();
	mockMutate.mockReset();
	setupDefaultMocks();
});

// ---------------------------------------------------------------------------
// Test 1 — Renders XPBar when useUserProfile returns valid data
// Validates: Requirement 2.1
// ---------------------------------------------------------------------------

describe("Test 1: Renders XPBar when useUserProfile returns valid data", () => {
	it("renders XPBar component when profile data is available", () => {
		renderContents();

		expect(screen.getByTestId("xp-bar")).toBeInTheDocument();
	});

	it("does not render XPBar when profile data is undefined", () => {
		vi.mocked(useGamificationModule.useUserProfile).mockReturnValue({
			data: undefined,
			isLoading: false,
		} as ReturnType<typeof useGamificationModule.useUserProfile>);

		renderContents();

		expect(screen.queryByTestId("xp-bar")).not.toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 2 — Displays accessible spinner when isLoading is true
// Validates: Requirement 6.2
// ---------------------------------------------------------------------------

describe("Test 2: Displays accessible spinner when isLoading is true", () => {
	it("renders a spinner element when isLoading is true", () => {
		vi.mocked(useGamificationModule.useUserProfile).mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useGamificationModule.useUserProfile>);

		renderContents();

		// The spinner container has aria-live="polite"
		const spinnerContainer = document.querySelector('[aria-live="polite"]');
		expect(spinnerContainer).toBeInTheDocument();
	});

	it("renders a screen-reader-only loading text when isLoading is true", () => {
		vi.mocked(useGamificationModule.useUserProfile).mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useGamificationModule.useUserProfile>);

		renderContents();

		// sr-only text for accessibility
		expect(screen.getByText(/carregando/i)).toBeInTheDocument();
	});

	it("does not render the main content when isLoading is true", () => {
		vi.mocked(useGamificationModule.useUserProfile).mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useGamificationModule.useUserProfile>);

		renderContents();

		expect(screen.queryByTestId("xp-bar")).not.toBeInTheDocument();
		expect(screen.queryByTestId("daily-view")).not.toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 3 — Renders tabs "Missão Diária" and "Visão Semanal";
//           clicking "Visão Semanal" shows WeeklyView
// Validates: Requirements 2.3, 2.4
// ---------------------------------------------------------------------------

describe("Test 3: Tab navigation between Missão Diária and Visão Semanal", () => {
	it("renders both tab buttons", () => {
		renderContents();

		expect(
			screen.getByRole("button", { name: /missão diária/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /visão semanal/i }),
		).toBeInTheDocument();
	});

	it("shows DailyView by default (Missão Diária tab active)", () => {
		renderContents();

		expect(screen.getByTestId("daily-view")).toBeInTheDocument();
		expect(screen.queryByTestId("weekly-view")).not.toBeInTheDocument();
	});

	it("shows WeeklyView after clicking Visão Semanal tab", async () => {
		const user = userEvent.setup();
		renderContents();

		const weeklyTab = screen.getByRole("button", { name: /visão semanal/i });
		await user.click(weeklyTab);

		await waitFor(() => {
			expect(screen.getByTestId("weekly-view")).toBeInTheDocument();
		});
	});

	it("hides DailyView after clicking Visão Semanal tab", async () => {
		const user = userEvent.setup();
		renderContents();

		const weeklyTab = screen.getByRole("button", { name: /visão semanal/i });
		await user.click(weeklyTab);

		await waitFor(() => {
			expect(screen.queryByTestId("daily-view")).not.toBeInTheDocument();
		});
	});

	it("switches back to DailyView when clicking Missão Diária tab", async () => {
		const user = userEvent.setup();
		renderContents();

		// Switch to weekly
		await user.click(screen.getByRole("button", { name: /visão semanal/i }));
		await waitFor(() =>
			expect(screen.getByTestId("weekly-view")).toBeInTheDocument(),
		);

		// Switch back to daily
		await user.click(screen.getByRole("button", { name: /missão diária/i }));
		await waitFor(() =>
			expect(screen.getByTestId("daily-view")).toBeInTheDocument(),
		);
	});
});

// ---------------------------------------------------------------------------
// Test 4 — Calls useRecordDailyLogin exactly once on mount (not on re-renders)
// Validates: Requirement 2.5
// ---------------------------------------------------------------------------

describe("Test 4: useRecordDailyLogin called exactly once on mount", () => {
	it("calls mutate once on initial render", () => {
		renderContents();

		expect(mockMutate).toHaveBeenCalledTimes(1);
	});

	it("does not call mutate again on re-render", () => {
		const queryClient = makeQueryClient();

		const { rerender } = render(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>
					<Contents />
				</MemoryRouter>
			</QueryClientProvider>,
		);

		// Re-render the same component
		rerender(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>
					<Contents />
				</MemoryRouter>
			</QueryClientProvider>,
		);

		// mutate should still only have been called once
		expect(mockMutate).toHaveBeenCalledTimes(1);
	});
});

// ---------------------------------------------------------------------------
// Test 5 — Renders CalendarView and ContentList below the Progress Panel
// Validates: Requirements 2.1, 2.3
// ---------------------------------------------------------------------------

describe("Test 5: Renders CalendarView and ContentList below the Progress Panel", () => {
	it("renders CalendarView", () => {
		renderContents();

		expect(screen.getByTestId("calendar-view")).toBeInTheDocument();
	});

	it("renders ContentList", () => {
		renderContents();

		expect(screen.getByTestId("content-list")).toBeInTheDocument();
	});

	it("renders CalendarView and ContentList together with XPBar", () => {
		renderContents();

		expect(screen.getByTestId("xp-bar")).toBeInTheDocument();
		expect(screen.getByTestId("calendar-view")).toBeInTheDocument();
		expect(screen.getByTestId("content-list")).toBeInTheDocument();
	});

	it("CalendarView appears in the document after the tab section", () => {
		renderContents();

		const calendarView = screen.getByTestId("calendar-view");
		const contentList = screen.getByTestId("content-list");

		// Both should be present in the DOM
		expect(calendarView).toBeInTheDocument();
		expect(contentList).toBeInTheDocument();

		// CalendarView should appear before ContentList in the DOM
		const allElements = document.body.querySelectorAll("[data-testid]");
		const testIds = Array.from(allElements).map((el) =>
			el.getAttribute("data-testid"),
		);
		const calendarIndex = testIds.indexOf("calendar-view");
		const contentListIndex = testIds.indexOf("content-list");

		expect(calendarIndex).toBeLessThan(contentListIndex);
	});
});
