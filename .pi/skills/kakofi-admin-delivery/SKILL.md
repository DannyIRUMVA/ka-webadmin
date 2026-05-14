---
name: kakofi-admin-delivery
description: Deliver real admin features in this Kakofi web admin project by converting static UI into production-ready flows backed by Supabase. Use for dashboard wiring, admin CRUD surfaces, verification checklists, and rollout plans that preserve safety for shared web/mobile data.
allowed-tools: read bash edit write supabase plan
---

# Kakofi Admin Delivery

Use this skill when taking a static admin concept and turning it into a real operational feature.

## Delivery pattern

1. Identify which page or admin workflow is being implemented.
2. Identify the real source of truth in Supabase.
3. Confirm the role/access model.
4. Use the `plan` tool to break the work into small steps.
5. Implement the UI, data access, and protection boundaries.
6. Add verification steps for admin, main web app, and mobile app if the data is shared.

## Feature checklist

- auth state is real
- admin gating exists
- loading/error/empty states exist
- queries are scoped and intentional
- destructive actions are guarded
- dashboard metrics are explainable
- rollback or manual recovery is documented for risky actions

## Good defaults

- Prefer read-only dashboards first
- Add mutations only after access control is clear
- Keep dangerous actions behind confirmation and server-side control
- Avoid hidden side effects in the client

## Use cases

- replace placeholder login with Supabase auth
- connect dashboard cards to real metrics
- build vendor/order/customer management screens
- add admin-only mutations with safe confirmation flows
