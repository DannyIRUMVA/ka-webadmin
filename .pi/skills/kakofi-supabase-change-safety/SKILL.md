---
name: kakofi-supabase-change-safety
description: Review and execute Supabase-related changes safely for Kakofi. Use whenever a task may alter schema, RLS, SQL, auth, storage, functions, or shared production data that can affect the admin app, main web app, or mobile app.
allowed-tools: read bash supabase plan edit write
---

# Kakofi Supabase Change Safety

Use this skill for any Supabase work that might mutate state or change security behavior.

## Safety policy

Assume all Supabase resources are production-critical unless the user explicitly says a resource is disposable.

High-risk changes include:
- migrations
- raw SQL writes
- RLS/policy changes
- auth admin actions
- storage deletes or bucket policy changes
- trigger/function updates
- destructive data cleanup

## Required process

1. Use `supabase` with `action: "list_tools"` if remote capabilities are unclear.
2. Inspect current state before proposing changes.
3. Use the `plan` tool to record the intended steps.
4. Explain:
   - what will change
   - why it is needed
   - which apps/users may be affected
   - rollback or mitigation path
5. Prefer least-privilege and least-destructive options.
6. If a change is risky, require explicit confirmation before execution.

## SQL review checklist

For any SQL or migration, check for:
- `insert`, `update`, `delete`, `drop`, `truncate`, `alter`, `create`
- policy regressions
- privilege escalation
- cross-app data impact
- irreversible data loss

## Auth and RLS review checklist

- Is admin access separate from general user auth?
- Are policies scoped correctly for admin vs customer/mobile traffic?
- Is service-role usage limited to trusted server contexts?
- Could the change break existing sessions or app flows?

## Response style

Be explicit and conservative. If a safe read-only inspection is possible, do that first.
