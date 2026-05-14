<script setup lang="ts">
const route = useRoute()
const navigation = useAdminNavigation()
const { isDark, toggleTheme } = useAdminTheme()
const { emit } = useAdminPageActions()
const { initialize, profile, user, displayName, signOut, initialized, loading } = useAdminAuth()

const sidebarOpen = ref(false)
const signingOut = ref(false)
const signOutError = ref<string | null>(null)
const layoutMounted = ref(false)
const now = ref(new Date())
let clockInterval: ReturnType<typeof setInterval> | null = null

const pageMeta = computed(() => {
  const pages: Record<string, { eyebrow: string; title: string; description: string; action: string; icon: 'dashboard' | 'transactions' | 'creators' | 'audience' | 'finance' | 'payouts' | 'content' | 'system' | 'settings' }> = {
    '/dashboard': {
      eyebrow: 'Overview',
      title: 'Admin dashboard',
      description: 'Simple visibility into creators, audience, transactions, content, and finance.',
      action: 'Export overview',
      icon: 'dashboard'
    },
    '/transactions': {
      eyebrow: 'Transactions',
      title: 'Transactions',
      description: 'Review purchase volume and payment status across products and media.',
      action: 'Export transactions',
      icon: 'transactions'
    },
    '/creators': {
      eyebrow: 'Creators',
      title: 'Creators',
      description: 'Track creator verification, KYC status, and account distribution.',
      action: 'Review creators',
      icon: 'creators'
    },
    '/audience': {
      eyebrow: 'Audience',
      title: 'Audience',
      description: 'Review guest traffic, client records, and audience health.',
      action: 'Export audience',
      icon: 'audience'
    },
    '/finance': {
      eyebrow: 'Finance',
      title: 'Finance',
      description: 'Monitor revenue, ledger movement, and payout readiness.',
      action: 'Download report',
      icon: 'finance'
    },
    '/payouts': {
      eyebrow: 'Payouts',
      title: 'Payouts',
      description: 'Review payout requests and validate creator payout details before approval.',
      action: 'Export payouts',
      icon: 'payouts'
    },
    '/content': {
      eyebrow: 'Content',
      title: 'Content',
      description: 'Track products, movies, articles, and guides.',
      action: 'Review content',
      icon: 'content'
    },
    '/system': {
      eyebrow: 'System',
      title: 'System architecture',
      description: 'View service topology across Supabase, Cloudflare workers, Mux, web, and mobile with live reachability checks.',
      action: 'Refresh health',
      icon: 'system'
    },
    '/settings': {
      eyebrow: 'Settings',
      title: 'Settings',
      description: 'Control admin preferences, templates, and plan configuration.',
      action: 'Save changes',
      icon: 'settings'
    }
  }

  return pages[route.path] ?? pages['/dashboard']
})

const currentTime = computed(() => new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit'
}).format(now.value).replace(',', ' •'))

const adminShellReady = computed(() => initialized.value && !loading.value)
const showAdminLoading = computed(() => !layoutMounted.value || !adminShellReady.value)
const roleLabel = computed(() => (profile.value?.verified_by_admin ? 'Verified admin' : 'Pending verification'))
const currentPath = computed(() => route.path)

const userInitials = computed(() => {
  const source = displayName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')

  return source || 'AD'
})

const isCurrent = (path: string) => currentPath.value === path

const actionEventByRoute: Record<string, string> = {
  '/dashboard': 'dashboard-export',
  '/transactions': 'transactions-export',
  '/creators': 'creators-export',
  '/audience': 'audience-export',
  '/finance': 'finance-export',
  '/payouts': 'payouts-export',
  '/content': 'content-export',
  '/system': 'system-refresh',
  '/settings': 'settings-export'
}

const handlePageAction = () => {
  emit(actionEventByRoute[route.path] ?? 'page-action')
}

const handleSignOut = async () => {
  signingOut.value = true
  signOutError.value = null

  try {
    await signOut()
  } catch (error) {
    signOutError.value = error instanceof Error ? error.message : 'Unable to sign out.'
  } finally {
    signingOut.value = false
  }
}

