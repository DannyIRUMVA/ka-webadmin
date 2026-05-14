# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Environment

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

Required app/runtime values:

```bash
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
SYSTEM_HEALTH_STRIPE_WORKER_URL=...
SYSTEM_HEALTH_LOCAL_PAYMENT_WORKER_URL=...
SYSTEM_HEALTH_R2_UPLOADER_WORKER_URL=...
SYSTEM_HEALTH_MUX_STATUS_URL=...
```

Notes:
- `NUXT_PUBLIC_*` values are exposed to the browser by Nuxt, so only use public-safe values there.
- Do not commit `.env`.
- For Cloudflare deployment, mirror these values in the Pages/Workers environment settings.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Project-local pi extensions and skills

This repo now includes project-local pi resources under `.pi/`.

Extensions:
- `.pi/extensions/supabase-mcp.ts` → adds a `supabase` tool for listing/calling the configured Supabase MCP server
- `.pi/extensions/supabase-safety.ts` → prompts before potentially harmful Supabase operations
- `.pi/extensions/planning.ts` → adds a `plan` tool and `/plans` command for task planning

Skills:
- `.pi/skills/kakofi-admin-platform-engineer/`
- `.pi/skills/kakofi-supabase-change-safety/`
- `.pi/skills/kakofi-admin-delivery/`

Extra command:
- `/supabase-tools` to refresh and preview remote MCP tools

Configured MCP endpoint:

```bash
SUPABASE_PROJECT_REF=...
# or
SUPABASE_MCP_URL=https://mcp.supabase.com/mcp?project_ref=...
```

Because these resources live under `.pi/extensions/` and `.pi/skills/`, pi should auto-discover them for this project.

If the Supabase MCP endpoint requires authentication, export one of these before starting pi:

```bash
export SUPABASE_ACCESS_TOKEN=...
# or
export SUPABASE_MCP_ACCESS_TOKEN=...
# or
export SUPABASE_MCP_BEARER_TOKEN=...
```
