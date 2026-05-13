<script setup lang="ts">
const route = useRoute()
const navigation = useAdminNavigation()
const { isDark, toggleTheme } = useAdminTheme()

const sidebarOpen = ref(false)

const pageMeta = computed(() => {
  const pages: Record<string, { eyebrow: string; title: string; description: string; action: string }> = {
    '/': {
      eyebrow: 'Operations overview',
      title: 'Welcome back, manage Kakofi with ease.',
      description: 'Designed for low eye strain with soft surfaces, warm highlights, and balanced contrast in both light and dark mode.',
      action: 'Create report'
    },
    '/orders': {
      eyebrow: 'Order management',
      title: 'Track active, delayed, and completed orders.',
      description: 'Review fulfilment flow, delivery pressure, and dispatch bottlenecks from one calm workspace.',
      action: 'Export orders'
    },
    '/vendors': {
      eyebrow: 'Vendor management',
      title: 'Keep restaurant growth healthy and organized.',
      description: 'Monitor onboarding, quality, commission tiers, and high-performing partners across Kakofi.',
      action: 'Add vendor'
    },
    '/customers': {
      eyebrow: 'Customer intelligence',
      title: 'Understand loyalty, retention, and user value.',
      description: 'Explore customer groups, activity trends, and satisfaction opportunities without visual overload.',
      action: 'Create segment'
    },
    '/finance': {
      eyebrow: 'Finance workspace',
      title: 'Stay on top of payouts, revenue, and margins.',
      description: 'Use a softer financial dashboard to review inflow, pending disbursements, and settlement health.',
      action: 'Download statement'
    },
    '/support': {
      eyebrow: 'Support center',
      title: 'Resolve incidents with clarity and speed.',
      description: 'Monitor queues, escalation levels, and response quality using an interface tuned for long sessions.',
      action: 'Open incident'
    },
    '/settings': {
      eyebrow: 'Workspace settings',
      title: 'Control team preferences and platform defaults.',
      description: 'Adjust notifications, permissions, display comfort, and basic security preferences for the admin portal.',
      action: 'Save changes'
    }
  }

  return pages[route.path] ?? pages['/']
})

const navGroups = computed(() => [
  {
    title: 'Platform',
    items: navigation.slice(0, 5)
  },
  {
    title: 'Workspace',
    items: navigation.slice(5)
  }
])

