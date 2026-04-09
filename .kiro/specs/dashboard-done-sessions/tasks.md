# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Done/Archived Content Sessions Visible in Dashboard
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases — sessions whose associated content has `status = "done"` or `status = "archived"`
  - File: `studyflow/src/__tests__/bug-condition-exploration.test.tsx`
  - Mock the Supabase client to return sessions linked to a done/archived content for both `useTodaySessions` and `useWeeklySessions`
  - Assert that those sessions DO NOT appear in the rendered DailyView and WeeklyView (this assertion will fail on unfixed code, confirming the bug)
  - Also assert that `useMarkContentDone.onSuccess` invalidates `["sessions", "today"]` and `["sessions", "week"]` — this will fail on unfixed code
  - Bug Condition: `isBugCondition(X)` where `X.contentStatus = "done" OR X.contentStatus = "archived"`
  - Expected Behavior: `NOT EXISTS s IN useTodaySessions() WHERE s.contentId = X.contentId` and same for `useWeeklySessions()`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "session for done content 'Cálculo I' still visible in DailyView")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Active Content Sessions Unaffected
  - **IMPORTANT**: Follow observation-first methodology
  - File: `studyflow/src/__tests__/preservation-property.test.tsx`
  - Observe: on UNFIXED code, sessions for contents with `status = "active"` are returned by `useTodaySessions` and `useWeeklySessions`
  - Observe: `useCompleteSession` marks session as "done" and triggers XP notification on unfixed code
  - Observe: `useSkipSession` marks session as "skipped" and removes it from the pending list on unfixed code
  - Write property-based test: for all sessions where `isBugCondition` returns false (i.e., `content.status = "active"`), the session appears in both Daily and Weekly views
  - Write property-based test: for mixed content statuses (some active, some done), only active-content sessions appear
  - Verify tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - Non-bug condition: `NOT isBugCondition(X)` — i.e., `X.contentStatus = "active"`
  - Observed behavior: active-content sessions are returned unchanged; complete/skip mutations work correctly
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix dashboard done sessions bug

  - [x] 3.1 Add session cache invalidations to useMarkContentDone and useArchiveContent
    - File: `studyflow/src/hooks/useContents.ts`
    - In `useMarkContentDone.onSuccess`: add `queryClient.invalidateQueries({ queryKey: ["sessions", "today"] })` and `queryClient.invalidateQueries({ queryKey: ["sessions", "week"] })`
    - In `useArchiveContent.onSuccess`: add the same two invalidations for consistency
    - _Bug_Condition: isBugCondition(X) where X.contentStatus = "done" OR X.contentStatus = "archived"_
    - _Expected_Behavior: ["sessions", "today"] and ["sessions", "week"] are invalidated on mark-done and archive, triggering dashboard refetch_
    - _Preservation: existing ["contents"], ["contents", id], and ["sessions"] invalidations must remain unchanged_
    - _Requirements: 2.1, 3.5, 3.6_

  - [x] 3.2 Filter session queries by active content status in useTodaySessions and useWeeklySessions
    - File: `studyflow/src/hooks/useSessions.ts`
    - In `useTodaySessions`: replace `.select("*")` with `.select("*, contents!inner(status)").eq("contents.status", "active")`
    - In `useWeeklySessions`: apply the same change — `.select("*, contents!inner(status)").eq("contents.status", "active")`
    - The `mapSession` function remains unchanged; the extra `contents` field in the response is ignored
    - _Bug_Condition: isBugCondition(X) where X.contentStatus = "done" OR X.contentStatus = "archived"_
    - _Expected_Behavior: useTodaySessions and useWeeklySessions never return sessions whose content.status != "active"_
    - _Preservation: sessions for active contents continue to be returned with the same shape and ordering_
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Done/Archived Content Sessions Hidden from Dashboard
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms sessions for done/archived contents are excluded from both views
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Active Content Sessions Unaffected
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm active-content sessions still appear correctly, and complete/skip flows are unaffected

- [x] 4. Checkpoint - Ensure all tests pass
  - Run the full test suite: `cd studyflow && npx vitest --run`
  - Ensure all tests pass, ask the user if questions arise
  - Confirm both the bug condition exploration test and preservation property tests are green
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
