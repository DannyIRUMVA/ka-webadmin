<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const cards = [
  { label: 'Gross volume', value: 'RWF 42.8M', note: 'This week' },
  { label: 'Pending payouts', value: 'RWF 6.3M', note: 'Due in next settlement' },
  { label: 'Platform margin', value: '13.9%', note: 'After incentive adjustments' }
]

const streams = [
  { name: 'Food orders', amount: 'RWF 31.2M', width: '78%' },
  { name: 'Delivery fees', amount: 'RWF 7.4M', width: '52%' },
  { name: 'Promotions', amount: 'RWF 4.2M', width: '34%' }
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 md:grid-cols-3">
      <article v-for="card in cards" :key="card.label" class="rounded-[1.75rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <p class="text-sm text-muted-light dark:text-muted-dark">{{ card.label }}</p>
        <p class="mt-3 text-3xl font-semibold">{{ card.value }}</p>
        <p class="mt-2 text-sm text-muted-light dark:text-muted-dark">{{ card.note }}</p>
      </article>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.45fr_1fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Revenue streams</h3>
          <div class="rounded-2xl bg-soft-light px-4 py-2 text-sm dark:bg-soft-dark">Week 24</div>
        </div>

        <div class="mt-6 space-y-5">
          <article v-for="stream in streams" :key="stream.name" class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
            <div class="flex items-center justify-between text-sm">
              <span>{{ stream.name }}</span>
              <span class="font-medium">{{ stream.amount }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-black/6 dark:bg-white/10">
              <div class="h-2 rounded-full bg-brand" :style="{ width: stream.width }"></div>
            </div>
          </article>
        </div>
      </div>

      <div class="space-y-4">
        <section class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
          <p class="text-xs uppercase tracking-[0.28em] text-brand">Settlement status</p>
          <h3 class="mt-4 text-2xl font-semibold">Next payout batch scheduled for Friday 4:00 PM.</h3>
          <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
            11 transfers require review before release and 3 bank verifications are still pending.
          </p>
        </section>

        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Finance checklist</h3>
          <div class="mt-5 space-y-3 text-sm">
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">Approve large vendor payouts</div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">Review refund ledger anomalies</div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">Export weekly reconciliation pack</div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
