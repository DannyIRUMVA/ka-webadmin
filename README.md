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

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=dlndxvnjwkehaggstlik"
    }
  }
}
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
