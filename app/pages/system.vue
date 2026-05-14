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

type ServiceAction = {
  href: string
  label: string
  external?: boolean
}

const AUTO_REFRESH_MS = 45000

const { onAction } = useAdminPageActions()

const loading = ref(true)
const refreshing = ref(false)
const errorMessage = ref<string | null>(null)
const payload = ref<HealthPayload | null>(null)

let refreshInterval: ReturnType<typeof setInterval> | null = null

const getServiceAction = (service: ServiceCheck): ServiceAction | null => {
  if (service.id === 'web-platform') {
    return { href: '/dashboard', label: 'Open dashboard' }
  }

  if (service.id === 'mobile-platform') {
    return { href: '/audience', label: 'Open audience' }
  }

  if (service.url) {
    return { href: service.url, label: 'Open endpoint', external: true }
  }

  return null
}

const loadHealth = async () => {
  errorMessage.value = null

  if (payload.value) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  try {
    payload.value = await $fetch<HealthPayload>('/api/system-health')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load system health.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const serviceCards = computed(() => payload.value?.services ?? [])

const healthSummary = computed(() => {
  const counts = {
    online: 0,
    reachable: 0,
    degraded: 0,
    offline: 0
  }

  for (const service of serviceCards.value) {
    counts[service.status] += 1
  }

  return [
    { label: 'Online', value: counts.online, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Reachable', value: counts.reachable, tone: 'text-amber-600 dark:text-amber-400' },
    { label: 'Degraded', value: counts.degraded, tone: 'text-orange-600 dark:text-orange-400' },
    { label: 'Offline', value: counts.offline, tone: 'text-rose-600 dark:text-rose-400' }
  ]
})

const statusClass = (status: HealthState) => {
  if (status === 'online') return 'bg-emerald-500'
  if (status === 'reachable') return 'bg-amber-500'
  if (status === 'degraded') return 'bg-orange-500'
  return 'bg-rose-500'
}

const statusTextClass = (status: HealthState) => {
  if (status === 'online') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'reachable') return 'text-amber-600 dark:text-amber-400'
  if (status === 'degraded') return 'text-orange-600 dark:text-orange-400'
  return 'text-rose-600 dark:text-rose-400'
}

const formatStatus = (status: HealthState) => status.charAt(0).toUpperCase() + status.slice(1)

const formatCheckedAt = computed(() => {
  if (!payload.value?.checkedAt) {
    return '—'
  }

  return new Date(payload.value.checkedAt).toLocaleString()
})

onAction('system-refresh', async () => {
  await loadHealth()
})

onMounted(async () => {
  await loadHealth()

  refreshInterval = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadHealth()
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
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Live architecture preview</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last checked: {{ formatCheckedAt }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="rounded-full bg-brand/10 px-3 py-2 text-xs font-medium text-brand">
          {{ refreshing ? 'Refreshing live data…' : 'Auto-refresh every 45s' }}
        </div>
        <button
          class="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="refreshing"
          @click="loadHealth"
        >
          {{ refreshing ? 'Refreshing...' : 'Refresh health' }}
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading system architecture and health...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in healthSummary"
          :key="item.label"
          class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
          <p class="mt-3 text-3xl font-semibold" :class="item.tone">{{ item.value }}</p>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Current live service count.</p>
        </article>
      </section>

      <AdminPanelCard title="System architecture" subtitle="Real live topology across the shared backend, payment workers, storage, media, web, and mobile." badge="Live topology" accent>
        <AdminSystemArchitectureCanvas :services="serviceCards" />
      </AdminPanelCard>

      <section class="grid gap-4 xl:grid-cols-2">
        <article
          v-for="service in serviceCards"
          :key="service.id"
          class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm uppercase tracking-[0.2em] text-slate-400">{{ service.kind }}</p>
              <h3 class="mt-1 text-lg font-semibold">{{ service.name }}</h3>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium" :class="statusTextClass(service.status)">
              <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(service.status)"></span>
              {{ formatStatus(service.status) }}
            </div>
          </div>

          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ service.description }}</p>

          <div class="mt-4 grid gap-2 sm:grid-cols-2">
            <div class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Status code</p>
              <p class="mt-1 text-sm font-medium">{{ service.statusCode ?? '—' }}</p>
            </div>
            <div class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Latency</p>
              <p class="mt-1 text-sm font-medium">{{ service.latencyMs !== null ? `${service.latencyMs} ms` : '—' }}</p>
            </div>
          </div>

          <div class="mt-2 rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Details</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ service.details }}</p>
          </div>

          <div v-if="service.url" class="mt-2 rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Endpoint</p>
            <p class="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">{{ service.url }}</p>
          </div>

          <div v-if="getServiceAction(service)" class="mt-4">
            <a
              v-if="getServiceAction(service)?.external"
              :href="getServiceAction(service)?.href"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95"
            >
              {{ getServiceAction(service)?.label }}
            </a>
            <NuxtLink
              v-else
              :to="getServiceAction(service)?.href || '/system'"
              class="inline-flex items-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95"
            >
              {{ getServiceAction(service)?.label }}
            </NuxtLink>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>
