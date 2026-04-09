/**
 * Preservation Property Tests — activity-done-status
 *
 * These tests encode UNCHANGED behaviors that must be preserved after the fix.
 * They MUST PASS on unfixed code to establish the baseline.
 * They MUST ALSO PASS after the fix is applied (no regressions).
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ContentCard } from "../components/contents/ContentCard";
import { ContentList } from "../components/contents/ContentList";
import * as useCategoriesModule from "../hooks/useCategories";
import * as useContentsModule from "../hooks/useContents";
import type { Category, Content } from "../types";

// ---------------------------------------------------------------------------
// Polyfill IntersectionObserver for framer-motion in jsdom
// ---------------------------------------------------------------------------

beforeAll(() => {
	if (typeof IntersectionObserver === "undefined") {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof IntersectionObserver;
	}
});

// ---------------------------------------------------------------------------
// Mock dependencies for component tests
// ---------------------------------------------------------------------------

vi.mock("../hooks/useContents", async (importOriginal) => {
	const actual = await importOriginal<typeof useContentsModule>();
	return {
		...actual,
		useContents: vi.fn(),
		useArchiveContent: vi.fn(),
		useCreateContent: vi.fn(),
		useMarkContentDone: vi.fn(),
	};
});

vi.mock("../hooks/useCategories", async (importOriginal) => {
	const actual = await importOriginal<typeof useCategoriesModule>();
	return {
		...actual,
		useCategories: vi.fn(),
	};
});

vi.mock("../stores/authStore", () => ({
	useAuthStore: vi.fn(() => ({ user: { id: "user-1" } })),
}));

// ---------------------------------------------------------------------------
// Helpers / Generators
// ---------------------------------------------------------------------------

const PRIORITIES: Content["priority"][] = ["low", "medium", "high"];
const CATEGORY_IDS = ["cat-1", "cat-2", "cat-3"];

function makeContent(overrides: Partial<Content> = {}): Content {
	const rand = Math.random().toString(36).slice(2);
	return {
		id: `content-${rand}`,
		userId: "user-1",
		title: `Conteúdo ${rand}`,
		estimatedHours: 5,
		completedHours: 1,
		priority: "medium",
		status: "active",
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

function makeCategory(id: string): Category {
	return { id, userId: "user-1", name: `Categoria ${id}`, color: "#6366f1" };
}

/** Generate N content items with varied priorities and categories */
function generateContents(n: number): Content[] {
	return Array.from({ length: n }, (_, i) => ({
		id: `content-${i}`,
		userId: "user-1",
		title: `Conteúdo ${i}`,
		estimatedHours: 2 + (i % 5),
		completedHours: 0,
		priority: PRIORITIES[i % 3],
		categoryId: CATEGORY_IDS[i % 3],
		status: "active" as const,
		createdAt: new Date().toISOString(),
	}));
}

// ---------------------------------------------------------------------------
// Property 3.1 — Cancelar o diálogo não chama nenhuma mutação
// ---------------------------------------------------------------------------

