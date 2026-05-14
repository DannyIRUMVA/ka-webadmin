import type { User } from '@supabase/supabase-js'

interface AdminProfile {
  id: string
  full_name: string | null
  name: string | null
  avatar_url: string | null
  role: string | null
  verified_by_admin: boolean | null
}

let initializePromise: Promise<void> | null = null
let authListenerRegistered = false

export const useAdminAuth = () => {
  const { $supabase } = useNuxtApp()

  const user = useState<User | null>('admin-auth:user', () => null)
  const profile = useState<AdminProfile | null>('admin-auth:profile', () => null)
  const initialized = useState<boolean>('admin-auth:initialized', () => false)
  const loading = useState<boolean>('admin-auth:loading', () => false)
  const lastError = useState<string | null>('admin-auth:last-error', () => null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.verified_by_admin === true)
  const displayName = computed(() => profile.value?.full_name || profile.value?.name || user.value?.email || 'Admin user')

  const loadProfile = async (userId: string) => {
    const { data, error } = await $supabase
      .from('profiles')
      .select('id, full_name, name, avatar_url, role, verified_by_admin')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      profile.value = null
      lastError.value = error.message
      return
    }

    profile.value = data
  }

  const refresh = async () => {
    if (!import.meta.client) {
      return
    }

    loading.value = true
    lastError.value = null

    try {
      const { data, error } = await $supabase.auth.getUser()

      if (error) {
        throw error
      }

      user.value = data.user ?? null

      if (user.value) {
        await loadProfile(user.value.id)
      } else {
        profile.value = null
      }
    } catch (error) {
      user.value = null
      profile.value = null
      lastError.value = error instanceof Error ? error.message : 'Unable to load auth state.'
    } finally {
      loading.value = false
      initialized.value = true
      initializePromise = null
    }
  }

  const initialize = async () => {
    if (!import.meta.client) {
      return
    }

    if (initialized.value && !loading.value) {
      return
    }

    if (!authListenerRegistered) {
      authListenerRegistered = true
      $supabase.auth.onAuthStateChange(() => {
        refresh().catch((error) => {
          lastError.value = error instanceof Error ? error.message : 'Unable to refresh auth state.'
        })
      })
    }

    if (!initializePromise) {
      initializePromise = refresh()
    }

    await initializePromise
  }

  const signInWithGoogle = async (redirectPath = '/dashboard') => {
    lastError.value = null

    if (!import.meta.client) {
      return
    }

    const redirectTarget = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
    const { error } = await $supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTarget
      }
    })

    if (error) {
      lastError.value = error.message
      throw error
    }
  }

  const signOut = async () => {
    lastError.value = null

    const { error } = await $supabase.auth.signOut()
    if (error) {
      lastError.value = error.message
      throw error
    }

    user.value = null
    profile.value = null
    initialized.value = true

    await navigateTo('/login')
  }

  return {
    user,
    profile,
    initialized,
    loading,
    lastError,
    isAuthenticated,
    isAdmin,
    displayName,
    initialize,
    refresh,
    signInWithGoogle,
    signOut
  }
}
