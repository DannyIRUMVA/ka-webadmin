<script setup lang="ts">
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

type ServiceAction = {
  href: string
  label: string
  external?: boolean
}

const props = withDefaults(defineProps<{
  services: ServiceCheck[]
  compact?: boolean
}>(), {
  compact: false
})

const findService = (id: string) => props.services.find(service => service.id === id)

const core = computed(() => findService('supabase'))

const clients = computed(() => {
  const order = ['web-platform', 'mobile-platform']
  return order.map(id => findService(id)).filter(Boolean) as ServiceCheck[]
})

const integrations = computed(() => {
  const order = ['stripe-worker', 'local-payment-worker', 'r2-uploader-worker', 'mux']
  return order.map(id => findService(id)).filter(Boolean) as ServiceCheck[]
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
const compactSpacing = computed(() => props.compact ? 'gap-3' : 'gap-4')

const getServiceAction = (service?: ServiceCheck | null): ServiceAction | null => {
  if (!service) {
    return null
  }

  if (service.id === 'web-platform') {
    return { href: '/dashboard', label: 'Open dashboard' }
  }

  if (service.id === 'mobile-platform') {
    return { href: '/audience', label: 'Open audience' }
  }

  if (service.id === 'supabase' && service.url) {
    return { href: service.url, label: 'Open endpoint', external: true }
  }

  if (service.url) {
    return { href: service.url, label: 'Open endpoint', external: true }
  }

  return { href: '/system', label: 'Open system page' }
}
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
      <div class="connector-line connector-line-left"></div>
      <div class="connector-line connector-line-right"></div>
      <div class="connector-branch connector-branch-left"></div>
      <div class="connector-branch connector-branch-right"></div>
      <div class="connector-pulse connector-pulse-left"></div>
      <div class="connector-pulse connector-pulse-right"></div>
      <div class="connector-node connector-node-left"></div>
      <div class="connector-node connector-node-center"></div>
      <div class="connector-node connector-node-right"></div>
    </div>

    <div :class="['grid items-stretch', compact ? 'gap-4 xl:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]' : 'gap-5 xl:grid-cols-[minmax(0,1fr)_360px_minmax(0,1fr)]']">
      <section :class="['order-2 xl:order-1 xl:relative xl:py-4', compactSpacing]">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Client surfaces</p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Web and mobile consume the same shared backend.</p>
        </div>

        <div class="pointer-events-none absolute bottom-4 right-2 top-[76px] hidden w-px bg-brand/30 xl:block"></div>

        <div class="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <article
            v-for="service in clients"
            :key="service.id"
            :title="service.description"
            class="group relative rounded-[1.75rem] border border-brand/20 bg-brand/5 p-3.5 dark:border-brand/20 dark:bg-brand/5 xl:mr-6"
          >
            <div class="pointer-events-none absolute right-[-24px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-brand/50 xl:block"></div>
            <div class="pointer-events-none absolute right-[-28px] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_14px_rgba(252,177,22,0.45)] xl:block"></div>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">{{ service.name }}</p>
              </div>
              <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" :class="statusClass(service.status)"></span>
            </div>
            <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium dark:bg-[#111214]" :class="statusTextClass(service.status)">
              <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(service.status)"></span>
              {{ formatStatus(service.status) }}
            </div>
            <div v-if="getServiceAction(service)" class="mt-3">
              <a
                v-if="getServiceAction(service)?.external"
                :href="getServiceAction(service)?.href"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center rounded-2xl bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:bg-[#111214] dark:text-slate-200 dark:hover:bg-white/10"
              >
                {{ getServiceAction(service)?.label }}
              </a>
              <NuxtLink
                v-else
                :to="getServiceAction(service)?.href || '/system'"
                class="inline-flex items-center rounded-2xl bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:bg-[#111214] dark:text-slate-200 dark:hover:bg-white/10"
              >
                {{ getServiceAction(service)?.label }}
              </NuxtLink>
            </div>
            <div class="pointer-events-none absolute left-4 right-4 top-full z-20 mt-2 rounded-2xl border border-brand/20 bg-white/95 px-3 py-2 text-xs text-slate-600 opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-[#111214]/95 dark:text-slate-300">
              {{ service.description }}
            </div>
          </article>
        </div>
      </section>

      <section class="order-1 xl:order-2 flex items-center justify-center">
        <div class="group relative w-full overflow-hidden rounded-[2rem] border border-brand/25 bg-gradient-to-b from-brand/10 via-white to-white px-5 py-8 text-center dark:from-brand/10 dark:via-[#111214] dark:to-[#111214]" :class="compact ? 'min-h-[280px]' : 'min-h-[340px]'" title="Database, auth, API, subscriptions, and shared platform state.">
          <div class="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15 bg-brand/5 blur-2xl"></div>
          <div class="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20 orbital-ring"></div>
          <div class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40 bg-white shadow-[0_0_60px_rgba(252,177,22,0.16)] dark:bg-[#111214]"></div>

          <div class="relative z-10 mx-auto flex max-w-[240px] flex-col items-center justify-center pt-20">
            <div class="relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-brand/40 bg-white/80 shadow-[0_0_28px_rgba(252,177,22,0.22)] dark:bg-[#0f1012]/90">
              <div class="absolute -top-2 h-3.5 w-1 rounded-full bg-brand"></div>
              <div class="absolute -top-3 h-2.5 w-2.5 rounded-full bg-brand"></div>
              <div class="absolute top-[20px] left-[16px] h-2.5 w-2.5 rounded-full bg-brand"></div>
              <div class="absolute top-[20px] right-[16px] h-2.5 w-2.5 rounded-full bg-brand"></div>
              <div class="absolute bottom-[16px] left-1/2 h-2 w-7 -translate-x-1/2 rounded-full bg-brand"></div>
            </div>
            <div class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium dark:bg-[#0f1012]" :class="statusTextClass(core?.status || 'offline')">
              <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(core?.status || 'offline')"></span>
              {{ formatStatus(core?.status || 'offline') }}
            </div>
            <div v-if="getServiceAction(core)" class="mt-4">
              <a
                v-if="getServiceAction(core)?.external"
                :href="getServiceAction(core)?.href"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center rounded-2xl bg-brand px-4 py-2 text-xs font-semibold text-black transition hover:brightness-95"
              >
                {{ getServiceAction(core)?.label }}
              </a>
              <NuxtLink
                v-else
                :to="getServiceAction(core)?.href || '/system'"
                class="inline-flex items-center rounded-2xl bg-brand px-4 py-2 text-xs font-semibold text-black transition hover:brightness-95"
              >
                {{ getServiceAction(core)?.label }}
              </NuxtLink>
            </div>
            <div class="pointer-events-none absolute left-1/2 top-6 z-20 w-[220px] -translate-x-1/2 rounded-2xl border border-brand/20 bg-white/95 px-3 py-2 text-xs text-slate-600 opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-[#111214]/95 dark:text-slate-300">
              Database, auth, API, subscriptions, and shared platform state.
            </div>
          </div>
        </div>
      </section>

      <section :class="['order-3 xl:relative xl:py-4', compactSpacing]">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Connected services</p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Payments, storage, and media integrate around the core backend.</p>
        </div>

        <div class="pointer-events-none absolute bottom-4 left-2 top-[76px] hidden w-px bg-brand/30 xl:block"></div>

        <div class="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <article
            v-for="service in integrations"
            :key="service.id"
            :title="service.description"
            class="group relative rounded-[1.75rem] border border-brand/20 bg-white p-3.5 dark:border-brand/20 dark:bg-[#111214] xl:ml-6"
          >
            <div class="pointer-events-none absolute left-[-24px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-brand/50 xl:block"></div>
            <div class="pointer-events-none absolute left-[-28px] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_14px_rgba(252,177,22,0.45)] xl:block"></div>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">{{ service.name }}</p>
              </div>
              <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" :class="statusClass(service.status)"></span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <div class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium" :class="statusTextClass(service.status)">
                <span class="h-2.5 w-2.5 rounded-full" :class="statusClass(service.status)"></span>
                {{ formatStatus(service.status) }}
              </div>
              <div v-if="service.latencyMs !== null" class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                {{ service.latencyMs }} ms
              </div>
            </div>

            <div v-if="getServiceAction(service)" class="mt-3">
              <a
                v-if="getServiceAction(service)?.external"
                :href="getServiceAction(service)?.href"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center rounded-2xl bg-brand px-3 py-2 text-[11px] font-semibold text-black transition hover:brightness-95"
              >
                {{ getServiceAction(service)?.label }}
              </a>
              <NuxtLink
                v-else
                :to="getServiceAction(service)?.href || '/system'"
                class="inline-flex items-center rounded-2xl bg-brand px-3 py-2 text-[11px] font-semibold text-black transition hover:brightness-95"
              >
                {{ getServiceAction(service)?.label }}
              </NuxtLink>
            </div>
            <div class="pointer-events-none absolute left-4 right-4 top-full z-20 mt-2 rounded-2xl border border-brand/20 bg-white/95 px-3 py-2 text-xs text-slate-600 opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-[#111214]/95 dark:text-slate-300">
              {{ service.description }}
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.connector-line,
.connector-branch {
  position: absolute;
  background: linear-gradient(90deg, rgba(252, 177, 22, 0.05), rgba(252, 177, 22, 0.8), rgba(252, 177, 22, 0.05));
  background-size: 200% 100%;
  animation: connectorFlow 4s linear infinite;
  opacity: 0.9;
}

.connector-line {
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}

.connector-line-left {
  left: 23%;
  width: 18%;
}

.connector-line-right {
  right: 23%;
  width: 18%;
}

.connector-branch {
  width: 2px;
  height: 36%;
  top: 32%;
  background: linear-gradient(180deg, rgba(252, 177, 22, 0.05), rgba(252, 177, 22, 0.8), rgba(252, 177, 22, 0.05));
  background-size: 100% 200%;
}

.connector-branch-left {
  left: 23%;
}

.connector-branch-right {
  right: 23%;
}

.connector-pulse,
.connector-node {
  position: absolute;
  border-radius: 9999px;
}

.connector-pulse {
  top: calc(50% - 5px);
  width: 10px;
  height: 10px;
  background: rgba(252, 177, 22, 0.95);
  box-shadow: 0 0 0 0 rgba(252, 177, 22, 0.55);
  animation: connectorPulse 2.2s ease-in-out infinite;
}

.connector-pulse-left {
  left: 34%;
}

.connector-pulse-right {
  right: 34%;
}

.connector-node {
  width: 12px;
  height: 12px;
  background: rgba(252, 177, 22, 1);
  box-shadow: 0 0 24px rgba(252, 177, 22, 0.6);
}

.connector-node-left {
  left: calc(23% - 5px);
  top: calc(50% - 6px);
}

.connector-node-center {
  left: calc(50% - 6px);
  top: calc(50% - 6px);
}

.connector-node-right {
  right: calc(23% - 5px);
  top: calc(50% - 6px);
}

.orbital-ring {
  animation: orbitalDrift 7s ease-in-out infinite;
}

@keyframes connectorFlow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes connectorPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(252, 177, 22, 0.45);
  }
  50% {
    transform: scale(1.18);
    box-shadow: 0 0 0 10px rgba(252, 177, 22, 0);
  }
}

@keyframes orbitalDrift {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
}
</style>
