---
name: Managed Clerk verification
description: Constraint around disabling email verification in Replit-managed Clerk authentication.
---

Email verification codes in Replit-managed Clerk are controlled by the managed auth tenant rather than the application’s React code. The app should not try to bypass that flow.

**Why:** The official Replit guidance does not document a supported application-level switch for disabling those codes, and managed auth settings may require workspace plan access.

**How to apply:** Treat delivery verification separately from account verification; remove only app-owned checks in the API and UI, and explain the Clerk limitation when asked to remove account verification.