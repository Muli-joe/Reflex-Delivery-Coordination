---
name: Production schema sync
description: RiderLink production can lag behind the development PostgreSQL schema until the app is published.
---

When an authentication or data query reports a missing column in the deployed app, compare development and production schemas before changing runtime code. RiderLink's production database is updated through the Replit publish flow, not by startup DDL or a deploy-time migration.

**Why:** The development database can contain a schema change while the deployed API still uses an older production schema, causing every authenticated request to fail before application data loads.

**How to apply:** Keep the schema source of truth current, verify development, then re-publish so Replit applies the non-destructive schema diff to production.