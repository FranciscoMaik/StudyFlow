# Dashboard Done Sessions Bugfix Design

## Overview

When a content is marked as "done", the dashboard (Daily and Weekly views) continues to show
its pending sessions. Two compounding issues cause this:

1. `useMarkContentDone` (and `useArchiveContent`) invalidate the generic `["sessions"]` query
   key, but the dashboard hooks subscribe to `["sessions", "today"]` and `["sessions", "week"]`
   — those specific keys are never invalidated, so the dashboard never refetches.

2. Even if the cache were refreshed, `useTodaySessions` and `useWeeklySessions` query sessions
   without filtering by the associated content's status, so sessions linked to done/archived
   contents would still be returned.

The fix is minimal and two-pronged:
- **Change 1**: In `useMarkContentDone.onSuccess` and `useArchiveContent.onSuccess`, also
  invalidate `["sessions", "today"]` and `["sessions", "week"]`.
- **Change 2**: In `useTodaySessions` and `useWeeklySessions`, join with the `contents` table
  and filter to `contents.status = "active"` so done/archived content sessions are excluded
  at the query level.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — a session exists in the dashboard
  whose associated content has `status = "done"` or `status = "archived"`.
- **Property (P)**: The desired behavior — no session whose content is non-active should appear
  in `useTodaySessions` or `useWeeklySessions` results.
- **Preservation**: Existing behavior for active-content sessions, complete/skip flows, and
  cache invalidation patterns that must remain unchanged by the fix.
- **`useMarkContentDone`**: Mutation hook in `studyflow/src/hooks/useContents.ts` that sets a
  content's status to `"done"` and deletes its future pending sessions.
- **`useArchiveContent`**: Mutation hook in `studyflow/src/hooks/useContents.ts` that sets a
  content's status to `"archived"` and deletes its future pending sessions.
- **`useTodaySessions`**: Query hook in `studyflow/src/hooks/useSessions.ts` that fetches
  sessions scheduled for today (query key `["sessions", "today"]`).
- **`useWeeklySessions`**: Query hook in `studyflow/src/hooks/useSessions.ts` that fetches
  sessions for the current ISO week (query key `["sessions", "week"]`).
- **`contentStatus`**: The `status` field on the `contents` table — one of `"active"`,
  `"done"`, or `"archived"`.

## Bug Details

### Bug Condition

The bug manifests when the dashboard queries sessions and returns rows whose associated content
has `status != "active"`. This occurs because: (a) the specific query keys used by the
dashboard are never invalidated after a mark-done/archive mutation, and (b) the session queries
themselves do not filter by content status.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type { contentId: string, contentStatus: "active" | "done" | "archived" }
  OUTPUT: boolean

  RETURN X.contentStatus = "done" OR X.contentStatus = "archived"
END FUNCTION
```

### Examples

- User marks content "Cálculo I" as done → dashboard still shows today's pending session for
  "Cálculo I" (expected: session disappears immediately).
- User archives content "Inglês B2" → weekly view still lists its sessions for the rest of the
  week (expected: all those sessions are hidden).
- After a page refresh, `useTodaySessions` returns sessions for done contents because the
  Supabase query has no content-status filter (expected: only active-content sessions returned).
- Content with no sessions scheduled today is marked done → no visible change on dashboard
  (edge case: no regression, correct behavior).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Sessions for contents with `status = "active"` must continue to appear in both Daily and
  Weekly views on their correct scheduled dates.
- Completing a session (useCompleteSession) must continue to mark it as "done", award XP,
  and remove it from the pending list.
- Skipping a session (useSkipSession) must continue to mark it as "skipped" and remove it
  from the pending list.
- The `contentTitleMap` in DailyView and WeeklyView (built from `useContents()`) already
  filters to active contents — no change needed there.

**Scope:**
All inputs where `isBugCondition` returns false (i.e., sessions belonging to active contents)
must be completely unaffected by this fix. This includes:
- Any session whose `content.status = "active"`
- Complete and skip session mutations
- Other keyboard/mouse interactions with SessionCard components

## Hypothesized Root Cause

1. **Mismatched query key granularity**: `useMarkContentDone.onSuccess` calls
   `queryClient.invalidateQueries({ queryKey: ["sessions"] })`. React Query's partial-key
   matching would normally cascade to sub-keys, but the dashboard hooks use exact keys
   `["sessions", "today"]` and `["sessions", "week"]`. The invalidation call uses the default
   `exact: false` behavior, which *should* match sub-keys — however, in practice the stale
   refetch is not triggered because the components are already mounted with fresh data.
   Adding explicit invalidations for both sub-keys guarantees a refetch.

2. **No content-status filter in session queries**: `useTodaySessions` and `useWeeklySessions`
   select from `sessions` with `.select("*")` and only filter by `user_id` and date range.
   There is no join to `contents` to exclude sessions whose content is no longer active.
   This means even after a cache refresh, stale sessions for done/archived contents are
   returned from the database.

3. **`useArchiveContent` has the same invalidation gap**: The same missing sub-key
   invalidations exist in `useArchiveContent.onSuccess`, causing the same dashboard staleness
   when a content is archived.

## Correctness Properties

Property 1: Bug Condition - Done/Archived Content Sessions Hidden from Dashboard

_For any_ session `s` where `isBugCondition({ contentId: s.contentId, contentStatus })` returns
true (i.e., the associated content has `status = "done"` or `"archived"`), the fixed
`useTodaySessions` and `useWeeklySessions` SHALL NOT include `s` in their returned arrays.

**Validates: Requirements 2.2, 2.3, 2.4**

Property 2: Preservation - Active Content Sessions Unaffected

_For any_ session `s` where `isBugCondition` returns false (i.e., the associated content has
`status = "active"`), the fixed `useTodaySessions` and `useWeeklySessions` SHALL return the
same result as the original functions, preserving all session data for active contents.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `studyflow/src/hooks/useContents.ts`

**Functions**: `useMarkContentDone`, `useArchiveContent`

**Specific Changes**:

1. **`useMarkContentDone.onSuccess`** — add explicit invalidations for the dashboard sub-keys:
   ```ts
   queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
   queryClient.invalidateQueries({ queryKey: ["sessions", "week"] });
   ```

2. **`useArchiveContent.onSuccess`** — same addition for consistency (Requirement 3.5):
   ```ts
   queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
   queryClient.invalidateQueries({ queryKey: ["sessions", "week"] });
   ```

---

**File**: `studyflow/src/hooks/useSessions.ts`

**Functions**: `useTodaySessions`, `useWeeklySessions`

**Specific Changes**:

3. **`useTodaySessions` query** — replace `.select("*")` with a join that filters by content
   status:
   ```ts
   .select("*, contents!inner(status)")
   .eq("contents.status", "active")
   ```
   The `mapSession` call remains unchanged since the extra `contents` field is ignored.

4. **`useWeeklySessions` query** — same join and filter:
   ```ts
   .select("*, contents!inner(status)")
   .eq("contents.status", "active")
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that
demonstrate the bug on unfixed code, then verify the fix works correctly and preserves
existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.
Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Mock the Supabase client to return sessions linked to a done content, then
render `DailyView` / `WeeklyView` and assert those sessions are visible (demonstrating the
bug). Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Today sessions include done-content session** — mock `useTodaySessions` to return a
   session whose content is "done"; assert it appears in DailyView (will fail on fixed code,
   confirming the bug exists on unfixed code).
