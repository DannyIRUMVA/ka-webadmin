<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const stats = [
  {
    label: 'Today revenue',
    value: 'RWF 8.4M',
    change: '+12.8%',
    tone: 'Up from yesterday',
    accent: 'bg-brand/15 text-brand'
  },
  {
    label: 'Orders in progress',
    value: '1,248',
    change: '+64',
    tone: 'Strong lunch traffic',
    accent: 'bg-emerald-500/15 text-emerald-500'
  },
  {
    label: 'Pending approvals',
    value: '18',
    change: 'Needs review',
    tone: '7 restaurants, 11 payouts',
    accent: 'bg-sky-500/15 text-sky-500'
  },
  {
    label: 'Open support cases',
    value: '34',
    change: '-9%',
    tone: 'Resolution speed improving',
    accent: 'bg-violet-500/15 text-violet-500'
  }
]

const branches = [
  {
    name: 'Kigali Central',
    manager: 'Alice Mukamana',
    orders: '432 orders',
    progress: '84%',
    revenue: 'RWF 2.1M',
    status: 'Healthy'
  },
  {
    name: 'Remera Hub',
    manager: 'Eric Niyomugabo',
    orders: '317 orders',
    progress: '72%',
    revenue: 'RWF 1.6M',
    status: 'Busy'
  },
  {
    name: 'Kacyiru Express',
    manager: 'Sandrine Uwase',
    orders: '289 orders',
    progress: '68%',
    revenue: 'RWF 1.2M',
    status: 'Stable'
  },
  {
    name: 'Nyamirambo Market',
    manager: 'Jean Claude',
    orders: '210 orders',
    progress: '56%',
    revenue: 'RWF 940K',
    status: 'Watchlist'
  }
]

const approvals = [
  {
    title: 'Vendor onboarding',
    subtitle: '3 restaurants waiting for compliance review',
    action: 'Review now'
  },
  {
    title: 'Driver payouts',
    subtitle: '11 weekly transfers above the instant threshold',
    action: 'Approve batch'
  },
  {
    title: 'Refund queue',
    subtitle: '4 customer refunds need finance confirmation',
    action: 'Check cases'
  }
]

const activity = [
  {
    title: 'New restaurant activated',
    meta: 'Biryogo Kitchen • 8 minutes ago',
    tag: 'Growth'
  },
  {
    title: 'Escalated support ticket resolved',
    meta: 'Order #KKF-2019 • 16 minutes ago',
    tag: 'Support'
  },
  {
    title: 'Daily payout report generated',
    meta: 'Finance workspace • 42 minutes ago',
    tag: 'Finance'
  },
  {
    title: 'Promotional banner scheduled',
    meta: 'Weekend combo campaign • 1 hour ago',
    tag: 'Marketing'
  }
]

