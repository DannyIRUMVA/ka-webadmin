<script setup lang="ts">
const route = useRoute()
const navigation = useAdminNavigation()
const { isDark, toggleTheme } = useAdminTheme()
const { emit } = useAdminPageActions()
const { initialize, profile, user, displayName, signOut, initialized, loading } = useAdminAuth()

const sidebarOpen = ref(false)
const signingOut = ref(false)
const signOutError = ref<string | null>(null)

const pageMeta = computed(() => {
  const pages: Record<string, { eyebrow: string; title: string; description: string; action: string }> = {
    '/dashboard': {
      eyebrow: 'Overview',
      title: 'Admin dashboard',
      description: 'Simple visibility into creators, audience, transactions, content, and finance.',
      action: 'Export overview'
    },
    '/orders': {
      eyebrow: 'Transactions',
      title: 'Transactions',
      description: 'Review purchase volume and payment status across products and media.',
      action: 'Export transactions'
    },
    '/vendors': {
      eyebrow: 'Creators',
      title: 'Creators',
      description: 'Track creator verification, KYC status, and account distribution.',
      action: 'Review creators'
    },
    '/customers': {
      eyebrow: 'Audience',
      title: 'Audience',
      description: 'Review guest traffic, client records, and audience health.',
      action: 'Export audience'
    },
    '/finance': {
      eyebrow: 'Finance',
      title: 'Finance',
      description: 'Monitor revenue, ledger movement, and payout readiness.',
      action: 'Download report'
    },
    '/support': {
      eyebrow: 'Content',
      title: 'Content',
      description: 'Track products, movies, articles, and guides.',
      action: 'Review content'
    },
    '/system': {
      eyebrow: 'System',
      title: 'System architecture',
      description: 'View service topology across Supabase, Cloudflare workers, Mux, web, and mobile with live reachability checks.',
      action: 'Refresh health'
    },
    '/settings': {
      eyebrow: 'Settings',
      title: 'Settings',
      description: 'Control admin preferences, templates, and plan configuration.',
      action: 'Save changes'
    }
  }

  return pages[route.path] ?? pages['/dashboard']
})

const navGroups = computed(() => [
  {
    title: 'Main',
    items: navigation.slice(0, 5)
  },
  {
    title: 'Workspace',
    items: navigation.slice(5)
  }
])

const currentTime = computed(() => 'Wednesday • 09:24 AM')
const adminShellReady = computed(() => initialized.value && !loading.value)
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
const navInitial = (name: string) => name.charAt(0).toUpperCase()

