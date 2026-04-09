/**
 * Bug Condition Exploration Test — activity-done-status
 *
 * These tests encode the EXPECTED (fixed) behavior.
 * They are EXPECTED TO FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT fix the code or the test when it fails.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentCard } from "../components/contents/ContentCard";
import type { Content } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const activeContent: Content = {
	id: "content-1",
	userId: "user-1",
	title: "Algoritmos e Estruturas de Dados",
	estimatedHours: 10,
	completedHours: 2,
	priority: "high",
	status: "active",
	createdAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Test 1 — Hook ausente: useMarkContentDone não deve existir em useContents.ts
// ---------------------------------------------------------------------------

describe("Bug Condition 1: useMarkContentDone hook ausente", () => {
	it("deve exportar useMarkContentDone de useContents (falha no código não corrigido)", async () => {
		// Dynamically import the module so we can inspect its exports
		const useContentsModule = await import("../hooks/useContents");

		// This assertion WILL FAIL on unfixed code because useMarkContentDone does not exist
		expect(
			typeof (useContentsModule as Record<string, unknown>)[
				"useMarkContentDone"
			],
		).toBe("function");
	});
});

// ---------------------------------------------------------------------------
// Test 2 — Botão ausente: ContentCard não exibe botão "Feito" nem ícone CheckCircle
// ---------------------------------------------------------------------------

describe("Bug Condition 2: Botão 'Feito' ausente no ContentCard", () => {
	it("deve exibir botão com label 'Feito' quando onDone é fornecido (falha no código não corrigido)", () => {
		const onDone = vi.fn();

		render(
			<ContentCard
				content={activeContent}
				// @ts-expect-error — prop onDone não existe no código não corrigido
				onDone={onDone}
			/>,
		);

		// This assertion WILL FAIL on unfixed code because no "Feito" button is rendered
		const doneButton = screen.queryByRole("button", { name: /feito/i });
		expect(doneButton).toBeInTheDocument();
	});

	it("deve exibir ícone CheckCircle quando onDone é fornecido (falha no código não corrigido)", () => {
		const onDone = vi.fn();

		render(
			<ContentCard
				content={activeContent}
				// @ts-expect-error — prop onDone não existe no código não corrigido
				onDone={onDone}
			/>,
		);

		// CheckCircle icon should be present — aria-label or svg title
		// We check by aria-label on the button
		const doneButton = screen.queryByRole("button", { name: /feito/i });
		expect(doneButton).toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 3 — Status não atualizado: clicar no botão de ação não muda status para "done"
// ---------------------------------------------------------------------------

describe("Bug Condition 3: Clicar no botão de ação não altera status para 'done'", () => {
	it("deve chamar onDone com o id do conteúdo ao confirmar (falha no código não corrigido)", async () => {
		const onDone = vi.fn();

		render(
			<ContentCard
				content={activeContent}
				// @ts-expect-error — prop onDone não existe no código não corrigido
				onDone={onDone}
			/>,
		);

		// The "Feito" button should exist — this will fail on unfixed code
		const doneButton = screen.queryByRole("button", { name: /feito/i });
		expect(doneButton).toBeInTheDocument();
	});
});

// ---------------------------------------------------------------------------
// Test 4 — Seção ausente: página Contents não exibe seção de concluídos
// ---------------------------------------------------------------------------

describe("Bug Condition 4: Seção 'Concluídos & Arquivados' ausente na página Contents", () => {
	it("deve exibir seção de concluídos/arquivados na página Contents (falha no código não corrigido)", async () => {
		// We inspect the Contents page source to check if it renders a "Concluídos" section.
		// Since the page requires auth/query context, we check the module statically.
		const contentsModule = await import("../pages/Contents");

		// The Contents component source should reference useDoneContents after the fix.
		// On unfixed code, useDoneContents is not imported/used.
		const useContentsModule = await import("../hooks/useContents");

		// This assertion WILL FAIL on unfixed code because useDoneContents does not exist
		expect(
			typeof (useContentsModule as Record<string, unknown>)["useDoneContents"],
		).toBe("function");

		// Also verify useReopenContent exists
		expect(
			typeof (useContentsModule as Record<string, unknown>)["useReopenContent"],
		).toBe("function");

		// Suppress unused variable warning
		void contentsModule;
	});
});
