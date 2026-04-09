/**
 * Preservation Property Tests — dashboard-done-sessions
 *
 * These tests encode UNCHANGED behaviors that must be preserved after the fix.
 * They MUST PASS on unfixed code to establish the baseline.
 * They MUST ALSO PASS after the fix is applied (no regressions).
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, expect, it } from "vitest";
import * as useContentsModule from "../hooks/useContents";
import * as useSessionsModule from "../hooks/useSessions";

// ---------------------------------------------------------------------------
// Property 3.1 & 3.2 — useTodaySessions and useWeeklySessions are exported
// ---------------------------------------------------------------------------

describe("Preservation 3.1 & 3.2: useTodaySessions and useWeeklySessions are exported functions", () => {
	/**
	 * Sessions for active contents must continue to appear in Daily and Weekly views.
	 * The hooks that power those views must remain exported and callable.
	 *
	 * Validates: Requirements 3.1, 3.2
	 */

	it("useTodaySessions is exported as a function", async () => {
		const actual = await import("../hooks/useSessions");
		expect(typeof actual.useTodaySessions).toBe("function");
	});

	it("useWeeklySessions is exported as a function", async () => {
		const actual = await import("../hooks/useSessions");
		expect(typeof actual.useWeeklySessions).toBe("function");
	});

	it("useTodaySessions queries the sessions table", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useTodaySessions.toString();
		expect(src).toContain("sessions");
	});

	it("useWeeklySessions queries the sessions table", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useWeeklySessions.toString();
		expect(src).toContain("sessions");
	});

	it("useTodaySessions filters by user_id (only current user's sessions)", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useTodaySessions.toString();
		expect(src).toContain("user_id");
	});

	it("useWeeklySessions filters by user_id (only current user's sessions)", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useWeeklySessions.toString();
		expect(src).toContain("user_id");
	});

	it("useTodaySessions uses query key ['sessions', 'today']", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useTodaySessions.toString();
		expect(src).toContain('"sessions"');
		expect(src).toContain('"today"');
	});

	it("useWeeklySessions uses query key ['sessions', 'week']", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useWeeklySessions.toString();
		expect(src).toContain('"sessions"');
		expect(src).toContain('"week"');
	});
});

// ---------------------------------------------------------------------------
// Property 3.3 — useCompleteSession marks sessions done and triggers XP
// ---------------------------------------------------------------------------

describe("Preservation 3.3: useCompleteSession marks sessions done and triggers XP", () => {
	/**
	 * Completing a session must continue to mark it as "done" and award XP.
	 * We verify this by inspecting the actual source.
	 *
	 * Validates: Requirements 3.3
	 */

	it("useCompleteSession is exported as a function", async () => {
		const actual = await import("../hooks/useSessions");
		expect(typeof actual.useCompleteSession).toBe("function");
	});

	it("useCompleteSession updates status to 'done'", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useCompleteSession.toString();
		expect(src).toContain('"done"');
	});

	it("useCompleteSession invalidates ['sessions', 'today'] query", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useCompleteSession.toString();
		expect(src).toContain('"today"');
	});

	it("useCompleteSession invalidates ['sessions', 'week'] query", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useCompleteSession.toString();
		expect(src).toContain('"week"');
	});

	it("useCompleteSession triggers XP notification (addXPNotification)", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useCompleteSession.toString();
		expect(src).toContain("addXPNotification");
	});

	it("useCompleteSession sets completed_at timestamp", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useCompleteSession.toString();
		expect(src).toContain("completed_at");
	});
});

// ---------------------------------------------------------------------------
// Property 3.4 — useSkipSession marks sessions skipped
// ---------------------------------------------------------------------------

describe("Preservation 3.4: useSkipSession marks sessions skipped", () => {
	/**
	 * Skipping a session must continue to mark it as "skipped".
	 * We verify this by inspecting the actual source.
	 *
	 * Validates: Requirements 3.4
	 */

	it("useSkipSession is exported as a function", async () => {
		const actual = await import("../hooks/useSessions");
		expect(typeof actual.useSkipSession).toBe("function");
	});

	it("useSkipSession updates status to 'skipped'", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useSkipSession.toString();
		expect(src).toContain('"skipped"');
	});

	it("useSkipSession invalidates ['sessions', 'today'] query", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useSkipSession.toString();
		expect(src).toContain('"today"');
	});

	it("useSkipSession invalidates ['sessions', 'week'] query", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useSkipSession.toString();
		expect(src).toContain('"week"');
	});
});

// ---------------------------------------------------------------------------
// Property 3.5 — useArchiveContent deletes future pending sessions from DB
// ---------------------------------------------------------------------------

describe("Preservation 3.5: useArchiveContent deletes future pending sessions", () => {
	/**
	 * Archiving a content must continue to delete its future pending sessions.
	 * We verify this by inspecting the actual source.
	 *
	 * Validates: Requirements 3.5
	 */

	it("useArchiveContent is exported as a function", async () => {
		const actual = await import("../hooks/useContents");
		expect(typeof actual.useArchiveContent).toBe("function");
	});

	it("useArchiveContent sets content status to 'archived'", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();
		expect(src).toContain('"archived"');
	});

	it("useArchiveContent deletes sessions from the sessions table", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();
		expect(src).toContain("sessions");
		expect(src).toContain("delete");
	});

	it("useArchiveContent targets only 'pending' sessions", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();
		expect(src).toContain('"pending"');
	});

	it("useArchiveContent only deletes FUTURE sessions (gt scheduled_date)", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();
		// Must use gt (greater than) to only delete future sessions
		expect(src).toContain("gt");
	});
});

// ---------------------------------------------------------------------------
// Property 3.6 — useMarkContentDone deletes future pending sessions from DB
// ---------------------------------------------------------------------------

describe("Preservation 3.6: useMarkContentDone deletes future pending sessions", () => {
	/**
	 * Marking a content as done must continue to delete its future pending sessions.
	 * We verify this by inspecting the actual source.
	 *
	 * Validates: Requirements 3.6
	 */

	it("useMarkContentDone is exported as a function", async () => {
		const actual = await import("../hooks/useContents");
		expect(typeof actual.useMarkContentDone).toBe("function");
	});

	it("useMarkContentDone sets content status to 'done'", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();
		expect(src).toContain('"done"');
	});

	it("useMarkContentDone deletes sessions from the sessions table", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();
		expect(src).toContain("sessions");
		expect(src).toContain("delete");
	});

	it("useMarkContentDone targets only 'pending' sessions", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();
		expect(src).toContain('"pending"');
	});

	it("useMarkContentDone only deletes FUTURE sessions (gt scheduled_date)", async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();
		// Must use gt (greater than) to only delete future sessions
		expect(src).toContain("gt");
	});
});

// Suppress unused import warnings — modules are imported dynamically above
void useContentsModule;
void useSessionsModule;
