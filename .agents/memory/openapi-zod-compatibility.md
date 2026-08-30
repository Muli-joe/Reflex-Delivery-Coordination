---
name: OpenAPI Zod compatibility
description: The current workspace pins Zod 3 while the generator may emit Zod 4-only helpers for OpenAPI integer schemas.
---

When extending the OpenAPI contract, prefer numeric schemas for dashboard counters and optimistic-lock versions unless the workspace Zod version is upgraded deliberately.

**Why:** Code generation can complete while the generated validation package fails typechecking if integer schemas become `zod.int()`, which Zod 3 does not expose.

**How to apply:** After every contract change, run codegen and the shared library typecheck before adding server handlers.