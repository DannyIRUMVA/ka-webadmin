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

const { onAction } = useAdminPageActions()

const loading = ref(true)
const refreshing = ref(false)
const errorMessage = ref<string | null>(null)
const payload = ref<HealthPayload | null>(null)

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

const architectureNodes = computed(() => {
  const services = payload.value?.services ?? []
  const find = (id: string) => services.find(service => service.id === id)

  return {
    supabase: find('supabase'),
    stripe: find('stripe-worker'),
    localPayment: find('local-payment-worker'),
    r2: find('r2-uploader-worker'),
    mux: find('mux'),
    web: find('web-platform'),
    mobile: find('mobile-platform')
  }
})

const serviceCards = computed(() => payload.value?.services ?? [])

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

onMounted(() => {
  loadHealth()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Live architecture preview</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last checked: {{ formatCheckedAt }}</p>
      </div>

      <button
        class="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="refreshing"
        @click="loadHealth"
      >
        {{ refreshing ? 'Refreshing...' : 'Refresh health' }}
      </button>
    </div>

    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading system architecture and health...
    </div>

    <template v-else>
      <section class="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#111214]">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold">System architecture</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Central backend with connected payment, storage, media, web, and mobile systems.</p>
          </div>
          <div class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">Live topology</div>
        </div>

        <div class="mt-6 hidden lg:block">
          <div class="relative mx-auto h-[520px] max-w-6xl">
            <div class="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20 bg-brand/5 dark:border-brand/20 dark:bg-brand/5"></div>
            <div class="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/30 bg-white shadow-[0_0_80px_rgba(252,177,22,0.18)] dark:border-brand/30 dark:bg-[#111214]"></div>
            <div class="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand bg-white dark:border-brand dark:bg-[#111214]"></div>
            <div class="absolute left-1/2 top-[39%] flex h-5 w-5 -translate-x-[58px] -translate-y-1/2 rounded-full bg-brand"></div>
            <div class="absolute left-1/2 top-[39%] flex h-5 w-5 translate-x-[38px] -translate-y-1/2 rounded-full bg-brand"></div>
            <div class="absolute left-1/2 top-[54%] h-3 w-20 -translate-x-1/2 rounded-full bg-brand"></div>
            <div class="absolute left-1/2 top-[69%] -translate-x-1/2 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Core backend</p>
              <p class="mt-2 text-2xl font-semibold">Supabase</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Database, auth, API, and shared platform state.</p>
              <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-white/5" :class="statusTextClass(architectureNodes.supabase?.status || 'offline')">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.supabase?.status || 'offline')"></span>
                {{ formatStatus(architectureNodes.supabase?.status || 'offline') }}
              </div>
            </div>

            <div class="absolute left-1/2 top-1/2 h-px w-[180px] -translate-y-1/2 -translate-x-[270px] bg-slate-300 dark:bg-white/10"></div>
            <div class="absolute left-1/2 top-1/2 h-px w-[180px] -translate-y-1/2 translate-x-[90px] bg-slate-300 dark:bg-white/10"></div>
            <div class="absolute left-1/2 top-1/2 w-px h-[140px] -translate-x-1/2 -translate-y-[240px] bg-slate-300 dark:bg-white/10"></div>
            <div class="absolute left-1/2 top-1/2 w-px h-[140px] -translate-x-1/2 translate-y-[100px] bg-slate-300 dark:bg-white/10"></div>
            <div class="absolute left-1/2 top-1/2 h-px w-[150px] -translate-y-[150px] translate-x-[70px] rotate-[30deg] bg-slate-300 dark:bg-white/10"></div>
            <div class="absolute left-1/2 top-1/2 h-px w-[150px] translate-x-[70px] translate-y-[150px] -rotate-[30deg] bg-slate-300 dark:bg-white/10"></div>

            <div class="absolute left-8 top-1/2 w-52 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0f1012]">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium">Web platform</p>
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.web?.status || 'offline')"></span>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Consumes Supabase, Workers, R2, and Mux over HTTPS.</p>
            </div>

            <div class="absolute right-8 top-1/2 w-52 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0f1012]">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium">Mobile platform</p>
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.mobile?.status || 'offline')"></span>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Shares backend, payment, and content services with web.</p>
            </div>

            <div class="absolute left-1/2 top-6 w-56 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-[#0f1012]">
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">S</div>
              <p class="mt-3 font-medium">Stripe worker</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Card payment orchestration.</p>
              <div class="mt-2 inline-flex items-center gap-2 text-xs font-medium" :class="statusTextClass(architectureNodes.stripe?.status || 'offline')">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.stripe?.status || 'offline')"></span>
                {{ formatStatus(architectureNodes.stripe?.status || 'offline') }}
              </div>
            </div>

            <div class="absolute right-24 top-20 w-56 rounded-3xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-[#0f1012]">
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">L</div>
              <p class="mt-3 font-medium">Local payment worker</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Rwandan local payment integration.</p>
              <div class="mt-2 inline-flex items-center gap-2 text-xs font-medium" :class="statusTextClass(architectureNodes.localPayment?.status || 'offline')">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.localPayment?.status || 'offline')"></span>
                {{ formatStatus(architectureNodes.localPayment?.status || 'offline') }}
              </div>
            </div>

            <div class="absolute right-24 bottom-20 w-56 rounded-3xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-[#0f1012]">
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">R2</div>
              <p class="mt-3 font-medium">R2 uploader worker</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Small-file upload and storage path.</p>
              <div class="mt-2 inline-flex items-center gap-2 text-xs font-medium" :class="statusTextClass(architectureNodes.r2?.status || 'offline')">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.r2?.status || 'offline')"></span>
                {{ formatStatus(architectureNodes.r2?.status || 'offline') }}
              </div>
            </div>

            <div class="absolute left-1/2 bottom-6 w-56 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-[#0f1012]">
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-black">M</div>
              <p class="mt-3 font-medium">Mux media layer</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Large-file media processing and delivery.</p>
              <div class="mt-2 inline-flex items-center gap-2 text-xs font-medium" :class="statusTextClass(architectureNodes.mux?.status || 'offline')">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(architectureNodes.mux?.status || 'offline')"></span>
                {{ formatStatus(architectureNodes.mux?.status || 'offline') }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-3 lg:hidden">
          <div
            v-for="service in serviceCards"
            :key="service.id"
            class="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium">{{ service.name }}</p>
              <div class="inline-flex items-center gap-2 text-xs font-medium" :class="statusTextClass(service.status)">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(service.status)"></span>
                {{ formatStatus(service.status) }}
              </div>
            </div>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ service.description }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-2">
        <article
          v-for="service in serviceCards"
          :key="service.id"
          class="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#111214]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ service.kind }}</p>
              <h3 class="mt-1 text-lg font-semibold">{{ service.name }}</h3>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-white/5" :class="statusTextClass(service.status)">
              <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(service.status)"></span>
              {{ formatStatus(service.status) }}
            </div>
          </div>

          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ service.description }}</p>

          <div class="mt-4 grid gap-2 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Status code</p>
              <p class="mt-1 text-sm font-medium">{{ service.statusCode ?? '—' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Latency</p>
              <p class="mt-1 text-sm font-medium">{{ service.latencyMs !== null ? `${service.latencyMs} ms` : '—' }}</p>
            </div>
          </div>

          <div class="mt-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Details</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ service.details }}</p>
          </div>

          <div v-if="service.url" class="mt-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Endpoint</p>
            <p class="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">{{ service.url }}</p>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>