const actionEventByRoute: Record<string, string> = {
  '/dashboard': 'dashboard-export',
  '/orders': 'transactions-export',
  '/vendors': 'creators-export',
  '/customers': 'audience-export',
  '/finance': 'finance-export',
  '/support': 'content-export',
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
  initialize().catch((error) => {
    signOutError.value = error instanceof Error ? error.message : 'Unable to initialize admin session.'
  })
})

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-white text-slate-950 transition-colors duration-300 dark:bg-[#0b0b0c] dark:text-white">
    <div v-if="!adminShellReady" class="flex min-h-screen items-center justify-center px-6">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#111214]">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi admin</p>
        <h1 class="mt-3 text-2xl font-semibold">Checking admin session...</h1>
        <p class="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Validating your admin access before opening the workspace.
        </p>
      </div>
    </div>

    <template v-else>
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-40 bg-black/40 lg:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>

      <div class="min-h-screen lg:pl-[260px]">
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
            class="fixed inset-y-0 left-0 z-50 flex w-[84vw] max-w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-white/10 dark:bg-[#0f1012] lg:hidden"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-black shadow-sm shadow-brand/30">K</div>
                <div>
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi</p>
                  <h1 class="text-base font-semibold">Admin</h1>
                </div>
              </div>
              <button class="control-button px-3" @click="sidebarOpen = false">Close</button>
            </div>

            <div class="mt-8 space-y-6">
              <div v-for="group in navGroups" :key="group.title">
                <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{{ group.title }}</p>
                <nav class="space-y-1">
                  <NuxtLink
                    v-for="item in group.items"
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
                      'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold',
                      isCurrent(item.to)
                        ? 'bg-black/10 text-black'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                    ]">
                      {{ navInitial(item.name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate text-sm font-medium">{{ item.name }}</span>
                        <span class="text-[11px] text-current/70">{{ item.badge }}</span>
                      </div>
                    </div>
                  </NuxtLink>
                </nav>
              </div>
            </div>

            <div class="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">{{ userInitials }}</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ displayName }}</p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ roleLabel }}</p>
                </div>
              </div>

              <p v-if="signOutError" class="mt-4 text-sm text-rose-500">{{ signOutError }}</p>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <NuxtLink to="/settings" class="control-button justify-center">Settings</NuxtLink>
                <button
                  class="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="signingOut"
                  @click="handleSignOut"
                >
                  {{ signingOut ? 'Signing out...' : 'Sign out' }}
                </button>
              </div>
            </div>
          </aside>
        </Transition>

        <aside class="hidden fixed inset-y-0 left-0 z-30 w-[260px] border-r border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0f1012] lg:flex lg:flex-col">
          <div class="flex items-center gap-3 px-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-black shadow-sm shadow-brand/30">K</div>
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Kakofi</p>
              <h1 class="text-base font-semibold">Admin</h1>
            </div>
          </div>

          <div class="mt-8 space-y-6">
            <div v-for="group in navGroups" :key="group.title">
              <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{{ group.title }}</p>
              <nav class="space-y-1">
                <NuxtLink
                  v-for="item in group.items"
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
                    'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold',
                    isCurrent(item.to)
                      ? 'bg-black/10 text-black'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                  ]">
                    {{ navInitial(item.name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="truncate text-sm font-medium">{{ item.name }}</span>
                      <span class="text-[11px] text-current/70">{{ item.badge }}</span>
                    </div>
                  </div>
                </NuxtLink>
              </nav>
            </div>
          </div>

          <div class="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">{{ userInitials }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ displayName }}</p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ roleLabel }}</p>
              </div>
            </div>

            <p v-if="signOutError" class="mt-4 text-sm text-rose-500">{{ signOutError }}</p>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <NuxtLink to="/settings" class="control-button justify-center">Settings</NuxtLink>
              <button
                class="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="signingOut"
                @click="handleSignOut"
              >
                {{ signingOut ? 'Signing out...' : 'Sign out' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="min-w-0 flex-1">
          <header class="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b0b0c]">
            <div class="px-3 py-4 sm:px-6 lg:px-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 max-w-3xl">
                  <div class="flex items-center gap-3 lg:hidden">
                    <button class="control-button" @click="sidebarOpen = true">Menu</button>
                    <button class="control-button" @click="toggleTheme">{{ isDark ? 'Light' : 'Dark' }}</button>
                  </div>

                  <p class="mt-0 text-xs font-semibold uppercase tracking-[0.28em] text-brand lg:mt-0">{{ pageMeta.eyebrow }}</p>
                  <h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{{ pageMeta.title }}</h2>
                  <p class="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{{ pageMeta.description }}</p>
                </div>

                <div class="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px] lg:min-w-[320px]">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <div class="control-button w-full justify-center rounded-2xl border-slate-200 bg-white sm:w-auto dark:border-white/10 dark:bg-[#111214]">
                      {{ currentTime }}
                    </div>
                    <button class="control-button hidden justify-center rounded-2xl border-slate-200 bg-white lg:inline-flex dark:border-white/10 dark:bg-[#111214]" @click="toggleTheme">
                      {{ isDark ? 'Switch to light' : 'Switch to dark' }}
                    </button>
                  </div>
                  <button class="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 sm:w-auto sm:self-end" @click="handlePageAction">
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
    </template>
  </div>
</template>
