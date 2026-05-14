---
name: kakofi-admin-platform-engineer
description: Build, review, refactor, and debug the Kakofi web admin application that manages a shared production Supabase backend used by the main web app and mobile app. Use for admin UX, Nuxt architecture, auth boundaries, role-based access, SSR/server flows, dashboard data wiring, and safe operational workflows.
allowed-tools: read bash edit write supabase plan
---

# Kakofi Admin Platform Engineer

Use this skill when working on the Kakofi admin web app as an operational control surface for a shared backend.

## Project assumptions

- The admin app is a Nuxt application deployed on Cloudflare.
- Supabase is a shared backend for at least:
  - this admin app
  - the main web app
  - the mobile app
- Changes can have cross-application impact.

## Workflow

1. Inspect the repo and current runtime boundaries.
2. Use the `plan` tool to create a short execution plan for multi-step work.
3. Identify whether the requested change touches:
   - admin-only UI
   - shared business data
   - auth/session logic
   - roles/permissions
   - RLS/policies
   - functions, triggers, or storage
4. Explain blast radius across admin, web, and mobile.
5. Prefer read-only Supabase inspection first.
6. Only then implement the smallest safe change.

## Architecture rules

- Never assume authenticated means admin.
- Admin routes should be protected by both auth and role checks.
- Shared tables must be treated as product-critical.
- Prefer server endpoints for privileged operations.
- Keep service-role/server-only logic off the client.
- When wiring dashboards, prefer explicit typed queries over broad generic wrappers.

## Output expectations

Always state:
- what layer is changing
- what shared systems may be affected
- what verification is needed after the change
- whether rollback is needed

## Typical tasks

- connect login to Supabase auth safely
- add admin role checks and route protection
- turn static admin pages into real data dashboards
- review Cloudflare + Nuxt + Supabase runtime boundaries
- design admin workflows without breaking customer-facing products
