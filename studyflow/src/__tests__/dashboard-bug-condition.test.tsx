/**
 * Bug Condition Exploration Test — dashboard-done-sessions
 *
 * These tests encode the EXPECTED (fixed) behavior.
 * They are EXPECTED TO FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT fix the code or the test when it fails.
 *
 * Bug Condition: isBugCondition(X) where X.contentStatus = "done" OR X.contentStatus = "archived"
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
 */

import { describe, expect, it } from "vitest";
import * as useContentsModule from "../hooks/useContents";
import * as useSessionsModule from "../hooks/useSessions";

// ---------------------------------------------------------------------------
// Test 1 — useMarkContentDone.onSuccess must invalidate ["sessions", "today"]
//           and ["sessions", "week"]
// ---------------------------------------------------------------------------

describe('Bug Condition 1: useMarkContentDone does NOT invalidate ["sessions", "today"] and ["sessions", "week"]', () => {
	/**
	 * On unfixed code, useMarkContentDone.onSuccess only invalidates ["sessions"],
	 * NOT the specific sub-keys ["sessions", "today"] and ["sessions", "week"].
	 * This test WILL FAIL on unfixed code — confirming the bug.
	 *
	 * Validates: Requirements 1.1, 2.1
	 */

	it('useMarkContentDone.onSuccess source must contain invalidation of ["sessions", "today"]', async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();

		// On unfixed code this assertion FAILS because only ["sessions"] is invalidated
		expect(src).toContain('"sessions", "today"');
	});

	it('useMarkContentDone.onSuccess source must contain invalidation of ["sessions", "week"]', async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useMarkContentDone.toString();

		// On unfixed code this assertion FAILS because only ["sessions"] is invalidated
		expect(src).toContain('"sessions", "week"');
	});
});

// ---------------------------------------------------------------------------
// Test 2 — useArchiveContent.onSuccess must invalidate ["sessions", "today"]
//           and ["sessions", "week"]
// ---------------------------------------------------------------------------

describe('Bug Condition 2: useArchiveContent does NOT invalidate ["sessions", "today"] and ["sessions", "week"]', () => {
	/**
	 * On unfixed code, useArchiveContent.onSuccess only invalidates ["sessions"],
	 * NOT the specific sub-keys ["sessions", "today"] and ["sessions", "week"].
	 * This test WILL FAIL on unfixed code — confirming the bug.
	 *
	 * Validates: Requirements 1.1, 2.1
	 */

	it('useArchiveContent.onSuccess source must contain invalidation of ["sessions", "today"]', async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();

		// On unfixed code this assertion FAILS because only ["sessions"] is invalidated
		expect(src).toContain('"sessions", "today"');
	});

	it('useArchiveContent.onSuccess source must contain invalidation of ["sessions", "week"]', async () => {
		const actual = await import("../hooks/useContents");
		const src = actual.useArchiveContent.toString();

		// On unfixed code this assertion FAILS because only ["sessions"] is invalidated
		expect(src).toContain('"sessions", "week"');
	});
});

// ---------------------------------------------------------------------------
// Test 3 — useTodaySessions must join with contents and filter by status = "active"
// ---------------------------------------------------------------------------

describe("Bug Condition 3: useTodaySessions does NOT filter by content status", () => {
	/**
	 * On unfixed code, useTodaySessions uses .select("*") with no join to contents.
	 * Sessions for done/archived contents are returned.
	 * This test WILL FAIL on unfixed code — confirming the bug.
	 *
	 * Validates: Requirements 1.2, 2.2, 2.3
	 */

	it("useTodaySessions source must join with contents table (contents!inner)", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useTodaySessions.toString();

		// On unfixed code this assertion FAILS because there is no join with contents
		expect(src).toContain("contents!inner");
	});

	it('useTodaySessions source must filter by contents.status = "active"', async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useTodaySessions.toString();

		// On unfixed code this assertion FAILS because there is no content status filter
		expect(src).toContain("contents.status");
	});
});

// ---------------------------------------------------------------------------
// Test 4 — useWeeklySessions must join with contents and filter by status = "active"
// ---------------------------------------------------------------------------

describe("Bug Condition 4: useWeeklySessions does NOT filter by content status", () => {
	/**
	 * On unfixed code, useWeeklySessions uses .select("*") with no join to contents.
	 * Sessions for done/archived contents are returned.
	 * This test WILL FAIL on unfixed code — confirming the bug.
	 *
	 * Validates: Requirements 1.3, 2.2, 2.4
	 */

	it("useWeeklySessions source must join with contents table (contents!inner)", async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useWeeklySessions.toString();

		// On unfixed code this assertion FAILS because there is no join with contents
		expect(src).toContain("contents!inner");
	});

	it('useWeeklySessions source must filter by contents.status = "active"', async () => {
		const actual = await import("../hooks/useSessions");
		const src = actual.useWeeklySessions.toString();

		// On unfixed code this assertion FAILS because there is no content status filter
		expect(src).toContain("contents.status");
	});
});

// Suppress unused import warnings — modules are imported dynamically above
void useContentsModule;
void useSessionsModule;
