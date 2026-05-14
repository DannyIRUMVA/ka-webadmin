# Kakofi Web Admin Agent Guide

This repository is the Kakofi web admin project. It is intended to control operations for a production Supabase backend that may also be used by Kakofi web and mobile applications.

## Core operating rules

1. Treat Supabase as production-critical unless the user explicitly says otherwise.
2. Assume schema, auth, storage, functions, and RLS changes can affect the main web app and mobile app.
3. Before implementation, inspect and explain:
   - current repo state
   - affected runtime boundary (client / server / Cloudflare / Supabase)
   - affected Supabase resources
   - blast radius for web admin, main web app, and mobile app
4. Use the project `plan` tool to create or update a short execution plan before multi-step work.
5. Use the `supabase` tool with `action: "list_tools"` before unfamiliar remote MCP operations.
6. Prefer read-only inspection first.
7. Do not perform destructive or mutating Supabase operations silently.
8. Before any potentially harmful Supabase action, summarize:
   - what will change
   - what data or auth flow may be affected
   - rollback or mitigation path
9. Never assume a logged-in user is an admin. Admin access must be checked explicitly.
10. Never expose service-role credentials to client code.

## Dangerous Supabase work

Treat the following as high risk:
- SQL that inserts, updates, deletes, truncates, drops, alters, creates, grants, or revokes
- migrations
- RLS or auth policy changes
- auth admin actions
- storage bucket policy or object deletion changes
- edge function changes tied to production workflows
- anything that can affect shared web/mobile data

When such work is requested, prefer this sequence:
1. inspect
2. plan
3. explain blast radius
4. ask/confirm if needed
5. execute the minimal safe change
6. document rollback and verification

## Implementation preference

- Use Nuxt conventions first
- Keep Cloudflare compatibility in mind
- Keep Supabase auth and RLS explicit
- Favor minimal changes over broad refactors