const currentTime = computed(() => 'Wednesday • 09:24 AM')

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <div class="min-h-screen bg-canvas-light text-ink-light transition-colors duration-300 dark:bg-canvas-dark dark:text-ink-dark">
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
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <div class="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
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
          class="fixed inset-y-4 left-4 z-50 flex w-[290px] flex-col rounded-[2rem] border border-line-light bg-white/95 p-5 shadow-soft backdrop-blur dark:border-line-dark dark:bg-panel-dark/95 lg:hidden"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-black shadow-lg shadow-brand/20">
                K
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi</p>
                <h1 class="text-lg font-semibold">Web Admin</h1>
              </div>
            </div>

            <button class="control-button px-3" @click="sidebarOpen = false">Close</button>
          </div>

          <div class="mt-6 rounded-[1.75rem] border border-brand/15 bg-brand/10 p-4 dark:bg-brand/8">
            <p class="text-xs uppercase tracking-[0.28em] text-brand/80">Clean sidebar</p>
            <p class="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
              Fast access to the main Kakofi admin areas with a softer, calmer visual hierarchy.
            </p>
          </div>

          <div class="mt-6 flex-1 overflow-y-auto pr-1">
            <div v-for="group in navGroups" :key="group.title" class="mb-6">
              <p class="mb-3 px-2 text-xs uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">{{ group.title }}</p>
              <nav class="space-y-2">
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  :class="[
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition',
                    route.path === item.to
                      ? 'border-brand/20 bg-brand/12 text-ink-light dark:text-ink-dark'
                      : 'border-transparent text-muted-light hover:border-line-light hover:bg-soft-light hover:text-ink-light dark:text-muted-dark dark:hover:border-line-dark dark:hover:bg-soft-dark dark:hover:text-ink-dark'
                  ]"
                >
                  <span class="flex items-center gap-3">
                    <span
                      :class="[
                        'h-2.5 w-2.5 rounded-full',
                        route.path === item.to ? 'bg-brand' : 'bg-line-light dark:bg-line-dark'
                      ]"
                    />
                    {{ item.name }}
                  </span>
                  <span class="rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand">{{ item.badge }}</span>
                </NuxtLink>
              </nav>
            </div>
          </div>

          <div class="surface-card mt-4 p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-light text-sm font-semibold dark:bg-soft-dark">CN</div>
              <div>
                <p class="font-medium">Clarisse N.</p>
                <p class="text-sm text-muted-light dark:text-muted-dark">Platform administrator</p>
              </div>
            </div>
          </div>
        </aside>
      </Transition>

      <aside class="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-line-light bg-white/85 p-5 backdrop-blur dark:border-line-dark dark:bg-panel-dark/90 lg:flex">
        <div class="flex items-center gap-3 px-1">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-black shadow-lg shadow-brand/20">
            K
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi</p>
            <h1 class="text-lg font-semibold">Web Admin</h1>
          </div>
        </div>

        <div class="mt-6 rounded-[1.75rem] border border-brand/15 bg-brand/10 p-4 dark:bg-brand/8">
          <p class="text-xs uppercase tracking-[0.28em] text-brand/80">Control center</p>
          <p class="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
            Clean navigation for operations, vendors, customers, finance, support, and settings.
          </p>
        </div>

        <div class="mt-6 flex-1 overflow-y-auto pr-1">
          <div v-for="group in navGroups" :key="group.title" class="mb-6">
            <p class="mb-3 px-2 text-xs uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">{{ group.title }}</p>
            <nav class="space-y-2">
              <NuxtLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                :class="[
                  'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition',
                  route.path === item.to
                    ? 'border-brand/20 bg-brand/12 text-ink-light dark:text-ink-dark'
                    : 'border-transparent text-muted-light hover:border-line-light hover:bg-soft-light hover:text-ink-light dark:text-muted-dark dark:hover:border-line-dark dark:hover:bg-soft-dark dark:hover:text-ink-dark'
                ]"
              >
                <span class="flex items-center gap-3">
                  <span
                    :class="[
                      'h-2.5 w-2.5 rounded-full',
                      route.path === item.to ? 'bg-brand' : 'bg-line-light dark:bg-line-dark'
                    ]"
                  />
                  {{ item.name }}
                </span>
                <span class="rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand">{{ item.badge }}</span>
              </NuxtLink>
            </nav>
          </div>
        </div>

        <div class="space-y-3 border-t border-line-light pt-4 dark:border-line-dark">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-2xl bg-soft-light p-3 dark:bg-soft-dark">
              <p class="text-muted-light dark:text-muted-dark">Alerts</p>
              <p class="mt-1 font-semibold">06</p>
            </div>
            <div class="rounded-2xl bg-soft-light p-3 dark:bg-soft-dark">
              <p class="text-muted-light dark:text-muted-dark">Teams</p>
              <p class="mt-1 font-semibold">08</p>
            </div>
          </div>

          <div class="surface-card p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-light text-sm font-semibold dark:bg-soft-dark">CN</div>
              <div>
                <p class="font-medium">Clarisse N.</p>
                <p class="text-sm text-muted-light dark:text-muted-dark">Platform administrator</p>
              </div>
            </div>

            <div class="mt-4 flex gap-3">
              <NuxtLink to="/settings" class="control-button flex-1 justify-center">Settings</NuxtLink>
              <NuxtLink to="/login" class="rounded-2xl bg-brand px-4 py-3 text-center text-sm font-semibold text-black transition hover:brightness-95">
                Login UI
              </NuxtLink>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="rounded-[2rem] border border-line-light bg-white/70 p-4 backdrop-blur dark:border-line-dark dark:bg-panel-dark/70 lg:p-6">
          <header class="flex flex-col gap-5 border-b border-line-light pb-6 dark:border-line-dark">
            <div class="flex items-center justify-between gap-3 lg:hidden">
              <button class="control-button" @click="sidebarOpen = true">
                Menu
              </button>
              <button class="control-button" @click="toggleTheme">
                {{ isDark ? 'Light mode' : 'Dark mode' }}
              </button>
            </div>

            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div class="max-w-3xl">
                <p class="text-sm uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">{{ pageMeta.eyebrow }}</p>
                <h2 class="mt-2 text-3xl font-semibold tracking-tight">{{ pageMeta.title }}</h2>
                <p class="mt-3 text-sm leading-7 text-muted-light dark:text-muted-dark">
                  {{ pageMeta.description }}
                </p>
              </div>

              <div class="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[420px]">
                <div class="flex flex-col gap-3 md:flex-row">
                  <div class="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search orders, vendors, customers..."
                      class="field-input w-full pl-11"
                    />
                    <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-light dark:text-muted-dark">⌕</span>
                  </div>

                  <div class="flex gap-3">
                    <div class="control-button min-w-[168px] justify-center">{{ currentTime }}</div>
                    <button class="control-button hidden lg:inline-flex" @click="toggleTheme">
                      {{ isDark ? 'Switch to light' : 'Switch to dark' }}
                    </button>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <div class="rounded-full bg-brand/12 px-3 py-1.5 text-xs font-medium text-brand">Live workspace</div>
                  <div class="rounded-full bg-soft-light px-3 py-1.5 text-xs text-muted-light dark:bg-soft-dark dark:text-muted-dark">Balanced contrast</div>
                  <div class="rounded-full bg-soft-light px-3 py-1.5 text-xs text-muted-light dark:bg-soft-dark dark:text-muted-dark">Sidebar navigation</div>
                  <button class="ml-auto rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95">
                    {{ pageMeta.action }}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div class="pt-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