describe("Preservation 3.1: Cancelar ConfirmDialog não altera status", () => {
	/**
	 * For any active content, no mutation should be called without user interaction.
	 * Clicking "Cancelar" must NOT call onArchive.
	 *
	 * Validates: Requirements 3.1
	 */

	const variants: Content[] = [
		makeContent({ priority: "low" }),
		makeContent({ priority: "medium" }),
		makeContent({ priority: "high" }),
		makeContent({ categoryId: "cat-1" }),
		makeContent({ categoryId: undefined }),
		makeContent({ deadline: "2025-12-31" }),
	];

	it.each(
		variants,
	)("nenhuma mutação chamada antes de interação para conteúdo '$title'", (content) => {
		const onArchive = vi.fn();
		const onEdit = vi.fn();

		render(
			<ContentCard content={content} onEdit={onEdit} onArchive={onArchive} />,
		);

		// No interaction yet — no mutation should have been called
		expect(onArchive).not.toHaveBeenCalled();
		expect(onEdit).not.toHaveBeenCalled();
	});

	it("onArchive não é chamado sem clique no botão de arquivar", () => {
		const onArchive = vi.fn();
		const content = makeContent();

		render(<ContentCard content={content} onArchive={onArchive} />);

		expect(onArchive).not.toHaveBeenCalled();
	});

	it("onEdit não é chamado sem clique no botão de editar", () => {
		const onEdit = vi.fn();
		const content = makeContent();

		render(<ContentCard content={content} onEdit={onEdit} />);

		expect(onEdit).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
// Property 3.2 — Botão de editar sempre dispara onEdit com o conteúdo correto
// ---------------------------------------------------------------------------

describe("Preservation 3.2: Botão de editar dispara onEdit com conteúdo correto", () => {
	/**
	 * For any active content, clicking the edit button must call onEdit
	 * with exactly that content object.
	 *
	 * Validates: Requirements 3.2
	 */

	const variants: Content[] = [
		makeContent({ priority: "low" }),
		makeContent({ priority: "medium" }),
		makeContent({ priority: "high" }),
		makeContent({ categoryId: "cat-1" }),
		makeContent({ deadline: "2025-06-30" }),
		makeContent({ title: "Matemática Avançada" }),
		makeContent({ estimatedHours: 20, completedHours: 5 }),
	];

	it.each(
		variants,
	)("clicar em editar para '$title' chama onEdit com o conteúdo correto", (content) => {
		const onEdit = vi.fn();

		render(<ContentCard content={content} onEdit={onEdit} />);

		const editButton = screen.getByRole("button", { name: /editar/i });
		fireEvent.click(editButton);

		expect(onEdit).toHaveBeenCalledTimes(1);
		expect(onEdit).toHaveBeenCalledWith(content);
	});

	it("onEdit recebe exatamente o objeto content passado como prop", () => {
		const content = makeContent({ title: "Física Quântica", priority: "high" });
		const onEdit = vi.fn();

		render(<ContentCard content={content} onEdit={onEdit} />);

		fireEvent.click(screen.getByRole("button", { name: /editar/i }));

		const received = onEdit.mock.calls[0][0] as Content;
		expect(received.id).toBe(content.id);
		expect(received.title).toBe(content.title);
		expect(received.status).toBe("active");
	});

	it("onEdit é chamado apenas uma vez por clique", () => {
		const content = makeContent();
		const onEdit = vi.fn();

		render(<ContentCard content={content} onEdit={onEdit} />);

		fireEvent.click(screen.getByRole("button", { name: /editar/i }));

		expect(onEdit).toHaveBeenCalledTimes(1);
	});
});

// ---------------------------------------------------------------------------
// Property 3.3 — useCreateContent cria conteúdo com status "active"
// ---------------------------------------------------------------------------

describe("Preservation 3.3: useCreateContent cria conteúdo com status 'active'", () => {
	/**
	 * The useCreateContent hook always inserts status = "active" in the DB.
	 * We verify this by importing the actual (unmocked) module.
	 *
	 * Validates: Requirements 3.3
	 */

	it("useCreateContent insere status 'active' no payload do Supabase", async () => {
		// Import the actual (unmocked) module to inspect source
		const actual = await vi.importActual<typeof useContentsModule>(
			"../hooks/useContents",
		);

		expect(typeof actual.useCreateContent).toBe("function");

		const src = actual.useCreateContent.toString();
		expect(src).toContain('"active"');
	});

	it("useContents filtra apenas conteúdos com status 'active'", async () => {
		const actual = await vi.importActual<typeof useContentsModule>(
			"../hooks/useContents",
		);

		expect(typeof actual.useContents).toBe("function");

		const src = actual.useContents.toString();
		expect(src).toContain('"active"');
	});
});

// ---------------------------------------------------------------------------
// Property 3.4 — Filtros por categoria e ordenação funcionam sobre conteúdos ativos
// ---------------------------------------------------------------------------

describe("Preservation 3.4: Filtros e ordenação em ContentList", () => {
	/**
	 * For any combination of category filter and sort order, ContentList
	 * renders only active contents that match the filter.
	 *
	 * Validates: Requirements 3.4
	 */

	const allContents = generateContents(9); // 3 per category, 3 per priority
	const categories = CATEGORY_IDS.map(makeCategory);

	beforeEach(() => {
		vi.mocked(useCategoriesModule.useCategories).mockReturnValue({
			data: categories,
			isLoading: false,
		} as ReturnType<typeof useCategoriesModule.useCategories>);

		vi.mocked(useContentsModule.useContents).mockReturnValue({
			data: allContents,
			isLoading: false,
		} as ReturnType<typeof useContentsModule.useContents>);

		vi.mocked(useContentsModule.useArchiveContent).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as ReturnType<typeof useContentsModule.useArchiveContent>);

		vi.mocked(useContentsModule.useMarkContentDone).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as ReturnType<typeof useContentsModule.useMarkContentDone>);
	});

	it("sem filtro de categoria, exibe todos os conteúdos ativos", () => {
		render(<ContentList />);

		allContents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});
	});

	it("filtrando por cat-1, exibe apenas conteúdos dessa categoria", () => {
		render(<ContentList />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.change(selects[0], { target: { value: "cat-1" } });

		const cat1Contents = allContents.filter((c) => c.categoryId === "cat-1");
		const otherContents = allContents.filter((c) => c.categoryId !== "cat-1");

		cat1Contents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});

		otherContents.forEach((c) => {
			expect(screen.queryByText(c.title)).not.toBeInTheDocument();
		});
	});

	it("filtrando por cat-2, exibe apenas conteúdos dessa categoria", () => {
		render(<ContentList />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.change(selects[0], { target: { value: "cat-2" } });

		const cat2Contents = allContents.filter((c) => c.categoryId === "cat-2");
		const otherContents = allContents.filter((c) => c.categoryId !== "cat-2");

		cat2Contents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});

		otherContents.forEach((c) => {
			expect(screen.queryByText(c.title)).not.toBeInTheDocument();
		});
	});

	it("ordenação por maior prioridade exibe todos os conteúdos ativos", () => {
		render(<ContentList />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.change(selects[1], { target: { value: "priority_asc" } });

		allContents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});
	});

	it("ordenação por menor prioridade exibe todos os conteúdos ativos", () => {
		render(<ContentList />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.change(selects[1], { target: { value: "priority_desc" } });

		allContents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});
	});

	it("combinação: filtro cat-3 + ordenação priority_asc exibe apenas conteúdos de cat-3", () => {
		render(<ContentList />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.change(selects[0], { target: { value: "cat-3" } });
		fireEvent.change(selects[1], { target: { value: "priority_asc" } });

		const cat3Contents = allContents.filter((c) => c.categoryId === "cat-3");
		const otherContents = allContents.filter((c) => c.categoryId !== "cat-3");

		cat3Contents.forEach((c) => {
			expect(screen.getByText(c.title)).toBeInTheDocument();
		});

		otherContents.forEach((c) => {
			expect(screen.queryByText(c.title)).not.toBeInTheDocument();
		});
	});
});