onMounted(() => {
  layoutMounted.value = true

  initialize().catch((error) => {
    signOutError.value = error instanceof Error ? error.message : 'Unable to initialize admin session.'
  })

  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-[#f8f8f6] text-slate-950 transition-colors duration-300 dark:bg-[#0b0b0c] dark:text-white">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="sidebarOpen && !showAdminLoading" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="sidebarOpen = false" />
    </Transition>

    <div class="min-h-screen lg:pl-[250px]" :class="showAdminLoading ? 'pointer-events-none select-none' : ''">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="-translate-x-full opacity-0"
          enter-to-class="translate-x-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-x-0 opacity-100"
          leave-to-class="-translate-x-full opacity-0"
        >
          <aside
            v-if="sidebarOpen"
            class="fixed inset-y-0 left-0 z-50 flex w-[84vw] max-w-[270px] flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-white/10 dark:bg-[#0f1012] lg:hidden"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-black">
                  <AdminUiIcon name="sparkles" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi</p>
                  <h1 class="text-base font-semibold">Admin</h1>
                </div>
              </div>
              <button class="control-button gap-2 px-3" @click="sidebarOpen = false">
                <AdminUiIcon name="arrow-right" class="h-4 w-4 rotate-180" />
                Close
              </button>
            </div>

            <nav class="mt-8 space-y-2">
              <NuxtLink
                v-for="item in navigation"
                :key="item.to"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-2xl px-3 py-3 transition',
                  isCurrent(item.to)
                    ? 'bg-brand text-black'
                    : 'text-slate-700 hover:bg-brand/10 dark:text-slate-300 dark:hover:bg-brand/10'
                ]"
              >
                <div :class="[
                  'flex h-9 w-9 items-center justify-center rounded-xl',
                  isCurrent(item.to)
                    ? 'bg-black/10 text-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                ]">
                  <AdminUiIcon :name="item.icon" class="h-4 w-4" />
                </div>
                <span class="text-sm font-medium">{{ item.name }}</span>
              </NuxtLink>
            </nav>

            <div class="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">{{ userInitials }}</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ displayName }}</p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ roleLabel }}</p>
                </div>
              </div>

              <p v-if="signOutError" class="mt-4 text-sm text-rose-500">{{ signOutError }}</p>

              <div class="mt-4">
                <button
                  class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="signingOut"
                  @click="handleSignOut"
                >
                  <AdminUiIcon name="logout" class="h-4 w-4" />
                  {{ signingOut ? 'Signing out...' : 'Sign out' }}
                </button>
              </div>
            </div>
          </aside>
        </Transition>

        <aside class="hidden fixed inset-y-0 left-0 z-30 w-[250px] border-r border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0f1012] lg:flex lg:flex-col">
          <div class="flex items-center gap-3 px-2">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-black">
              <AdminUiIcon name="sparkles" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi</p>
              <h1 class="text-base font-semibold">Admin</h1>
            </div>
          </div>

          <nav class="mt-8 space-y-2">
            <NuxtLink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-2xl px-3 py-3 transition',
                isCurrent(item.to)
                  ? 'bg-brand text-black'
                  : 'text-slate-700 hover:bg-brand/10 dark:text-slate-300 dark:hover:bg-brand/10'
              ]"
            >
              <div :class="[
                'flex h-9 w-9 items-center justify-center rounded-xl',
                isCurrent(item.to)
                  ? 'bg-black/10 text-black'
                  : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
              ]">
                <AdminUiIcon :name="item.icon" class="h-4 w-4" />
              </div>
              <span class="text-sm font-medium">{{ item.name }}</span>
            </NuxtLink>
          </nav>

          <div class="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">{{ userInitials }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ displayName }}</p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ roleLabel }}</p>
              </div>
            </div>

            <p v-if="signOutError" class="mt-4 text-sm text-rose-500">{{ signOutError }}</p>

            <div class="mt-4">
              <button
                class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="signingOut"
                @click="handleSignOut"
              >
                <AdminUiIcon name="logout" class="h-4 w-4" />
                {{ signingOut ? 'Signing out...' : 'Sign out' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="min-w-0 flex-1">
          <header class="border-b border-slate-200 bg-[#f8f8f6] dark:border-white/10 dark:bg-[#0b0b0c]">
            <div class="px-3 py-4 sm:px-6 lg:px-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 max-w-3xl">
                  <div class="flex items-center gap-2 lg:hidden">
                    <button class="control-button gap-2" @click="sidebarOpen = true">
                      <AdminUiIcon name="menu" class="h-4 w-4" />
                      Menu
                    </button>
                    <button class="control-button gap-2" @click="toggleTheme">
                      <AdminUiIcon :name="isDark ? 'sun' : 'moon'" class="h-4 w-4" />
                      {{ isDark ? 'Light' : 'Dark' }}
                    </button>
                  </div>

                  <div class="mt-0 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand lg:mt-0">
                    <AdminUiIcon :name="pageMeta.icon" class="h-4 w-4" />
                    {{ pageMeta.eyebrow }}
                  </div>
                  <h2 class="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{{ pageMeta.title }}</h2>
                  <p class="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{{ pageMeta.description }}</p>
                </div>

                <div class="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                  <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div class="control-button gap-2 rounded-2xl border-slate-200 bg-white dark:border-white/10 dark:bg-[#111214]">
                      <AdminUiIcon name="clock" class="h-4 w-4" />
                      {{ currentTime }}
                    </div>
                    <button class="control-button hidden gap-2 rounded-2xl border-slate-200 bg-white lg:inline-flex dark:border-white/10 dark:bg-[#111214]" @click="toggleTheme">
                      <AdminUiIcon :name="isDark ? 'sun' : 'moon'" class="h-4 w-4" />
                      {{ isDark ? 'Light' : 'Dark' }}
                    </button>
                  </div>
                  <button class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 sm:w-auto" @click="handlePageAction">
                    <AdminUiIcon name="arrow-right" class="h-4 w-4" />
                    {{ pageMeta.action }}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main class="overflow-x-hidden px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
            <slot />
          </main>
        </div>
      </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showAdminLoading" class="absolute inset-0 z-[60] flex min-h-screen items-center justify-center bg-[#f8f8f6]/95 px-6 dark:bg-[#0b0b0c]/95">
        <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#111214]">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-brand text-black">
            <AdminUiIcon name="shield" class="h-6 w-6" />
          </div>
          <p class="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi admin</p>
          <h1 class="mt-3 text-2xl font-semibold">Checking admin session...</h1>
          <p class="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Validating your admin access before opening the workspace.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
