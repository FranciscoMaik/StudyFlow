/**
 * Component Tests — NavBar.tsx
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock useAuth to avoid Supabase dependency
// ---------------------------------------------------------------------------

vi.mock("../hooks/useAuth", () => ({
	useAuth: vi.fn(() => ({
		signOut: vi.fn(),
	})),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { NavBar } from "../components/ui/NavBar";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderNavBar(initialRoute = "/") {
	return render(
		<MemoryRouter initialEntries={[initialRoute]}>
			<NavBar />
		</MemoryRouter>,
	);
}

// ---------------------------------------------------------------------------
// Test 1 — Displays "Conteúdos" with href="/"
// Validates: Requirement 4.1
// ---------------------------------------------------------------------------

describe('Test 1: Displays "Conteúdos" with href="/"', () => {
	it('renders a link with text "Conteúdos"', () => {
		renderNavBar();

		const links = screen.getAllByRole("link", { name: /conteúdos/i });
		expect(links.length).toBeGreaterThan(0);
	});

	it('the "Conteúdos" link points to "/"', () => {
		renderNavBar();

		// NavBar renders both desktop and mobile links; find the one in the nav list
		const links = screen.getAllByRole("link", { name: /conteúdos/i });
		// At least one of the links should have href="/"
		const hasRootHref = links.some((link) => link.getAttribute("href") === "/");
		expect(hasRootHref).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Test 2 — Does NOT display any item with text "Dashboard"
// Validates: Requirement 4.2
// ---------------------------------------------------------------------------

describe('Test 2: Does NOT display any item with text "Dashboard"', () => {
	it('does not render any link with text "Dashboard"', () => {
		renderNavBar();

		const dashboardLink = screen.queryByRole("link", { name: /dashboard/i });
		expect(dashboardLink).not.toBeInTheDocument();
	});

	it('does not render any element with text "Dashboard"', () => {
		renderNavBar();

		expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 3 — Marks "Conteúdos" as active when the active route is "/"
// Validates: Requirement 4.3
// ---------------------------------------------------------------------------

describe('Test 3: Marks "Conteúdos" as active when route is "/"', () => {
	it('applies active styles to "Conteúdos" link when on "/"', () => {
		renderNavBar("/");

		// NavLink applies active class when isActive is true
		// The NavBar uses "bg-indigo-50 text-indigo-700" for active links
		const links = screen.getAllByRole("link", { name: /conteúdos/i });
		const activeLink = links.find(
			(link) =>
				link.classList.contains("bg-indigo-50") &&
				link.classList.contains("text-indigo-700"),
		);
		expect(activeLink).toBeDefined();
	});

	it('does not apply active styles to "Conteúdos" when on a different route', () => {
		renderNavBar("/categories");

		const links = screen.getAllByRole("link", { name: /conteúdos/i });
		// None of the Conteúdos links should have active classes
		const hasActiveClass = links.some(
			(link) =>
				link.classList.contains("bg-indigo-50") &&
				link.classList.contains("text-indigo-700"),
		);
		expect(hasActiveClass).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Test 4 — Categorias, Agenda, Perfil, and Relatórios keep their original routes
// Validates: Requirement 4.4
// ---------------------------------------------------------------------------

describe("Test 4: Other nav items keep their original routes", () => {
	it('renders "Categorias" link pointing to "/categories"', () => {
		renderNavBar();

		const links = screen.getAllByRole("link", { name: /categorias/i });
		const hasCorrectHref = links.some(
			(link) => link.getAttribute("href") === "/categories",
		);
		expect(hasCorrectHref).toBe(true);
	});

	it('renders "Agenda" link pointing to "/schedule"', () => {
		renderNavBar();

		const links = screen.getAllByRole("link", { name: /agenda/i });
		const hasCorrectHref = links.some(
			(link) => link.getAttribute("href") === "/schedule",
		);
		expect(hasCorrectHref).toBe(true);
	});

	it('renders "Perfil" link pointing to "/profile"', () => {
		renderNavBar();

		const links = screen.getAllByRole("link", { name: /perfil/i });
		const hasCorrectHref = links.some(
			(link) => link.getAttribute("href") === "/profile",
		);
		expect(hasCorrectHref).toBe(true);
	});

	it('renders "Relatórios" link pointing to "/reports"', () => {
		renderNavBar();

		const links = screen.getAllByRole("link", { name: /relatórios/i });
		const hasCorrectHref = links.some(
			(link) => link.getAttribute("href") === "/reports",
		);
		expect(hasCorrectHref).toBe(true);
	});
});