2. **Weekly sessions include archived-content session** — same pattern for WeeklyView with an
   archived content session.
3. **Cache not invalidated after mark-done** — simulate `useMarkContentDone` mutation and
   assert `["sessions", "today"]` and `["sessions", "week"]` are invalidated (will fail on
   unfixed code).
4. **Edge case: no sessions for done content** — content marked done with no scheduled
   sessions; assert no regression in empty-state rendering.

**Expected Counterexamples**:
- Sessions for done/archived contents are visible in the dashboard on unfixed code.
- Possible causes: missing sub-key invalidation, missing content-status filter in query.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions
produce the expected behavior.

**Pseudocode:**
```
FOR ALL session s WHERE isBugCondition({ contentId: s.contentId, contentStatus }) DO
  todaySessions  := useTodaySessions_fixed()
  weeklySessions := useWeeklySessions_fixed()
  ASSERT NOT EXISTS x IN todaySessions  WHERE x.contentId = s.contentId
  ASSERT NOT EXISTS x IN weeklySessions WHERE x.contentId = s.contentId
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed
functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL session s WHERE NOT isBugCondition({ contentId: s.contentId, contentStatus }) DO
  ASSERT useTodaySessions_original()  = useTodaySessions_fixed()
  ASSERT useWeeklySessions_original() = useWeeklySessions_fixed()
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain.
- It catches edge cases that manual unit tests might miss.
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs.

**Test Plan**: Observe behavior on UNFIXED code first for active-content sessions, then write
property-based tests capturing that behavior.

**Test Cases**:
1. **Active session preservation** — verify sessions for active contents continue to appear
   in both views after the fix.
2. **Complete session preservation** — verify `useCompleteSession` still marks sessions done
   and triggers XP notification.
3. **Skip session preservation** — verify `useSkipSession` still marks sessions skipped and
   removes them from the pending list.
4. **Mixed content statuses** — verify that when some contents are done and some are active,
   only active-content sessions appear.

### Unit Tests

- Test that `useMarkContentDone.onSuccess` invalidates `["sessions", "today"]` and
  `["sessions", "week"]`.
- Test that `useArchiveContent.onSuccess` invalidates `["sessions", "today"]` and
  `["sessions", "week"]`.
- Test that `useTodaySessions` excludes sessions whose content is "done" or "archived".
- Test that `useWeeklySessions` excludes sessions whose content is "done" or "archived".
- Test edge cases: no sessions for a done content, all sessions for active contents.

### Property-Based Tests

- Generate random sets of sessions with mixed content statuses; verify fixed
  `useTodaySessions` never returns a session with a non-active content.
- Generate random sets of sessions where all contents are active; verify fixed
  `useTodaySessions` returns the same result as the original.
- Generate random mutation sequences (mark-done, archive) and verify the correct query keys
  are invalidated each time.

### Integration Tests

- Full flow: create content → schedule sessions → mark content done → assert dashboard shows
  no sessions for that content.
- Full flow: active content sessions appear correctly before and after an unrelated content is
  marked done.
- Full flow: complete/skip a session on an active content → assert XP awarded and session
  removed, with no side effects on other sessions.