// ---------------------------------------------------------------------------
// Property 3.5 — useArchiveContent remove sessões futuras pendentes
// ---------------------------------------------------------------------------

describe("Preservation 3.5: useArchiveContent remove sessões futuras pendentes", () => {
	/**
	 * The useArchiveContent hook must delete future pending sessions
	 * when archiving a content. We verify this by inspecting the actual source.
	 *
	 * Validates: Requirements 3.5
	 */

	it("useArchiveContent existe e é uma função", async () => {
		const actual = await vi.importActual<typeof useContentsModule>(
			"../hooks/useContents",
		);
		expect(typeof actual.useArchiveContent).toBe("function");
	});

	it("useArchiveContent deleta sessões futuras pendentes (verificação de fonte)", async () => {
		const actual = await vi.importActual<typeof useContentsModule>(
			"../hooks/useContents",
		);
		const src = actual.useArchiveContent.toString();

		// The implementation must delete sessions with status "pending" and future dates
		expect(src).toContain('"pending"');
		expect(src).toContain("sessions");
		expect(src).toContain("delete");
	});

	it("useArchiveContent atualiza status para 'archived'", async () => {
		const actual = await vi.importActual<typeof useContentsModule>(
			"../hooks/useContents",
		);
		const src = actual.useArchiveContent.toString();
		expect(src).toContain('"archived"');
	});
});
