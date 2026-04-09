# Bugfix Requirements Document

## Introduction

When a user marks a content as "done" in the Contents page, the dashboard (both Daily and Weekly views) continues to display pending sessions associated with that content. This happens due to two compounding issues: (1) `useMarkContentDone` invalidates the generic `["sessions"]` query key, but the dashboard hooks use the more specific `["sessions", "today"]` and `["sessions", "week"]` keys — so those caches are never refreshed; (2) `useTodaySessions` and `useWeeklySessions` fetch sessions without filtering by the associated content's status, so even after a cache refresh, sessions linked to done/archived contents would still be returned. As a result, sessions for done contents either remain visible as "pending" or appear with the label "Missão Desconhecida" instead of being hidden.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user marks a content as "done" THEN the system does not invalidate the `["sessions", "today"]` and `["sessions", "week"]` query caches, so the dashboard does not refetch session data.

1.2 WHEN the dashboard fetches today's sessions THEN the system returns all pending sessions regardless of the associated content's status, including sessions linked to done or archived contents.

1.3 WHEN the dashboard fetches this week's sessions THEN the system returns all sessions regardless of the associated content's status, including sessions linked to done or archived contents.

1.4 WHEN a content is marked as "done" and the dashboard re-renders THEN the system displays sessions for that content as "Missão Desconhecida" because `useContents()` only returns active contents, leaving the `contentTitleMap` without an entry for the done content's id.

### Expected Behavior (Correct)

2.1 WHEN a user marks a content as "done" THEN the system SHALL invalidate both `["sessions", "today"]` and `["sessions", "week"]` query caches so the dashboard immediately refetches.

2.2 WHEN the dashboard fetches today's sessions THEN the system SHALL return only sessions whose associated content has `status = "active"`, excluding sessions linked to done or archived contents.

2.3 WHEN the dashboard fetches this week's sessions THEN the system SHALL return only sessions whose associated content has `status = "active"`, excluding sessions linked to done or archived contents.

2.4 WHEN a content is marked as "done" and the dashboard re-renders THEN the system SHALL NOT display any sessions for that content in either the Daily or Weekly view.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a content has `status = "active"` THEN the system SHALL CONTINUE TO display its pending sessions in the Daily view on the correct scheduled date.

3.2 WHEN a content has `status = "active"` THEN the system SHALL CONTINUE TO display its pending sessions in the Weekly view grouped by day.

3.3 WHEN a user completes a session THEN the system SHALL CONTINUE TO mark it as "done", award XP, and remove it from the pending list in both views.

3.4 WHEN a user skips a session THEN the system SHALL CONTINUE TO mark it as "skipped" and remove it from the pending list in both views.

3.5 WHEN a content is archived (not marked done) THEN the system SHALL CONTINUE TO hide its sessions from the dashboard in the same way as done contents.

3.6 WHEN a user marks a content as "done" THEN the system SHALL CONTINUE TO delete future pending sessions for that content from the database.

---

## Bug Condition

**Bug Condition Function:**

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type { contentId: string, contentStatus: "active" | "done" | "archived" }
  OUTPUT: boolean

  RETURN X.contentStatus = "done" OR X.contentStatus = "archived"
END FUNCTION
```

**Property: Fix Checking**

```pascal
FOR ALL X WHERE isBugCondition(X) DO
  todaySessions  ← useTodaySessions'()
  weeklySessions ← useWeeklySessions'()
  ASSERT NOT EXISTS s IN todaySessions  WHERE s.contentId = X.contentId
  ASSERT NOT EXISTS s IN weeklySessions WHERE s.contentId = X.contentId
END FOR
```

**Property: Preservation Checking**

```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT useTodaySessions(X)  = useTodaySessions'(X)
  ASSERT useWeeklySessions(X) = useWeeklySessions'(X)
END FOR
```
