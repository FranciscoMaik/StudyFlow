/**
 * Routing Tests — App.tsx
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Outlet } from "react-router-dom";
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
// Mock auth store — simulate authenticated user
// ---------------------------------------------------------------------------

vi.mock("../stores/authStore", () => ({
	useAuthStore: vi.fn((selector) => {
		const state = { user: { id: "test-user-1" }, loading: false };
		return selector ? selector(state) : state;
	}),
}));

// ---------------------------------------------------------------------------
// Mock ProtectedRoute — render Outlet directly (simulate authenticated user)
// ---------------------------------------------------------------------------

vi.mock("../components/auth/ProtectedRoute", () => ({
	ProtectedRoute: () => <Outlet />,
}));

// ---------------------------------------------------------------------------
// Mock UI components
// ---------------------------------------------------------------------------

vi.mock("../components/ui/NavBar", () => ({
	NavBar: () => <nav data-testid="navbar">NavBar</nav>,
}));

vi.mock("../components/ui/Toast", () => ({
	Toast: () => <div data-testid="toast">Toast</div>,
}));

// ---------------------------------------------------------------------------
// Mock auth pages
// ---------------------------------------------------------------------------

vi.mock("../components/auth/Login", () => ({
	Login: () => <div data-testid="login-page">Login</div>,
}));

vi.mock("../components/auth/Register", () => ({
	Register: () => <div data-testid="register-page">Register</div>,
}));

// ---------------------------------------------------------------------------
// Mock page components
// ---------------------------------------------------------------------------

vi.mock("../pages/Contents", () => ({
	Contents: () => <div data-testid="contents-page">Contents</div>,
}));

vi.mock("../pages/Categories", () => ({
	Categories: () => <div data-testid="categories-page">Categories</div>,
}));

vi.mock("../pages/Schedule", () => ({
	Schedule: () => <div data-testid="schedule-page">Schedule</div>,
}));

vi.mock("../pages/Profile", () => ({
	Profile: () => <div data-testid="profile-page">Profile</div>,
}));

vi.mock("../pages/Reports", () => ({
	Reports: () => <div data-testid="reports-page">Reports</div>,
}));

// ---------------------------------------------------------------------------
// Import App after mocks
// ---------------------------------------------------------------------------

import App from "../App";

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

function renderApp() {
	const queryClient = makeQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>,
	);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
	vi.clearAllMocks();
	// Reset to root before each test
	window.history.pushState({}, "", "/");
});

// ---------------------------------------------------------------------------
// Test 1 — Route `/` renders the Contents component
// Validates: Requirement 1.1
// ---------------------------------------------------------------------------

describe("Test 1: Route `/` renders the Contents component", () => {
	it("renders Contents page at the root route", () => {
		window.history.pushState({}, "", "/");
		renderApp();

		expect(screen.getByTestId("contents-page")).toBeInTheDocument();
	});

	it("does not render other page components at the root route", () => {
		window.history.pushState({}, "", "/");
		renderApp();

		expect(screen.queryByTestId("categories-page")).not.toBeInTheDocument();
		expect(screen.queryByTestId("schedule-page")).not.toBeInTheDocument();
		expect(screen.queryByTestId("profile-page")).not.toBeInTheDocument();
		expect(screen.queryByTestId("reports-page")).not.toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 2 — Unknown routes redirect to `/` (which renders Contents)
// Validates: Requirements 1.2, 1.3
// ---------------------------------------------------------------------------

describe("Test 2: Unknown routes redirect to `/`", () => {
	it("redirects /foo to / and renders Contents", () => {
		window.history.pushState({}, "", "/foo");
		renderApp();

		expect(screen.getByTestId("contents-page")).toBeInTheDocument();
	});

	it("redirects /contents to / and renders Contents", () => {
		window.history.pushState({}, "", "/contents");
		renderApp();

		expect(screen.getByTestId("contents-page")).toBeInTheDocument();
	});

	it("redirects /dashboard to / and renders Contents", () => {
		window.history.pushState({}, "", "/dashboard");
		renderApp();

		expect(screen.getByTestId("contents-page")).toBeInTheDocument();
	});

	it("redirects /unknown/nested/path to / and renders Contents", () => {
		window.history.pushState({}, "", "/unknown/nested/path");
		renderApp();

		expect(screen.getByTestId("contents-page")).toBeInTheDocument();
	});
});
