import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export type AdminDataMode = 'verified-admin' | 'session-scoped'

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) return null
  const [type, token] = authorizationHeader.split(' ')
  if (type?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export const getVerifiedAdminDataClient = async (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const accessToken = getBearerToken(getHeader(event, 'authorization'))

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({ statusCode: 503, statusMessage: 'Admin data endpoint is missing public Supabase config.' })
  }

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing admin access token.' })
  }

  const authClient = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken)

  if (authError || !authData.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid admin session.' })
  }

  const privilegedClient = config.supabaseServiceRoleKey
    ? createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null

  const sessionClient = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })

  const profileClient = privilegedClient ?? sessionClient
  const dataClient = privilegedClient ?? sessionClient
  const mode: AdminDataMode = privilegedClient ? 'verified-admin' : 'session-scoped'

  const { data: profile, error: profileError } = await profileClient
    .from('profiles')
    .select('verified_by_admin')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  if (!profile?.verified_by_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required.' })
  }

  return {
    mode,
    dataClient
  }
}

export const getExactCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return count ?? 0
}
