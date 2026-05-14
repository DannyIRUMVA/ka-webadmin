import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<{ creatorIds?: string[] }>(event)

  const creatorIds = Array.from(new Set((body.creatorIds ?? []).filter(Boolean)))

  if (!config.public.supabaseUrl || !config.supabaseServiceRoleKey) {
    return {
      available: false,
      emailsByCreatorId: {} as Record<string, string | null>
    }
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  const entries = await Promise.all(creatorIds.map(async (creatorId) => {
    const { data, error } = await supabase.auth.admin.getUserById(creatorId)

    if (error) {
      return [creatorId, null] as const
    }

    return [creatorId, data.user?.email ?? null] as const
  }))

  return {
    available: true,
    emailsByCreatorId: Object.fromEntries(entries)
  }
})
