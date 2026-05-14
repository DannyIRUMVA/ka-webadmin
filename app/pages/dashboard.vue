<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

type HealthState = 'online' | 'reachable' | 'degraded' | 'offline'

type ServiceCheck = {
  id: string
  name: string
  kind: 'backend' | 'worker' | 'storage' | 'media' | 'client'
  url: string | null
  description: string
  status: HealthState
  statusCode: number | null
  latencyMs: number | null
  checkedAt: string
  details: string
}

type HealthPayload = {
  checkedAt: string
  services: ServiceCheck[]
}

const AUTO_REFRESH_MS = 45000

interface DashboardSummaryResponse {
  mode: 'verified-admin' | 'session-scoped'
  metrics: {
    profilesTotal: number
    creatorsTotal: number
    transactionsTotal: number
    guestsTotal: number
    verifiedAdmins: number
    kycPending: number
    kycUnverified: number
    kycVerified: number
    subscriptionsActive: number
    subscriptionsFreemium: number
    subscriptionsPro: number
    productsTotal: number
    moviesTotal: number
    moviesPublished: number
    articlesPublished: number
    guidesPublished: number
    ledgerEntriesTotal: number
    transactionsSuccessful: number
    payoutRequestsTotal: number
  }
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const refreshing = ref(false)
const healthRefreshing = ref(false)
const errorMessage = ref<string | null>(null)
const healthErrorMessage = ref<string | null>(null)
const systemPayload = ref<HealthPayload | null>(null)

const metrics = reactive({
  profilesTotal: 0,
  creatorsTotal: 0,
  transactionsTotal: 0,
  guestsTotal: 0,
  verifiedAdmins: 0,
  kycPending: 0,
  kycUnverified: 0,
  kycVerified: 0,
  subscriptionsActive: 0,
  subscriptionsFreemium: 0,
  subscriptionsPro: 0,
  productsTotal: 0,
  moviesTotal: 0,
  moviesPublished: 0,
  articlesPublished: 0,
  guidesPublished: 0,
  ledgerEntriesTotal: 0,
  transactionsSuccessful: 0,
  payoutRequestsTotal: 0
})

let refreshInterval: ReturnType<typeof setInterval> | null = null

const loadDashboard = async (background = false) => {
  if (!import.meta.client) return

  if (background && !loading.value) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  errorMessage.value = null

  try {
    const { data: sessionData, error: sessionError } = await $supabase.auth.getSession()

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    const accessToken = sessionData.session?.access_token

    if (!accessToken) {
      throw new Error('Missing admin session. Please sign in again.')
    }

    const data = await $fetch<DashboardSummaryResponse>('/api/dashboard-summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    Object.assign(metrics, data.metrics)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load dashboard data.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const loadSystemHealth = async (background = false) => {
  if (!import.meta.client) return

  if (background && systemPayload.value) {
    healthRefreshing.value = true
  }

  healthErrorMessage.value = null

  try {
    systemPayload.value = await $fetch<HealthPayload>('/api/system-health')
  } catch (error) {
    healthErrorMessage.value = error instanceof Error ? error.message : 'Unable to load system health.'
  } finally {
    healthRefreshing.value = false
  }
}

const refreshAll = async (background = true) => {
  await Promise.allSettled([
    loadDashboard(background),
    loadSystemHealth(background)
  ])
}

const publishedContentTotal = computed(() => metrics.moviesPublished + metrics.articlesPublished + metrics.guidesPublished)

const topStats = computed(() => [
  { label: 'Profiles', value: String(metrics.profilesTotal), note: 'Total user profiles' },
  { label: 'Creators', value: String(metrics.creatorsTotal), note: 'Creator-led platform' },
  { label: 'Transactions', value: String(metrics.transactionsTotal), note: 'Recorded purchases' },
  { label: 'Guests', value: String(metrics.guestsTotal), note: 'Guest audience records' }
])

const overview = computed(() => [
  { label: 'Verified admins', value: String(metrics.verifiedAdmins) },
  { label: 'KYC pending', value: String(metrics.kycPending) },
  { label: 'Freemium subscriptions', value: String(metrics.subscriptionsFreemium) },
  { label: 'Pro subscriptions', value: String(metrics.subscriptionsPro) },
  { label: 'Products', value: String(metrics.productsTotal) },
  { label: 'Movies', value: String(metrics.moviesTotal) },
  { label: 'Published content', value: String(publishedContentTotal.value) },
  { label: 'Ledger entries', value: String(metrics.ledgerEntriesTotal) }
])

const sections = computed(() => [
  {
    title: 'Creators and verification',
    items: [
      `${metrics.creatorsTotal} creator profiles`,
      `${metrics.kycPending} KYC pending`,
      `${metrics.kycUnverified} unverified`,
      `${metrics.kycVerified} verified`
    ]
  },
  {
    title: 'Subscriptions',
    items: [
      `${metrics.subscriptionsActive} active subscriptions`,
      `${metrics.subscriptionsFreemium} Freemium accounts`,
      `${metrics.subscriptionsPro} Pro accounts`
    ]
  },
  {
    title: 'Content library',
    items: [
      `${metrics.productsTotal} products`,
      `${metrics.moviesTotal} movies`,
      `${metrics.articlesPublished} published articles`,
      `${metrics.guidesPublished} published guides`
    ]
  },
  {
    title: 'Finance',
    items: [
      `${metrics.transactionsTotal} transactions`,
      `${metrics.transactionsSuccessful} successful`,
      `${metrics.ledgerEntriesTotal} ledger entries`,
      `${metrics.payoutRequestsTotal} payout requests`
    ]
  }
])

const systemServices = computed(() => systemPayload.value?.services ?? [])

const healthSummary = computed(() => {
  const counts = {
    online: 0,
    reachable: 0,
    degraded: 0,
    offline: 0
  }

  for (const service of systemServices.value) {
    counts[service.status] += 1
  }

  return [
    { label: 'Online', value: counts.online, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Reachable', value: counts.reachable, tone: 'text-amber-600 dark:text-amber-400' },
    { label: 'Degraded', value: counts.degraded, tone: 'text-orange-600 dark:text-orange-400' },
    { label: 'Offline', value: counts.offline, tone: 'text-rose-600 dark:text-rose-400' }
  ]
})

const checkedAtLabel = computed(() => {
  if (!systemPayload.value?.checkedAt) {
    return 'Not checked yet'
  }

  return new Date(systemPayload.value.checkedAt).toLocaleString()
})

onAction('dashboard-export', () => {
  downloadJson('dashboard-overview.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    publishedContentTotal: publishedContentTotal.value,
    systemHealth: systemPayload.value
  })
})

onMounted(async () => {
  await refreshAll(false)

  refreshInterval = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshAll(true)
    }
  }, AUTO_REFRESH_MS)
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading dashboard data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          v-for="item in topStats"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :note="item.note"
          accent
        />
      </section>

      <AdminPanelCard title="Live system snapshot" subtitle="Real architecture view from the current health endpoint across Supabase, Cloudflare workers, Mux, web, and mobile." badge="Live architecture" accent>
        <div class="space-y-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Last checked: {{ checkedAtLabel }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Auto-refreshes every 45 seconds when this tab is visible.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <div class="rounded-full bg-brand/10 px-3 py-2 text-xs font-medium text-brand">
                {{ healthRefreshing || refreshing ? 'Refreshing live data…' : 'Background refresh active' }}
              </div>
              <NuxtLink to="/system" class="inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95">
                Open system page
              </NuxtLink>
            </div>
          </div>

          <div v-if="healthErrorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {{ healthErrorMessage }}
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="item in healthSummary"
              :key="item.label"
              class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10"
            >
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold" :class="item.tone">{{ item.value }}</p>
            </div>
          </div>

          <AdminSystemArchitectureCanvas v-if="systemServices.length" :services="systemServices" compact />
        </div>
      </AdminPanelCard>

      <AdminPanelCard title="Overview" subtitle="Simple summary of the current platform data." badge="Read-only" accent>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="item in overview"
            :key="item.label"
            class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10"
          >
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
          </div>
        </div>
      </AdminPanelCard>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          accent
        >
          <div class="space-y-2">
            <div
              v-for="item in section.items"
              :key="item"
              class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300"
            >
              {{ item }}
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