const quickActions = [
  'Add a new vendor',
  'Open incident center',
  'Schedule campaign banner',
  'Export finance snapshot'
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
      <div class="overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="inline-flex rounded-full border border-brand/30 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-brand dark:bg-black/20">
              UI concept only
            </p>
            <h3 class="mt-5 text-3xl font-semibold tracking-tight">A clean admin home built around focus, flow, and warm brand energy.</h3>
            <p class="mt-4 max-w-xl text-sm leading-7 text-muted-light dark:text-muted-dark">
              This starter dashboard gives Kakofi a modern web admin shell with a strong primary color, readable data cards, and a comfortable theme system ready for future API integrations.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-sm dark:border-white/5 dark:bg-black/20">
              <p class="text-sm text-muted-light dark:text-muted-dark">Live territories</p>
              <p class="mt-2 text-2xl font-semibold">12 districts</p>
            </div>
            <div class="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-sm dark:border-white/5 dark:bg-black/20">
              <p class="text-sm text-muted-light dark:text-muted-dark">Customer satisfaction</p>
              <p class="mt-2 text-2xl font-semibold">94.2%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Quick actions</p>
            <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">Common admin shortcuts for daily use.</p>
          </div>
          <div class="h-10 w-10 rounded-2xl bg-brand/15"></div>
        </div>

        <div class="mt-6 space-y-3">
          <button
            v-for="action in quickActions"
            :key="action"
            class="flex w-full items-center justify-between rounded-2xl border border-line-light bg-soft-light px-4 py-3 text-left text-sm transition hover:border-brand/20 hover:bg-brand/10 dark:border-line-dark dark:bg-soft-dark dark:hover:bg-brand/10"
          >
            <span>{{ action }}</span>
            <span class="text-brand">→</span>
          </button>
        </div>
      </div>
    </section>

    <section class="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <article
        v-for="card in stats"
        :key="card.label"
        class="rounded-[1.75rem] border border-line-light bg-panel-light p-5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 dark:border-line-dark dark:bg-panel-dark dark:shadow-black/20"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-muted-light dark:text-muted-dark">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-semibold tracking-tight">{{ card.value }}</p>
          </div>
          <span :class="['rounded-2xl px-3 py-1 text-xs font-medium', card.accent]">{{ card.change }}</span>
        </div>
        <p class="mt-4 text-sm text-muted-light dark:text-muted-dark">{{ card.tone }}</p>
      </article>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.6fr_1fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-xl font-semibold">Branch performance</h3>
            <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">Snapshot of high-volume locations across the Kakofi network.</p>
          </div>
          <div class="rounded-2xl bg-soft-light px-4 py-2 text-sm text-muted-light dark:bg-soft-dark dark:text-muted-dark">
            Updated 2 minutes ago
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <article
            v-for="branch in branches"
            :key="branch.name"
            class="grid gap-4 rounded-[1.75rem] border border-line-light bg-soft-light p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center dark:border-line-dark dark:bg-soft-dark"
          >
            <div>
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-sm font-semibold text-brand">
                  {{ branch.name.charAt(0) }}
                </div>
                <div>
                  <h4 class="font-medium">{{ branch.name }}</h4>
                  <p class="text-sm text-muted-light dark:text-muted-dark">{{ branch.manager }} • {{ branch.orders }}</p>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-light dark:text-muted-dark">Fulfilment score</span>
                <span class="font-medium">{{ branch.progress }}</span>
              </div>
              <div class="mt-2 h-2 rounded-full bg-black/6 dark:bg-white/10">
                <div class="h-2 rounded-full bg-brand" :style="{ width: branch.progress }"></div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 md:block md:text-right">
              <div>
                <p class="text-sm text-muted-light dark:text-muted-dark">Revenue</p>
                <p class="mt-1 font-semibold">{{ branch.revenue }}</p>
              </div>
              <span class="mt-2 inline-flex rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                {{ branch.status }}
              </span>
            </div>
          </article>
        </div>
      </div>

      <div class="space-y-4">
        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold">Approval queue</h3>
              <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">Priority items that need admin attention.</p>
            </div>
            <span class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">18 open</span>
          </div>

          <div class="mt-5 space-y-3">
            <article
              v-for="item in approvals"
              :key="item.title"
              class="rounded-[1.5rem] border border-line-light bg-soft-light p-4 dark:border-line-dark dark:bg-soft-dark"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h4 class="font-medium">{{ item.title }}</h4>
                  <p class="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">{{ item.subtitle }}</p>
                </div>
                <button class="whitespace-nowrap rounded-2xl bg-brand px-3 py-2 text-xs font-semibold text-black">
                  {{ item.action }}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold">Recent activity</h3>
              <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">A simple timeline for the latest platform movement.</p>
            </div>
            <span class="rounded-full bg-soft-light px-3 py-1 text-xs text-muted-light dark:bg-soft-dark dark:text-muted-dark">Today</span>
          </div>

          <div class="mt-6 space-y-5">
            <article v-for="item in activity" :key="item.title" class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="h-3 w-3 rounded-full bg-brand"></div>
                <div class="mt-2 h-full w-px bg-line-light dark:bg-line-dark"></div>
              </div>
              <div class="pb-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-medium">{{ item.title }}</h4>
                  <span class="rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand">{{ item.tag }}</span>
                </div>
                <p class="mt-2 text-sm text-muted-light dark:text-muted-dark">{{ item.meta }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
